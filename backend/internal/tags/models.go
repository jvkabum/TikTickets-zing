package tags

import (
	"time"

	"gorm.io/gorm"
)

type Tag struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Tag       string         `gorm:"not null;column:tag" json:"tag"`
	Color     string         `gorm:"not null" json:"color"`
	IsActive  bool           `gorm:"column:isActive" json:"isActive"`
	TenantID  uint           `gorm:"column:tenantId;default:1" json:"tenantId"`
	CreatedAt time.Time      `gorm:"column:createdAt" json:"createdAt"`
	UpdatedAt time.Time      `gorm:"column:updatedAt" json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deletedAt,omitempty"`
}

func (Tag) TableName() string {
	return "Tags"
}
