package auth

import (
	"context"
	"errors"
	"testing"

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
func (m *mockUserRepository) Create(ctx context.Context, user *User) error { return nil }
func (m *mockUserRepository) Update(ctx context.Context, user *User) error { return nil }
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
	user, err := service.Authenticate(context.Background(), "admin@test.com", "123456")

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
	user, err := service.Authenticate(context.Background(), "admin@test.com", "123456")

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
	user, err := service.Authenticate(context.Background(), "admin@test.com", "wrongpass")

	if err == nil || errors.Is(err, bcrypt.ErrMismatchedHashAndPassword) {
		t.Fatalf("expected invalid credentials error, got %v", err)
	}
	if user != nil {
		t.Fatalf("expected nil user, got %v", user)
	}
}
