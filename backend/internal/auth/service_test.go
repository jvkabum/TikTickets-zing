package auth

import (
	"context"
	"errors"
	"testing"

	"github.com/tiktickets/backend-go/internal/queues"
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
func (m *mockUserRepository) GetUserQueues(ctx context.Context, userID uint) ([]queues.Queue, error) {
	if m.user != nil {
		return m.user.Queues, nil
	}
	return []queues.Queue{}, nil
}
func (m *mockUserRepository) SetUserQueues(ctx context.Context, userID uint, queueIDs []uint) error {
	if m.user != nil {
		m.user.Queues = make([]queues.Queue, 0)
		for _, qID := range queueIDs {
			m.user.Queues = append(m.user.Queues, queues.Queue{ID: qID, Name: "Fila", Queue: "Fila"})
		}
	}
	return nil
}

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

func TestUserService_UpdateQueues(t *testing.T) {
	userRepo := &mockUserRepository{
		user: &User{
			ID:       1,
			Email:    "admin@test.com",
			Profile:  "admin",
			TenantID: 1,
			Queues:   []queues.Queue{},
		},
	}
	tenantRepo := &mockTenantRepository{
		tenant: &tenant.Tenant{ID: 1, Status: "active"},
	}

	svc := NewUserService(userRepo, tenantRepo)

	queueIDs := []uint{5, 10}
	updated, err := svc.Update(context.Background(), 1, 1, "admin", 1, UpdateUserDTO{
		QueueIDs: &queueIDs,
	})
	if err != nil {
		t.Fatalf("erro inesperado ao atualizar filas do usuário: %v", err)
	}

	if len(updated.Queues) != 2 {
		t.Fatalf("esperava 2 filas vinculadas, recebeu %d", len(updated.Queues))
	}
}

