package campaigns

import (
	"context"
	"testing"
)

type mockCampaignRepo struct {
	campaign *Campaign
	err      error
}

func (m *mockCampaignRepo) Create(ctx context.Context, c *Campaign) error { return nil }
func (m *mockCampaignRepo) GetByID(ctx context.Context, id uint, tenantID uint) (*Campaign, error) {
	return m.campaign, m.err
}
func (m *mockCampaignRepo) ListByTenant(ctx context.Context, tenantID uint) ([]Campaign, error) { return nil, nil }
func (m *mockCampaignRepo) Update(ctx context.Context, c *Campaign) error { return nil }
func (m *mockCampaignRepo) Delete(ctx context.Context, id uint, tenantID uint) error { return nil }

func TestWorkerProcess_InvalidStatus(t *testing.T) {
	repo := &mockCampaignRepo{
		campaign: &Campaign{ID: 1, Status: "finalizada", TenantID: 1},
	}
	worker := NewCampaignWorker(repo)

	err := worker.Process(context.Background(), 1, 1)
	if err == nil || err.Error() != "campanha não está em estado válido para processamento" {
		t.Fatalf("esperava erro de status inválido, recebeu: %v", err)
	}
}
