package tenant

import (
	"context"
	"time"
	"gorm.io/gorm"
	
	"github.com/tiktickets/backend-go/internal/settings"
)

type Repository interface {
	GetByID(ctx context.Context, id uint) (*Tenant, error)
	Update(ctx context.Context, tenant *Tenant) error
	Create(ctx context.Context, tenant *Tenant) error
	List(ctx context.Context) ([]Tenant, error)
	Delete(ctx context.Context, id uint) error
	CreateSetting(ctx context.Context, setting *settings.Setting) error
}

type tenantRepository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &tenantRepository{db: db}
}

func (r *tenantRepository) GetByID(ctx context.Context, id uint) (*Tenant, error) {
	var tenant Tenant
	if err := r.db.WithContext(ctx).First(&tenant, id).Error; err != nil {
		return nil, err
	}
	return &tenant, nil
}

func (r *tenantRepository) Update(ctx context.Context, tenant *Tenant) error {
	updates := map[string]interface{}{
		"status":         tenant.Status,
		"name":           tenant.Name,
		"maxUsers":       tenant.MaxUsers,
		"maxConnections": tenant.MaxConnections,
		"isDemo":         tenant.IsDemo,
		"updatedAt":      time.Now(),
	}
	if tenant.BusinessHours != "" {
		updates["businessHours"] = tenant.BusinessHours
	}
	if tenant.MessageBusinessHours != "" {
		updates["messageBusinessHours"] = tenant.MessageBusinessHours
	}
	if tenant.OwnerID != nil && *tenant.OwnerID > 0 {
		updates["ownerId"] = *tenant.OwnerID
	}
	return r.db.WithContext(ctx).Model(&Tenant{}).Where("id = ?", tenant.ID).Updates(updates).Error
}

func (r *tenantRepository) Create(ctx context.Context, tenant *Tenant) error {
	return r.db.WithContext(ctx).Create(tenant).Error
}

func (r *tenantRepository) List(ctx context.Context) ([]Tenant, error) {
	var tenants []Tenant
	if err := r.db.WithContext(ctx).Order("name ASC").Find(&tenants).Error; err != nil {
		return nil, err
	}
	return tenants, nil
}

func (r *tenantRepository) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&Tenant{}, id).Error
}

func (r *tenantRepository) CreateSetting(ctx context.Context, setting *settings.Setting) error {
	return r.db.WithContext(ctx).Create(setting).Error
}
