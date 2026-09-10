package settings

import (
	"context"

	"gorm.io/gorm"
)

type Repository interface {
	Create(ctx context.Context, setting *Setting) error
	GetByKey(ctx context.Context, key string, tenantID uint) (*Setting, error)
	List(ctx context.Context, tenantID uint) ([]Setting, error)
	Update(ctx context.Context, setting *Setting) error
	Delete(ctx context.Context, id uint, tenantID uint) error
}

type settingRepository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &settingRepository{db: db}
}

func (r *settingRepository) Create(ctx context.Context, setting *Setting) error {
	return r.db.WithContext(ctx).Create(setting).Error
}

func (r *settingRepository) GetByKey(ctx context.Context, key string, tenantID uint) (*Setting, error) {
	var setting Setting
	if err := r.db.WithContext(ctx).Where("key = ? AND tenant_id = ?", key, tenantID).First(&setting).Error; err != nil {
		return nil, err
	}
	return &setting, nil
}

func (r *settingRepository) List(ctx context.Context, tenantID uint) ([]Setting, error) {
	var settings []Setting
	if err := r.db.WithContext(ctx).Where("tenant_id = ?", tenantID).Find(&settings).Error; err != nil {
		return nil, err
	}
	return settings, nil
}

func (r *settingRepository) Update(ctx context.Context, setting *Setting) error {
	return r.db.WithContext(ctx).Save(setting).Error
}

func (r *settingRepository) Delete(ctx context.Context, id uint, tenantID uint) error {
	return r.db.WithContext(ctx).Where("id = ? AND tenant_id = ?", id, tenantID).Delete(&Setting{}).Error
}
