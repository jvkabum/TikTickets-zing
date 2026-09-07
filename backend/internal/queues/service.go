package queues

import (
	"context"
	"errors"
)

type QueueService struct {
	repo Repository
}

func NewQueueService(repo Repository) *QueueService {
	return &QueueService{repo: repo}
}

func (s *QueueService) Create(ctx context.Context, queue *Queue) error {
	if queue.Name == "" || queue.TenantID == 0 {
		return errors.New("name and tenant_id are required")
	}
	return s.repo.Create(ctx, queue)
}

func (s *QueueService) Update(ctx context.Context, id uint, tenantID uint, updates *Queue) error {
	existing, err := s.repo.GetByID(ctx, id, tenantID)
	if err != nil {
		return err
	}

	if updates.Name != "" {
		existing.Name = updates.Name
	}
	if updates.Color != "" {
		existing.Color = updates.Color
	}
	if updates.Greeting != "" {
		existing.Greeting = updates.Greeting
	}

	return s.repo.Update(ctx, existing)
}

func (s *QueueService) List(ctx context.Context, tenantID uint) ([]Queue, error) {
	return s.repo.List(ctx, tenantID)
}

func (s *QueueService) GetByID(ctx context.Context, id uint, tenantID uint) (*Queue, error) {
	return s.repo.GetByID(ctx, id, tenantID)
}

func (s *QueueService) Delete(ctx context.Context, id uint, tenantID uint) error {
	_, err := s.repo.GetByID(ctx, id, tenantID)
	if err != nil {
		return errors.New("queue not found")
	}
	return s.repo.Delete(ctx, id, tenantID)
}
