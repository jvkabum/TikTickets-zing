package auth

import (
	"context"
	"errors"
	"log"

	"github.com/tiktickets/backend-go/internal/tenant"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	repo       Repository
	tenantRepo tenant.Repository
}

func NewAuthService(repo Repository, tenantRepo tenant.Repository) *AuthService {
	return &AuthService{
		repo:       repo,
		tenantRepo: tenantRepo,
	}
}

// Authenticate - Valida credenciais e checa a regra BR-MIGRAR-002: Bloqueio de login para Tenant inativo
func (s *AuthService) Authenticate(ctx context.Context, email, password string) (*User, *tenant.Tenant, error) {
	// Buscar usuário no repo
	user, err := s.repo.GetByEmail(ctx, email)
	if err != nil {
		log.Printf("[Auth Error] Usuário não encontrado para email '%s': %v", email, err)
		return nil, nil, errors.New("credenciais inválidas")
	}

	// Checar hash da senha
	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password))
	if err != nil {
		log.Printf("[Auth Error] Senha incorreta para o email '%s' (hash len: %d)", email, len(user.PasswordHash))
		return nil, nil, errors.New("credenciais inválidas")
	}

	// Checar Tenant
	t, err := s.tenantRepo.GetByID(ctx, user.TenantID)
	if err != nil {
		log.Printf("[Auth Error] Erro ao buscar tenant ID %d para usuário '%s': %v", user.TenantID, email, err)
		return nil, nil, errors.New("erro ao verificar tenant")
	}

	if t.Status != "active" {
		log.Printf("[Auth Error] Tenant ID %d não está ativo (status: %s)", user.TenantID, t.Status)
		return nil, nil, errors.New("tenant is inactive")
	}

	log.Printf("[Auth Success] Login realizado com sucesso para '%s' (Tenant %d)", email, user.TenantID)
	return user, t, nil
}

type UserService struct {
	repo       Repository
	tenantRepo tenant.Repository
}

func NewUserService(repo Repository, tenantRepo tenant.Repository) *UserService {
	return &UserService{repo: repo, tenantRepo: tenantRepo}
}

type CreateUserDTO struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Profile  string `json:"profile"`
}

