package auth

import (
	"context"
	"errors"
	"strings"
	"testing"

	"github.com/tiktickets/backend-go/internal/settings"
	"github.com/tiktickets/backend-go/internal/tenant"
	"golang.org/x/crypto/bcrypt"
)

// MockUserRepository
type mockUserRepository struct {
	user *User
	err  error
}

func (m *mockUserRepository) GetByEmail(ctx context.Context, email string) (*User, error) {
	return m.user, m.err
}
func (m *mockUserRepository) GetByID(ctx context.Context, tenantID uint, id uint) (*User, error) {
	return m.user, m.err
}
func (m *mockUserRepository) ListByTenant(ctx context.Context, tenantID uint, limit int, offset int) ([]User, error) {
	if m.user != nil {
		return []User{*m.user}, nil
	}
	return []User{}, nil
}
func (m *mockUserRepository) CountAdminsByTenant(ctx context.Context, tenantID uint) (int64, error) {
	return 2, nil
}
func (m *mockUserRepository) Create(ctx context.Context, user *User) error { return nil }
func (m *mockUserRepository) Update(ctx context.Context, user *User) error { 
	m.user = user
	return nil 
}
func (m *mockUserRepository) Delete(ctx context.Context, id uint) error    { return nil }

// MockTenantRepository
type mockTenantRepository struct {
	tenant *tenant.Tenant
	err    error
}

func (m *mockTenantRepository) Create(ctx context.Context, t *tenant.Tenant) error { return nil }
func (m *mockTenantRepository) GetByID(ctx context.Context, id uint) (*tenant.Tenant, error) {
	return m.tenant, m.err
}
func (m *mockTenantRepository) List(ctx context.Context) ([]tenant.Tenant, error) { return nil, nil }
func (m *mockTenantRepository) Update(ctx context.Context, t *tenant.Tenant) error { return nil }
func (m *mockTenantRepository) Delete(ctx context.Context, id uint) error          { return nil }
func (m *mockTenantRepository) CreateSetting(ctx context.Context, s *settings.Setting) error { return nil }

func TestAuthenticate_Success(t *testing.T) {
	password := "123456"
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)

	userRepo := &mockUserRepository{
		user: &User{
			ID:           1,
			Email:        "admin@test.com",
			PasswordHash: string(hashedPassword),
			TenantID:     10,
		},
	}

	tenantRepo := &mockTenantRepository{
		tenant: &tenant.Tenant{
			ID:     10,
			Status: "active",
		},
	}

	service := NewAuthService(userRepo, tenantRepo)
	user, _, err := service.Authenticate(context.Background(), "admin@test.com", "123456")

	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if user == nil || user.ID != 1 {
		t.Fatalf("expected valid user, got %v", user)
	}
}

func TestAuthenticate_InactiveTenant(t *testing.T) {
	password := "123456"
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)

	userRepo := &mockUserRepository{
		user: &User{
			ID:           1,
			Email:        "admin@test.com",
			PasswordHash: string(hashedPassword),
			TenantID:     10,
		},
	}

	tenantRepo := &mockTenantRepository{
		tenant: &tenant.Tenant{
			ID:     10,
			Status: "inactive", // BR-MIGRAR-002: deve falhar
		},
	}

	service := NewAuthService(userRepo, tenantRepo)
	user, _, err := service.Authenticate(context.Background(), "admin@test.com", "123456")

	if err == nil || err.Error() != "tenant is inactive" {
		t.Fatalf("expected 'tenant is inactive' error, got %v", err)
	}
	if user != nil {
		t.Fatalf("expected nil user, got %v", user)
	}
}

func TestAuthenticate_WrongPassword(t *testing.T) {
	password := "123456"
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)

	userRepo := &mockUserRepository{
		user: &User{
			ID:           1,
			Email:        "admin@test.com",
			PasswordHash: string(hashedPassword),
			TenantID:     10,
		},
	}

	tenantRepo := &mockTenantRepository{
		tenant: &tenant.Tenant{ID: 10, Status: "active"},
	}

	service := NewAuthService(userRepo, tenantRepo)
	user, _, err := service.Authenticate(context.Background(), "admin@test.com", "wrongpass")

	if err == nil || errors.Is(err, bcrypt.ErrMismatchedHashAndPassword) {
		t.Fatalf("expected invalid credentials error, got %v", err)
	}
	if user != nil {
		t.Fatalf("expected nil user, got %v", user)
	}
}

func TestUserService_UpdateAdmin_DemoBlocked(t *testing.T) {
	userRepo := &mockUserRepository{
		user: &User{
			ID:       1,
			Email:    "admin@demo.com",
			Profile:  "admin",
			TenantID: 10,
		},
	}
	tenantRepo := &mockTenantRepository{
		tenant: &tenant.Tenant{
			ID:     10,
			Status: "active",
			IsDemo: true, // Tenant em modo demonstração
		},
	}

	svc := NewUserService(userRepo, tenantRepo)

	// 1. Tentar alterar o e-mail do admin em tenant demo -> deve falhar
	newEmail := "hacker@demo.com"
	_, err := svc.Update(context.Background(), 10, 1, "admin", 1, UpdateUserDTO{Email: &newEmail})
	if err == nil || err.Error() != "ERR_DEMO_MODE_ADMIN_CHANGE_NOT_ALLOWED" {
		t.Fatalf("esperava ERR_DEMO_MODE_ADMIN_CHANGE_NOT_ALLOWED ao tentar alterar email, recebeu: %v", err)
	}

	// 2. Tentar alterar a senha do admin em tenant demo -> deve falhar
	newPassword := "novaSenha123"
	_, err = svc.Update(context.Background(), 10, 1, "admin", 1, UpdateUserDTO{Password: &newPassword})
	if err == nil || err.Error() != "ERR_DEMO_MODE_ADMIN_CHANGE_NOT_ALLOWED" {
		t.Fatalf("esperava ERR_DEMO_MODE_ADMIN_CHANGE_NOT_ALLOWED ao tentar alterar senha, recebeu: %v", err)
	}

	// 3. Tentar alterar o perfil do admin para 'user' em tenant demo -> deve falhar
	newProfile := "user"
	_, err = svc.Update(context.Background(), 10, 1, "admin", 1, UpdateUserDTO{Profile: &newProfile})
	if err == nil || err.Error() != "ERR_DEMO_MODE_ADMIN_CHANGE_NOT_ALLOWED" {
		t.Fatalf("esperava ERR_DEMO_MODE_ADMIN_CHANGE_NOT_ALLOWED ao tentar alterar profile, recebeu: %v", err)
	}
}

