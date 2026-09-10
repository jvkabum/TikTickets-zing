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

func (s *ChatFlowService) Update(ctx context.Context, id uint, tenantID uint, updates *ChatFlow) (*ChatFlow, error) {
	var existing *ChatFlow
	var err error
	if tenantID == 0 {
		existing, err = s.repo.GetByID(ctx, id, 0)
	} else {
		existing, err = s.repo.GetByID(ctx, id, tenantID)
		if err != nil {
			// Fallback: se não encontrar com o tenantID do token, tenta sem restrição de tenant (ex.: superadmin)
			existing, err = s.repo.GetByID(ctx, id, 0)
		}
	}
	if err != nil {
		return nil, err
	}

	if updates.Name != "" {
		existing.Name = updates.Name
	}
	if len(updates.Flow) > 0 {
		existing.Flow = updates.Flow
	}
	existing.IsActive = updates.IsActive
	if updates.CelularTeste != "" {
		existing.CelularTeste = updates.CelularTeste
	}

	if err := s.repo.Update(ctx, existing); err != nil {
		return nil, err
	}
	return existing, nil
}

func (s *ChatFlowService) Delete(ctx context.Context, id uint, tenantID uint) error {
	_, err := s.repo.GetByID(ctx, id, tenantID)
	if err != nil {
		return errors.New("chatflow not found")
	}
	return s.repo.Delete(ctx, id, tenantID)
}
