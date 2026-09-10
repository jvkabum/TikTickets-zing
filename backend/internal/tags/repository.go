package tags

import (
	"context"

	"gorm.io/gorm"
)

type Repository interface {
	Create(ctx context.Context, tag *Tag) error
	GetByID(ctx context.Context, id uint, tenantID uint) (*Tag, error)
	List(ctx context.Context, tenantID uint) ([]Tag, error)
	Update(ctx context.Context, tag *Tag) error
	Delete(ctx context.Context, id uint, tenantID uint) error
}

type tagRepository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &tagRepository{db: db}
}

func (r *tagRepository) Create(ctx context.Context, tag *Tag) error {
	return r.db.WithContext(ctx).Create(tag).Error
}

func (r *tagRepository) GetByID(ctx context.Context, id uint, tenantID uint) (*Tag, error) {
	var tag Tag
	if err := r.db.WithContext(ctx).Where("id = ? AND tenant_id = ?", id, tenantID).First(&tag).Error; err != nil {
		return nil, err
	}
	return &tag, nil
}

func (r *tagRepository) List(ctx context.Context, tenantID uint) ([]Tag, error) {
	var tags []Tag
	if err := r.db.WithContext(ctx).Where("tenant_id = ?", tenantID).Find(&tags).Error; err != nil {
		return nil, err
	}
	return tags, nil
}

func (r *tagRepository) Update(ctx context.Context, tag *Tag) error {
	return r.db.WithContext(ctx).Save(tag).Error
}

func (r *tagRepository) Delete(ctx context.Context, id uint, tenantID uint) error {
	return r.db.WithContext(ctx).Where("id = ? AND tenant_id = ?", id, tenantID).Delete(&Tag{}).Error
}