func TestUserService_UpdateAdmin_SuperAllowed(t *testing.T) {
	userRepo := &mockUserRepository{
		user: &User{
			ID:       1,
			Email:    "admin@demo.com",
			Profile:  "admin",
			TenantID: 10,
		},
	}
	tenantRepo := &mockTenantRepository{
		tenant: &tenant.Tenant{
			ID:     10,
			Status: "active",
			IsDemo: true,
		},
	}

	svc := NewUserService(userRepo, tenantRepo)

	// Super Admin pode alterar dados de qualquer empresa, inclusive demo
	newEmail := "novo_admin@demo.com"
	updated, err := svc.Update(context.Background(), 10, 999, "super", 1, UpdateUserDTO{Email: &newEmail})
	if err != nil {
		t.Fatalf("super admin deveria poder alterar admin de tenant demo, erro: %v", err)
	}
	if updated.Email != "novo_admin@demo.com" {
		t.Fatalf("email deveria ter sido atualizado para super admin")
	}
}

func TestUserService_Delete_DemoBlocked(t *testing.T) {
	userRepo := &mockUserRepository{
		user: &User{
			ID:       2,
			Email:    "user@demo.com",
			Profile:  "user",
			TenantID: 10,
		},
	}
	tenantRepo := &mockTenantRepository{
		tenant: &tenant.Tenant{
			ID:     10,
			Status: "active",
			IsDemo: true,
		},
	}

	svc := NewUserService(userRepo, tenantRepo)

	// Admin da demo tentando deletar usuário da demo -> deve falhar
	err := svc.Delete(context.Background(), 10, "admin", 2, false)
	if err == nil || err.Error() != "ERR_DEMO_MODE_DELETE_NOT_ALLOWED" {
		t.Fatalf("esperava ERR_DEMO_MODE_DELETE_NOT_ALLOWED ao tentar deletar em empresa demo, recebeu: %v", err)
	}
}

func TestUserService_Create_Success(t *testing.T) {
	userRepo := &mockUserRepository{}
	tenantRepo := &mockTenantRepository{
		tenant: &tenant.Tenant{
			ID:     1,
			Status: "active",
		},
	}

	svc := NewUserService(userRepo, tenantRepo)

	created, err := svc.Create(context.Background(), 1, "admin", CreateUserDTO{
		Name:     "Novo Atendente",
		Email:    "novo@empresa.com",
		Password: "senha123",
		Profile:  "user",
	})
	if err != nil {
		t.Fatalf("esperava criar usuário com sucesso, obteve erro: %v", err)
	}
	if created.Name != "Novo Atendente" || created.Email != "novo@empresa.com" {
		t.Errorf("dados do usuário criado incorretos: %+v", created)
	}
}

func TestUserService_Create_ForbiddenNonAdmin(t *testing.T) {
	userRepo := &mockUserRepository{}
	svc := NewUserService(userRepo, nil)

	_, err := svc.Create(context.Background(), 1, "user", CreateUserDTO{
		Name:     "Tentativa",
		Email:    "tentativa@empresa.com",
		Password: "senha123",
		Profile:  "user",
	})
	if err == nil || !strings.Contains(err.Error(), "forbidden") {
		t.Fatalf("esperava erro forbidden para usuário comum, obteve: %v", err)
	}
}

func TestUserService_Create_DuplicateEmail(t *testing.T) {
	userRepo := &mockUserRepository{
		user: &User{
			ID:    5,
			Email: "jaexiste@empresa.com",
		},
	}
	svc := NewUserService(userRepo, nil)

	_, err := svc.Create(context.Background(), 1, "admin", CreateUserDTO{
		Name:     "Duplicado",
		Email:    "jaexiste@empresa.com",
		Password: "senha123",
		Profile:  "user",
	})
	if err == nil || err.Error() != "ERR_USER_EMAIL_EXISTS" {
		t.Fatalf("esperava erro ERR_USER_EMAIL_EXISTS para e-mail duplicado, obteve: %v", err)
	}
}

func TestUserService_Create_QuotaLimit(t *testing.T) {
	maxUsers := 1
	userRepo := &mockUserRepository{
		user: &User{
			ID:       1,
			Email:    "admin@empresa.com",
			TenantID: 1,
		},
	}
	tenantRepo := &mockTenantRepository{
		tenant: &tenant.Tenant{
			ID:       1,
			Status:   "active",
			MaxUsers: &maxUsers,
		},
	}

	svc := NewUserService(userRepo, tenantRepo)

	_, err := svc.Create(context.Background(), 1, "admin", CreateUserDTO{
		Name:     "Excedente",
		Email:    "excedente@empresa.com",
		Password: "senha123",
		Profile:  "user",
	})
	if err == nil || err.Error() != "ERR_USER_LIMIT_USER_CREATION" {
		t.Fatalf("esperava erro ERR_USER_LIMIT_USER_CREATION ao estourar cota, obteve: %v", err)
	}
}

