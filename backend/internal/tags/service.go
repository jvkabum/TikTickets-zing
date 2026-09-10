package tags

import (
	"context"
	"errors"
)

type TagService struct {
	repo Repository
}

func NewTagService(repo Repository) *TagService {
	return &TagService{repo: repo}
}

func (s *TagService) Create(ctx context.Context, tag *Tag) error {
	if tag.Tag == "" || tag.TenantID == 0 {
		return errors.New("name and tenant_id are required")
	}
	return s.repo.Create(ctx, tag)
}

func (s *TagService) Update(ctx context.Context, id uint, tenantID uint, updates *Tag) error {
	existing, err := s.repo.GetByID(ctx, id, tenantID)
	if err != nil {
		return err
	}

	if updates.Tag != "" {
		existing.Tag = updates.Tag
	}
	if updates.Color != "" {
		existing.Color = updates.Color
	}

	return s.repo.Update(ctx, existing)
}

func (s *TagService) List(ctx context.Context, tenantID uint) ([]Tag, error) {
	return s.repo.List(ctx, tenantID)
}

func (s *TagService) GetByID(ctx context.Context, id uint, tenantID uint) (*Tag, error) {
	return s.repo.GetByID(ctx, id, tenantID)
}

func (s *TagService) Delete(ctx context.Context, id uint, tenantID uint) error {
	_, err := s.repo.GetByID(ctx, id, tenantID)
	if err != nil {
		return errors.New("tag not found")
	}
	return s.repo.Delete(ctx, id, tenantID)
}
