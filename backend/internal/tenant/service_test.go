package tenant

import (
	"context"
	"testing"
	"github.com/tiktickets/backend-go/internal/settings"
)

type mockTenantRepo struct {
	tenant *Tenant
	err    error
}

func (m *mockTenantRepo) Create(ctx context.Context, t *Tenant) error { 
	m.tenant = t
	return nil 
}
func (m *mockTenantRepo) GetByID(ctx context.Context, id uint) (*Tenant, error) {
	return m.tenant, m.err
}
func (m *mockTenantRepo) List(ctx context.Context) ([]Tenant, error) { return nil, nil }
func (m *mockTenantRepo) Update(ctx context.Context, t *Tenant) error { 
	m.tenant = t
	return nil 
}
func (m *mockTenantRepo) Delete(ctx context.Context, id uint) error { return nil }
func (m *mockTenantRepo) CreateSetting(ctx context.Context, s *settings.Setting) error { return nil }

func TestCheckQuota_Success(t *testing.T) {
	maxUsers := 5
	maxConnections := 2
	repo := &mockTenantRepo{
		tenant: &Tenant{ID: 1, Status: "active", MaxUsers: &maxUsers, MaxConnections: &maxConnections},
	}
	service := NewTenantService(repo)

	// currentUsers = 4, currentConnections = 1 (Abaixo do limite)
	err := service.CheckQuota(context.Background(), 1, 4, 1)
	if err != nil {
		t.Fatalf("esperava sucesso, recebeu erro: %v", err)
	}
}

func TestCheckQuota_UserLimitReached(t *testing.T) {
	maxUsers := 5
	maxConnections := 2
	repo := &mockTenantRepo{
		tenant: &Tenant{ID: 1, Status: "active", MaxUsers: &maxUsers, MaxConnections: &maxConnections},
	}
	service := NewTenantService(repo)

	// currentUsers = 5 (Chegou no limite, deve falhar)
	err := service.CheckQuota(context.Background(), 1, 5, 1)
	if err == nil || err.Error() != "user limit reached" {
		t.Fatalf("esperava erro de cota de usuário, recebeu: %v", err)
	}
}

func TestCheckQuota_Inactive(t *testing.T) {
	repo := &mockTenantRepo{
		tenant: &Tenant{ID: 1, Status: "inactive"},
	}
	service := NewTenantService(repo)

	err := service.CheckQuota(context.Background(), 1, 1, 1)
	if err == nil || err.Error() != "tenant inactive" {
		t.Fatalf("esperava erro de tenant inativo, recebeu: %v", err)
	}
}

func TestCreateTenant_IsDemo(t *testing.T) {
	repo := &mockTenantRepo{}
	service := NewTenantService(repo)

	created, err := service.CreateTenant(context.Background(), Tenant{
		Name:   "Empresa Demo Teste",
		Status: "active",
		IsDemo: true,
	})
	if err != nil {
		t.Fatalf("esperava sucesso ao criar tenant demo, erro: %v", err)
	}
	if !created.IsDemo {
		t.Fatalf("esperava IsDemo=true no tenant criado")
	}
}

func TestUpdateTenant_IsDemo(t *testing.T) {
	repo := &mockTenantRepo{
		tenant: &Tenant{ID: 1, Name: "Empresa Original", IsDemo: false},
	}
	service := NewTenantService(repo)

	updated, err := service.UpdateTenant(context.Background(), 1, Tenant{
		Name:   "Empresa Modificada",
		Status: "active",
		IsDemo: true,
	})
	if err != nil {
		t.Fatalf("esperava sucesso ao atualizar tenant demo, erro: %v", err)
	}
	if !updated.IsDemo {
		t.Fatalf("esperava IsDemo=true no tenant atualizado")
	}
}

