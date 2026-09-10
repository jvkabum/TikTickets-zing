package tags

import (
	"time"

	"gorm.io/gorm"
)

type Tag struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Tag       string         `gorm:"not null;column:tag" json:"tag"`
	Color     string         `gorm:"not null" json:"color"`
	IsActive  bool           `json:"isActive"`
	TenantID  uint           `gorm:"not null" json:"tenantId"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deletedAt,omitempty"`
}

func (Tag) TableName() string {
	return "Tags"
}
