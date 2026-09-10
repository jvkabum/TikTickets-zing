package tenant

import (
	"time"
	"gorm.io/gorm"
)

type Tenant struct {
	ID                   uint           `gorm:"primaryKey" json:"id"`
	Status               string         `gorm:"default:'active'" json:"status"`
	Name                 string         `gorm:"not null" json:"name"`
	OwnerID              *uint          `json:"ownerId"`
	BusinessHours        string         `gorm:"type:jsonb" json:"businessHours"`
	MessageBusinessHours string         `json:"messageBusinessHours"`
	MaxUsers             *int           `json:"maxUsers"`
	MaxConnections       *int           `json:"maxConnections"`
	IsDemo               bool           `gorm:"default:false" json:"isDemo"`
	CreatedAt            time.Time      `json:"createdAt"`
	UpdatedAt            time.Time      `json:"updatedAt"`
	DeletedAt            gorm.DeletedAt `gorm:"index" json:"deletedAt,omitempty"`
}

func (Tenant) TableName() string {
	return "Tenants"
}
