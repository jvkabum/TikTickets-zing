package chatflow

import (
	"context"
	"errors"
)

type ChatFlowService struct {
	repo Repository
}

func NewChatFlowService(repo Repository) *ChatFlowService {
	return &ChatFlowService{repo: repo}
}

func (s *ChatFlowService) Create(ctx context.Context, flow *ChatFlow) error {
	if flow.Name == "" || flow.TenantID == 0 {
		return errors.New("name and tenant_id are required")
	}
	return s.repo.Create(ctx, flow)
}

func (s *ChatFlowService) List(ctx context.Context, tenantID uint) ([]ChatFlow, error) {
	return s.repo.ListByTenant(ctx, tenantID)
}

func (s *ChatFlowService) GetByID(ctx context.Context, id uint, tenantID uint) (*ChatFlow, error) {
	return s.repo.GetByID(ctx, id, tenantID)
}

func (s *ChatFlowService) Update(ctx context.Context, id uint, tenantID uint, updates *ChatFlow) error {
	existing, err := s.repo.GetByID(ctx, id, tenantID)
	if err != nil {
		return err
	}

	if updates.Name != "" {
		existing.Name = updates.Name
	}
	if len(updates.Flow) > 0 {
		existing.Flow = updates.Flow
	}
	existing.IsActive = updates.IsActive

	return s.repo.Update(ctx, existing)
}

func (s *ChatFlowService) Delete(ctx context.Context, id uint, tenantID uint) error {
	_, err := s.repo.GetByID(ctx, id, tenantID)
	if err != nil {
		return errors.New("chatflow not found")
	}
	return s.repo.Delete(ctx, id, tenantID)
}
