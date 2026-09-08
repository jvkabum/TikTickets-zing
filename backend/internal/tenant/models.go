package tenant

import (
	"time"
)

type Tenant struct {
	ID                   uint           `gorm:"primaryKey" json:"id"`
	Status               string         `gorm:"default:'active'" json:"status"`
	Name                 string         `gorm:"not null" json:"name"`
	OwnerID              uint           `gorm:"column:ownerId;default:1" json:"ownerId"`
	BusinessHours        string         `gorm:"column:businessHours;type:jsonb" json:"businessHours"`
	MessageBusinessHours string         `gorm:"column:messageBusinessHours" json:"messageBusinessHours"`
	MaxUsers             *int           `gorm:"column:maxUsers" json:"maxUsers"`
	MaxConnections       *int           `gorm:"column:maxConnections" json:"maxConnections"`
	IsDemo               bool           `gorm:"column:isDemo;default:false" json:"isDemo"`
	CreatedAt            time.Time      `gorm:"column:createdAt" json:"createdAt"`
	UpdatedAt            time.Time      `gorm:"column:updatedAt" json:"updatedAt"`
}

func (Tenant) TableName() string {
	return "Tenants"
}
