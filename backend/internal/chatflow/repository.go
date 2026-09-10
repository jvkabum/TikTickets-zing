package chatflow

import (
	"context"
	"gorm.io/gorm"
)

type Repository interface {
	Create(ctx context.Context, flow *ChatFlow) error
	GetByID(ctx context.Context, id uint, tenantID uint) (*ChatFlow, error)
	ListByTenant(ctx context.Context, tenantID uint) ([]ChatFlow, error)
	Update(ctx context.Context, flow *ChatFlow) error
	Delete(ctx context.Context, id uint, tenantID uint) error
}

type chatFlowRepository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &chatFlowRepository{db: db}
}

func (r *chatFlowRepository) Create(ctx context.Context, flow *ChatFlow) error {
	return r.db.WithContext(ctx).Create(flow).Error
}

func (r *chatFlowRepository) GetByID(ctx context.Context, id uint, tenantID uint) (*ChatFlow, error) {
	var flow ChatFlow
	query := r.db.WithContext(ctx).Where("id = ?", id)
	if tenantID > 0 {
		query = query.Where("tenant_id = ?", tenantID)
	}
	if err := query.First(&flow).Error; err != nil {
		return nil, err
	}
	return &flow, nil
}

func (r *chatFlowRepository) ListByTenant(ctx context.Context, tenantID uint) ([]ChatFlow, error) {
	var flows []ChatFlow
	if err := r.db.WithContext(ctx).Where("tenant_id = ?", tenantID).Find(&flows).Error; err != nil {
		return nil, err
	}
	return flows, nil
}

func (r *chatFlowRepository) Update(ctx context.Context, flow *ChatFlow) error {
	return r.db.WithContext(ctx).Save(flow).Error
}

func (r *chatFlowRepository) Delete(ctx context.Context, id uint, tenantID uint) error {
	return r.db.WithContext(ctx).Where("id = ? AND tenant_id = ?", id, tenantID).Delete(&ChatFlow{}).Error
}
