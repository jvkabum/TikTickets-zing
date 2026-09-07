package channels

import (
	"context"
	"gorm.io/gorm"
)

type Repository interface {
	Create(ctx context.Context, channel *Whatsapp) error
	GetByID(ctx context.Context, id uint, tenantID uint) (*Whatsapp, error)
	ListByTenant(ctx context.Context, tenantID uint) ([]Whatsapp, error)
	Update(ctx context.Context, channel *Whatsapp) error
	Delete(ctx context.Context, id uint, tenantID uint) error
}

type whatsappRepository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &whatsappRepository{db: db}
}

func (r *whatsappRepository) Create(ctx context.Context, channel *Whatsapp) error {
	return r.db.WithContext(ctx).Create(channel).Error
}

func (r *whatsappRepository) GetByID(ctx context.Context, id uint, tenantID uint) (*Whatsapp, error) {
	var channel Whatsapp
	if err := r.db.WithContext(ctx).Where("id = ? AND tenant_id = ?", id, tenantID).First(&channel).Error; err != nil {
		return nil, err
	}
	if channel.Type == "" {
		channel.Type = "whatsapp"
	}
	return &channel, nil
}

func (r *whatsappRepository) ListByTenant(ctx context.Context, tenantID uint) ([]Whatsapp, error) {
	var channels []Whatsapp
	if err := r.db.WithContext(ctx).Where("tenant_id = ?", tenantID).Find(&channels).Error; err != nil {
		return nil, err
	}
	for i := range channels {
		if channels[i].Type == "" {
			channels[i].Type = "whatsapp"
		}
	}
	return channels, nil
}

func (r *whatsappRepository) Update(ctx context.Context, channel *Whatsapp) error {
	return r.db.WithContext(ctx).Save(channel).Error
}

func (r *whatsappRepository) Delete(ctx context.Context, id uint, tenantID uint) error {
	return r.db.WithContext(ctx).Where("id = ? AND tenant_id = ?", id, tenantID).Delete(&Whatsapp{}).Error
}
