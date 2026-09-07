package channels

import (
	"context"
	"errors"
	"github.com/tiktickets/backend-go/internal/tenant"
)

type ChannelService struct {
	repo       Repository
	tenantRepo tenant.Repository
}

func NewChannelService(repo Repository, tenantRepo tenant.Repository) *ChannelService {
	return &ChannelService{repo: repo, tenantRepo: tenantRepo}
}

func (s *ChannelService) List(ctx context.Context, tenantID uint) ([]Whatsapp, error) {
	return s.repo.ListByTenant(ctx, tenantID)
}

func (s *ChannelService) Show(ctx context.Context, tenantID uint, id uint) (*Whatsapp, error) {
	return s.repo.GetByID(ctx, id, tenantID)
}

type CreateWhatsappDTO struct {
	Name      string `json:"name"`
	IsDefault bool   `json:"isDefault"`
}

func (s *ChannelService) Create(ctx context.Context, tenantID uint, dto CreateWhatsappDTO) (*Whatsapp, error) {
	// BR-MIGRAR-003: Check connection limit
	t, err := s.tenantRepo.GetByID(ctx, tenantID)
	if err != nil {
		return nil, errors.New("tenant not found")
	}

	channels, err := s.repo.ListByTenant(ctx, tenantID)
	if err != nil {
		return nil, err
	}

	limit := 1 // default limit if nil
	if t.MaxConnections != nil {
		limit = *t.MaxConnections
	}

	if len(channels) >= limit {
		return nil, errors.New("ERR_NO_PERMISSION_CONNECTIONS_LIMIT")
	}

	whatsapp := &Whatsapp{
		Name:      dto.Name,
		IsDefault: dto.IsDefault,
		Status:    "DISCONNECTED",
		Type:      "whatsapp",
		TenantID:  tenantID,
	}

	if err := s.repo.Create(ctx, whatsapp); err != nil {
		return nil, err
	}

	return whatsapp, nil
}

type UpdateWhatsappDTO struct {
	Name      *string `json:"name"`
	IsDefault *bool   `json:"isDefault"`
}

func (s *ChannelService) Update(ctx context.Context, tenantID uint, id uint, dto UpdateWhatsappDTO) (*Whatsapp, error) {
	whatsapp, err := s.repo.GetByID(ctx, id, tenantID)
	if err != nil {
		return nil, errors.New("whatsapp not found")
	}

	if dto.Name != nil {
		whatsapp.Name = *dto.Name
	}
	if dto.IsDefault != nil {
		whatsapp.IsDefault = *dto.IsDefault
	}

	if err := s.repo.Update(ctx, whatsapp); err != nil {
		return nil, err
	}
	return whatsapp, nil
}

func (s *ChannelService) Delete(ctx context.Context, tenantID uint, id uint) error {
	// Valida acesso e existência
	_, err := s.repo.GetByID(ctx, id, tenantID)
	if err != nil {
		return errors.New("whatsapp not found")
	}

	// Remove do banco
	if err := s.repo.Delete(ctx, id, tenantID); err != nil {
		return err
	}

	// TODO: Emit socket event & remove webbot session
	return nil
}
