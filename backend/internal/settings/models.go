package settings

import (
	"time"

	"gorm.io/gorm"
)

type Setting struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Key       string         `gorm:"not null" json:"key"`
	Value     string         `gorm:"not null" json:"value"`
	TenantID  uint           `gorm:"not null" json:"tenantId"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deletedAt,omitempty"`
}

func (Setting) TableName() string {
	return "Settings"
}
