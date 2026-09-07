package campaigns

import (
	"context"
	"gorm.io/gorm"
)

type Repository interface {
	Create(ctx context.Context, campaign *Campaign) error
	GetByID(ctx context.Context, id uint, tenantID uint) (*Campaign, error)
	ListByTenant(ctx context.Context, tenantID uint) ([]Campaign, error)
	Update(ctx context.Context, campaign *Campaign) error
	Delete(ctx context.Context, id uint, tenantID uint) error
}

type campaignRepository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &campaignRepository{db: db}
}

func (r *campaignRepository) Create(ctx context.Context, campaign *Campaign) error {
	return r.db.WithContext(ctx).Create(campaign).Error
}

func (r *campaignRepository) GetByID(ctx context.Context, id uint, tenantID uint) (*Campaign, error) {
	var campaign Campaign
	if err := r.db.WithContext(ctx).Where("id = ? AND tenant_id = ?", id, tenantID).First(&campaign).Error; err != nil {
		return nil, err
	}
	return &campaign, nil
}

func (r *campaignRepository) ListByTenant(ctx context.Context, tenantID uint) ([]Campaign, error) {
	var campaigns []Campaign
	if err := r.db.WithContext(ctx).Where("tenant_id = ?", tenantID).Find(&campaigns).Error; err != nil {
		return nil, err
	}
	return campaigns, nil
}

func (r *campaignRepository) Update(ctx context.Context, campaign *Campaign) error {
	return r.db.WithContext(ctx).Save(campaign).Error
}

func (r *campaignRepository) Delete(ctx context.Context, id uint, tenantID uint) error {
	return r.db.WithContext(ctx).Where("id = ? AND tenant_id = ?", id, tenantID).Delete(&Campaign{}).Error
}
