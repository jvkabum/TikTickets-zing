package fastreplies

import (
	"context"
	"errors"
)

type FastReplyService struct {
	repo Repository
}

func NewFastReplyService(repo Repository) *FastReplyService {
	return &FastReplyService{repo: repo}
}

func (s *FastReplyService) Create(ctx context.Context, reply *FastReply) error {
	if reply.Key == "" || reply.Message == "" || reply.TenantID == 0 {
		return errors.New("key, message, and tenant_id are required")
	}
	return s.repo.Create(ctx, reply)
}

func (s *FastReplyService) Update(ctx context.Context, id uint, tenantID uint, updates *FastReply) error {
	existing, err := s.repo.GetByID(ctx, id, tenantID)
	if err != nil {
		return err
	}

	if updates.Key != "" {
		existing.Key = updates.Key
	}
	if updates.Message != "" {
		existing.Message = updates.Message
	}

	return s.repo.Update(ctx, existing)
}

func (s *FastReplyService) List(ctx context.Context, tenantID uint) ([]FastReply, error) {
	return s.repo.List(ctx, tenantID)
}

func (s *FastReplyService) GetByID(ctx context.Context, id uint, tenantID uint) (*FastReply, error) {
	return s.repo.GetByID(ctx, id, tenantID)
}

func (s *FastReplyService) Delete(ctx context.Context, id uint, tenantID uint) error {
	_, err := s.repo.GetByID(ctx, id, tenantID)
	if err != nil {
		return errors.New("fast reply not found")
	}
	return s.repo.Delete(ctx, id, tenantID)
}
