package tenant

import (
	"time"
	"gorm.io/gorm"
)

type Tenant struct {
	ID                   uint           `gorm:"primaryKey" json:"id"`
	Status               string         `gorm:"default:'active'" json:"status"`
	Name                 string         `gorm:"not null" json:"name"`
	OwnerID              *uint          `gorm:"column:owner_id" json:"ownerId"`
	BusinessHours        string         `gorm:"column:business_hours;type:jsonb" json:"businessHours"`
	MessageBusinessHours string         `gorm:"column:message_business_hours" json:"messageBusinessHours"`
	MaxUsers             *int           `gorm:"column:max_users" json:"maxUsers"`
	MaxConnections       *int           `gorm:"column:max_connections" json:"maxConnections"`
	IsDemo               bool           `gorm:"column:is_demo;default:false" json:"isDemo"`
	CreatedAt            time.Time      `gorm:"column:created_at" json:"createdAt"`
	UpdatedAt            time.Time      `gorm:"column:updated_at" json:"updatedAt"`
	DeletedAt            gorm.DeletedAt `gorm:"column:deleted_at;index" json:"deletedAt,omitempty"`
}

func (Tenant) TableName() string {
	return "Tenants"
}
