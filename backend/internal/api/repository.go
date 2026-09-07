package api

import (
	"context"

	"gorm.io/gorm"
)

type Repository interface {
	Create(ctx context.Context, apiConfig *ApiConfig) error
	GetByID(ctx context.Context, id string, tenantID uint) (*ApiConfig, error)
	GetByToken(ctx context.Context, token string) (*ApiConfig, error)
	List(ctx context.Context, tenantID uint) ([]ApiConfig, error)
	Update(ctx context.Context, apiConfig *ApiConfig) error
	Delete(ctx context.Context, id string, tenantID uint) error
}

type apiRepository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &apiRepository{db: db}
}

func (r *apiRepository) Create(ctx context.Context, apiConfig *ApiConfig) error {
	return r.db.WithContext(ctx).Create(apiConfig).Error
}

func (r *apiRepository) GetByID(ctx context.Context, id string, tenantID uint) (*ApiConfig, error) {
	var apiConfig ApiConfig
	if err := r.db.WithContext(ctx).Where("id = ? AND tenant_id = ?", id, tenantID).First(&apiConfig).Error; err != nil {
		return nil, err
	}
	return &apiConfig, nil
}

func (r *apiRepository) GetByToken(ctx context.Context, token string) (*ApiConfig, error) {
	var apiConfig ApiConfig
	if err := r.db.WithContext(ctx).Where("token = ?", token).First(&apiConfig).Error; err != nil {
		return nil, err
	}
	return &apiConfig, nil
}

func (r *apiRepository) List(ctx context.Context, tenantID uint) ([]ApiConfig, error) {
	var configs []ApiConfig
	if err := r.db.WithContext(ctx).Where("tenant_id = ?", tenantID).Find(&configs).Error; err != nil {
		return nil, err
	}
	return configs, nil
}

func (r *apiRepository) Update(ctx context.Context, apiConfig *ApiConfig) error {
	return r.db.WithContext(ctx).Save(apiConfig).Error
}

func (r *apiRepository) Delete(ctx context.Context, id string, tenantID uint) error {
	return r.db.WithContext(ctx).Where("id = ? AND tenant_id = ?", id, tenantID).Delete(&ApiConfig{}).Error
}
