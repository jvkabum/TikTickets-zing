package settings

import (
	"context"
	"errors"
)

type SettingService struct {
	repo Repository
}

func NewSettingService(repo Repository) *SettingService {
	return &SettingService{repo: repo}
}

func (s *SettingService) UpdateOrCreate(ctx context.Context, tenantID uint, key, value string) error {
	if key == "" {
		return errors.New("key is required")
	}

	existing, err := s.repo.GetByKey(ctx, key, tenantID)
	if err != nil {
		// Not found, create
		return s.repo.Create(ctx, &Setting{
			Key:      key,
			Value:    value,
			TenantID: tenantID,
		})
	}

	existing.Value = value
	return s.repo.Update(ctx, existing)
}

func (s *SettingService) List(ctx context.Context, tenantID uint) ([]Setting, error) {
	return s.repo.List(ctx, tenantID)
}

func (s *SettingService) GetByKey(ctx context.Context, tenantID uint, key string) (*Setting, error) {
	return s.repo.GetByKey(ctx, key, tenantID)
}
