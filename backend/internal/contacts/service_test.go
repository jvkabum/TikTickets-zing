package contacts

import (
	"context"
	"testing"
)

type mockContactRepo struct {
	contact *Contact
	err     error
}

func (m *mockContactRepo) Create(ctx context.Context, c *Contact) error { return nil }
func (m *mockContactRepo) GetByID(ctx context.Context, id uint, tenantID uint) (*Contact, error) {
	return m.contact, m.err
}
func (m *mockContactRepo) GetByNumber(ctx context.Context, number string, tenantID uint) (*Contact, error) {
	return m.contact, m.err
}
func (m *mockContactRepo) ListByTenant(ctx context.Context, tenantID uint) ([]Contact, error) {
	return nil, nil
}
func (m *mockContactRepo) Update(ctx context.Context, c *Contact) error { return nil }
func (m *mockContactRepo) Delete(ctx context.Context, id uint, tenantID uint) error { return nil }

func TestCreateOrUpdate_EmptyNumber(t *testing.T) {
	service := NewContactService(&mockContactRepo{})
	err := service.CreateOrUpdate(context.Background(), &Contact{TenantID: 1})
	if err == nil {
		t.Fatalf("esperava erro por número vazio, recebeu nil")
	}
}

func TestCreateOrUpdate_EmptyTenant(t *testing.T) {
	service := NewContactService(&mockContactRepo{})
	err := service.CreateOrUpdate(context.Background(), &Contact{Number: "5511999999999"})
	if err == nil {
		t.Fatalf("esperava erro por tenant vazio, recebeu nil")
	}
}

func TestCreateOrUpdate_Success(t *testing.T) {
	repo := &mockContactRepo{
		contact: &Contact{ID: 1, Number: "5511999999999", TenantID: 1},
	}
	service := NewContactService(repo)

	err := service.CreateOrUpdate(context.Background(), &Contact{Number: "5511999999999", TenantID: 1, Name: "Teste"})
	if err != nil {
		t.Fatalf("esperava sucesso, recebeu erro: %v", err)
	}
}
