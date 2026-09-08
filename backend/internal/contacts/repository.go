package contacts

import (
	"context"
	"gorm.io/gorm"
)

type Repository interface {
	Create(ctx context.Context, contact *Contact) error
	GetByID(ctx context.Context, id uint, tenantID uint) (*Contact, error)
	ListByTenant(ctx context.Context, tenantID uint) ([]Contact, error)
	GetByNumber(ctx context.Context, number string, tenantID uint) (*Contact, error)
	Update(ctx context.Context, contact *Contact) error
	Delete(ctx context.Context, id uint, tenantID uint) error
}

type contactRepository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &contactRepository{db: db}
}

func (r *contactRepository) Create(ctx context.Context, contact *Contact) error {
	return r.db.WithContext(ctx).Create(contact).Error
}

func (r *contactRepository) GetByID(ctx context.Context, id uint, tenantID uint) (*Contact, error) {
	var contact Contact
	if err := r.db.WithContext(ctx).Where("id = ? AND (\"tenantId\" = ? OR tenant_id = ?)", id, tenantID, tenantID).First(&contact).Error; err != nil {
		return nil, err
	}
	return &contact, nil
}

func (r *contactRepository) GetByNumber(ctx context.Context, number string, tenantID uint) (*Contact, error) {
	var contact Contact
	if err := r.db.WithContext(ctx).Where("number = ? AND (\"tenantId\" = ? OR tenant_id = ?)", number, tenantID, tenantID).First(&contact).Error; err != nil {
		return nil, err
	}
	return &contact, nil
}

func (r *contactRepository) ListByTenant(ctx context.Context, tenantID uint) ([]Contact, error) {
	var contacts []Contact
	if err := r.db.WithContext(ctx).Where("\"tenantId\" = ? OR tenant_id = ?", tenantID, tenantID).Find(&contacts).Error; err != nil {
		return nil, err
	}
	return contacts, nil
}

func (r *contactRepository) Update(ctx context.Context, contact *Contact) error {
	return r.db.WithContext(ctx).Save(contact).Error
}

func (r *contactRepository) Delete(ctx context.Context, id uint, tenantID uint) error {
	return r.db.WithContext(ctx).Where("id = ? AND (\"tenantId\" = ? OR tenant_id = ?)", id, tenantID, tenantID).Delete(&Contact{}).Error
}
