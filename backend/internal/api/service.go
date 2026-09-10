package api

import (
	"context"
	"errors"
	"github.com/google/uuid"
)

type ApiService struct {
	repo Repository
}

func NewApiService(repo Repository) *ApiService {
	return &ApiService{repo: repo}
}

func (s *ApiService) Create(ctx context.Context, apiConfig *ApiConfig) error {
	if apiConfig.SessionID == 0 || apiConfig.TenantID == 0 {
		return errors.New("session_id and tenant_id are required")
	}
	apiConfig.ID = uuid.NewString()
	apiConfig.Token = uuid.NewString() // Bearer token auto-gerado
	return s.repo.Create(ctx, apiConfig)
}

func (s *ApiService) Update(ctx context.Context, id string, tenantID uint, updates *ApiConfig) error {
	existing, err := s.repo.GetByID(ctx, id, tenantID)
	if err != nil {
		return err
	}

	if updates.SessionID != 0 {
		existing.SessionID = updates.SessionID
	}
	
	return s.repo.Update(ctx, existing)
}