func (s *UserService) Create(ctx context.Context, tenantID uint, actorProfile string, dto CreateUserDTO) (*User, error) {
	if actorProfile != "admin" && actorProfile != "super" {
		return nil, errors.New("forbidden: only admins or supers can create users")
	}

	if dto.Name == "" || dto.Email == "" || dto.Password == "" {
		return nil, errors.New("name, email and password are required")
	}

	if dto.Profile == "" {
		dto.Profile = "user"
	}

	if tenantID == 0 {
		tenantID = 1
	}

	// Checar limites do tenant
	if s.tenantRepo != nil {
		t, err := s.tenantRepo.GetByID(ctx, tenantID)
		if err == nil && t != nil {
			if t.Status != "active" {
				return nil, errors.New("ERR_COMPANY_NOT_ACTIVE")
			}
			if t.MaxUsers != nil && *t.MaxUsers > 0 {
				users, err := s.repo.ListByTenant(ctx, tenantID, 0, 0)
				if err == nil && len(users) >= *t.MaxUsers {
					return nil, errors.New("ERR_USER_LIMIT_USER_CREATION")
				}
			}
		}
	}

	// Checar se email já existe
	existing, _ := s.repo.GetByEmail(ctx, dto.Email)
	if existing != nil && existing.ID > 0 {
		return nil, errors.New("ERR_USER_EMAIL_EXISTS")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(dto.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	user := &User{
		Name:         dto.Name,
		Email:        dto.Email,
		PasswordHash: string(hash),
		Profile:      dto.Profile,
		TenantID:     tenantID,
		Status:       "active",
		TokenVersion: 0,
		IsOnline:     false,
	}

	if err := s.repo.Create(ctx, user); err != nil {
		return nil, err
	}
	return user, nil
}

func (s *UserService) List(ctx context.Context, tenantID uint, limit, offset int) ([]User, error) {
	return s.repo.ListByTenant(ctx, tenantID, limit, offset)
}

func (s *UserService) GetByID(ctx context.Context, tenantID uint, id uint) (*User, error) {
	return s.repo.GetByID(ctx, tenantID, id)
}

type UpdateUserDTO struct {
	Name     *string `json:"name"`
	Email    *string `json:"email"`
	Profile  *string `json:"profile"`
	Password *string `json:"password"`
}

func (s *UserService) Update(ctx context.Context, tenantID uint, actorID uint, actorProfile string, targetID uint, dto UpdateUserDTO) (*User, error) {
	if actorProfile != "admin" && actorProfile != "super" && actorID != targetID {
		return nil, errors.New("forbidden: you can only update yourself unless admin or super")
	}

	user, err := s.repo.GetByID(ctx, tenantID, targetID)
	if err != nil {
		return nil, err
	}

	// Regra Modo Demo: Bloqueia alteração de login (email), senha ou rebaixamento de perfil do admin
	if actorProfile != "super" && s.tenantRepo != nil {
		t, err := s.tenantRepo.GetByID(ctx, tenantID)
		if err == nil && t != nil && t.IsDemo {
			if user.Profile == "admin" {
				if dto.Email != nil && *dto.Email != user.Email {
					return nil, errors.New("ERR_DEMO_MODE_ADMIN_CHANGE_NOT_ALLOWED")
				}
				if dto.Password != nil && *dto.Password != "" {
					return nil, errors.New("ERR_DEMO_MODE_ADMIN_CHANGE_NOT_ALLOWED")
				}
				if dto.Profile != nil && *dto.Profile != "admin" {
					return nil, errors.New("ERR_DEMO_MODE_ADMIN_CHANGE_NOT_ALLOWED")
				}
			}
		}
	}

	if dto.Name != nil {
		user.Name = *dto.Name
	}
	if dto.Email != nil {
		user.Email = *dto.Email
	}
	if dto.Profile != nil && (actorProfile == "admin" || actorProfile == "super") {
		user.Profile = *dto.Profile
	}
	if dto.Password != nil && *dto.Password != "" {
		hash, err := bcrypt.GenerateFromPassword([]byte(*dto.Password), bcrypt.DefaultCost)
		if err == nil {
			user.PasswordHash = string(hash)
		}
	}

	if err := s.repo.Update(ctx, user); err != nil {
		return nil, err
	}
	return user, nil
}

func (s *UserService) UpdateConfigs(ctx context.Context, tenantID uint, targetID uint, configs string) error {
	user, err := s.repo.GetByID(ctx, tenantID, targetID)
	if err != nil {
		return err
	}
	user.Configs = configs
	return s.repo.Update(ctx, user)
}

// Delete - Regra BR-MIGRAR-004: Bloqueio de deleção de usuário com tickets abertos e empresa demo
func (s *UserService) Delete(ctx context.Context, tenantID uint, actorProfile string, targetID uint, hasOpenTickets bool) error {
	if actorProfile != "admin" && actorProfile != "super" {
		return errors.New("forbidden: only admins or supers can delete users")
	}

	if actorProfile != "super" && s.tenantRepo != nil {
		t, err := s.tenantRepo.GetByID(ctx, tenantID)
		if err == nil && t != nil && t.IsDemo {
			return errors.New("ERR_DEMO_MODE_DELETE_NOT_ALLOWED")
		}
	}

	if hasOpenTickets {
		return errors.New("cannot delete user with open tickets")
	}

	user, err := s.repo.GetByID(ctx, tenantID, targetID)
	if err != nil {
		return err
	}

	if user.Profile == "admin" {
		count, _ := s.repo.CountAdminsByTenant(ctx, tenantID)
		if count <= 1 {
			return errors.New("cannot delete the last admin of the tenant")
		}
	}

	return s.repo.Delete(ctx, targetID)
}
