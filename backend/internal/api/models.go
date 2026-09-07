package api

import (
	"time"
	"gorm.io/gorm"
)

type ApiConfig struct {
	ID        string         `gorm:"type:uuid;primaryKey"`
	SessionID uint
	Token     string
	TenantID  uint           `gorm:"not null"`
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt `gorm:"index"`
}

func (ApiConfig) TableName() string {
	return "ApiConfigs"
}
