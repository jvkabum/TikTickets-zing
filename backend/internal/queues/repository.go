package queues

import (
	"context"

	"gorm.io/gorm"
)

type Repository interface {
	Create(ctx context.Context, queue *Queue) error
	GetByID(ctx context.Context, id uint, tenantID uint) (*Queue, error)
	List(ctx context.Context, tenantID uint) ([]Queue, error)
	Update(ctx context.Context, queue *Queue) error
	Delete(ctx context.Context, id uint, tenantID uint) error
}

type queueRepository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &queueRepository{db: db}
}

func (r *queueRepository) Create(ctx context.Context, queue *Queue) error {
	return r.db.WithContext(ctx).Create(queue).Error
}

func (r *queueRepository) GetByID(ctx context.Context, id uint, tenantID uint) (*Queue, error) {
	var queue Queue
	if err := r.db.WithContext(ctx).Where("id = ? AND tenant_id = ?", id, tenantID).First(&queue).Error; err != nil {
		return nil, err
	}
	return &queue, nil
}

func (r *queueRepository) List(ctx context.Context, tenantID uint) ([]Queue, error) {
	var queues []Queue
	if err := r.db.WithContext(ctx).Where("tenant_id = ?", tenantID).Find(&queues).Error; err != nil {
		return nil, err
	}
	return queues, nil
}

func (r *queueRepository) Update(ctx context.Context, queue *Queue) error {
	return r.db.WithContext(ctx).Save(queue).Error
}

func (r *queueRepository) Delete(ctx context.Context, id uint, tenantID uint) error {
	return r.db.WithContext(ctx).Where("id = ? AND tenant_id = ?", id, tenantID).Delete(&Queue{}).Error
}
