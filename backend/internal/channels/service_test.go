package channels

import (
	"context"
	"testing"

	"github.com/tiktickets/backend-go/internal/settings"
	"github.com/tiktickets/backend-go/internal/tenant"
)

type mockChannelRepo struct {
	channels []Whatsapp
}

func (m *mockChannelRepo) Create(ctx context.Context, channel *Whatsapp) error {
	channel.ID = uint(len(m.channels) + 1)
	m.channels = append(m.channels, *channel)
	return nil
}

func (m *mockChannelRepo) GetByID(ctx context.Context, id uint, tenantID uint) (*Whatsapp, error) {
	for i := range m.channels {
		if m.channels[i].ID == id && m.channels[i].TenantID == tenantID {
			return &m.channels[i], nil
		}
	}
	return nil, nil
}

func (m *mockChannelRepo) ListByTenant(ctx context.Context, tenantID uint) ([]Whatsapp, error) {
	var result []Whatsapp
	for _, c := range m.channels {
		if c.TenantID == tenantID {
			result = append(result, c)
		}
	}
	return result, nil
}

func (m *mockChannelRepo) Update(ctx context.Context, channel *Whatsapp) error {
	for i := range m.channels {
		if m.channels[i].ID == channel.ID && m.channels[i].TenantID == channel.TenantID {
			m.channels[i] = *channel
			return nil
		}
	}
	return nil
}

func (m *mockChannelRepo) Delete(ctx context.Context, id uint, tenantID uint) error {
	for i := range m.channels {
		if m.channels[i].ID == id && m.channels[i].TenantID == tenantID {
			m.channels = append(m.channels[:i], m.channels[i+1:]...)
			return nil
		}
	}
	return nil
}

type mockTenantRepoForChannels struct {
	tenant *tenant.Tenant
}

func (m *mockTenantRepoForChannels) GetByID(ctx context.Context, id uint) (*tenant.Tenant, error) {
	return m.tenant, nil
}
func (m *mockTenantRepoForChannels) Update(ctx context.Context, t *tenant.Tenant) error { return nil }
func (m *mockTenantRepoForChannels) Create(ctx context.Context, t *tenant.Tenant) error { return nil }
func (m *mockTenantRepoForChannels) List(ctx context.Context) ([]tenant.Tenant, error)   { return nil, nil }
func (m *mockTenantRepoForChannels) Delete(ctx context.Context, id uint) error          { return nil }
func (m *mockTenantRepoForChannels) CreateSetting(ctx context.Context, s *settings.Setting) error {
	return nil
}

func TestUpdateWhatsapp_ChatFlowID(t *testing.T) {
	mockRepo := &mockChannelRepo{
		channels: []Whatsapp{
			{
				ID:         1,
				Name:       "Whatsapp Principal",
				TenantID:   1,
				Status:     "CONNECTED",
				Type:       "whatsapp",
				ChatFlowID: nil,
			},
		},
	}
	maxConns := 5
	tenantRepo := &mockTenantRepoForChannels{
		tenant: &tenant.Tenant{ID: 1, MaxConnections: &maxConns},
	}

	service := NewChannelService(mockRepo, tenantRepo)

	flowID := uint(42)
	updated, err := service.Update(context.Background(), 1, 1, UpdateWhatsappDTO{
		ChatFlowID: &flowID,
	})
	if err != nil {
		t.Fatalf("erro inesperado ao atualizar whatsapp: %v", err)
	}

	if updated.ChatFlowID == nil || *updated.ChatFlowID != 42 {
		t.Fatalf("esperava ChatFlowID 42, recebeu %v", updated.ChatFlowID)
	}

	// Testar desvinculação do bot (definir como nil)
	cleared, err := service.Update(context.Background(), 1, 1, UpdateWhatsappDTO{
		ChatFlowID: nil,
	})
	if err != nil {
		t.Fatalf("erro ao limpar ChatFlowID: %v", err)
	}
	if cleared.ChatFlowID != nil {
		t.Fatalf("esperava ChatFlowID nil, recebeu %v", cleared.ChatFlowID)
	}
}
