package campaigns

import (
	"context"
	"errors"
)

type CampaignService struct {
	repo Repository
}

func NewCampaignService(repo Repository) *CampaignService {
	return &CampaignService{repo: repo}
}

func (s *CampaignService) Create(ctx context.Context, campaign *Campaign) error {
	if campaign.Name == "" || campaign.TenantID == 0 {
		return errors.New("name and tenant_id are required")
	}
	campaign.Status = "programada"
	return s.repo.Create(ctx, campaign)
}

func (s *CampaignService) List(ctx context.Context, tenantID uint) ([]Campaign, error) {
	return s.repo.ListByTenant(ctx, tenantID)
}

func (s *CampaignService) GetByID(ctx context.Context, id uint, tenantID uint) (*Campaign, error) {
	return s.repo.GetByID(ctx, id, tenantID)
}

func (s *CampaignService) Update(ctx context.Context, id uint, tenantID uint, updates *Campaign) error {
	existing, err := s.repo.GetByID(ctx, id, tenantID)
	if err != nil {
		return err
	}

	if updates.Name != "" {
		existing.Name = updates.Name
	}
	if updates.Status != "" {
		existing.Status = updates.Status
	}
	if updates.Message1 != "" {
		existing.Message1 = updates.Message1
	}
	if updates.Message2 != "" {
		existing.Message2 = updates.Message2
	}
	if updates.Message3 != "" {
		existing.Message3 = updates.Message3
	}
	if updates.MediaUrl != "" {
		existing.MediaUrl = updates.MediaUrl
	}
	if updates.Delay > 0 {
		existing.Delay = updates.Delay
	}

	return s.repo.Update(ctx, existing)
}

func (s *CampaignService) Delete(ctx context.Context, id uint, tenantID uint) error {
	_, err := s.repo.GetByID(ctx, id, tenantID)
	if err != nil {
		return errors.New("campaign not found")
	}
	return s.repo.Delete(ctx, id, tenantID)
}
