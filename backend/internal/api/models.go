package api

import (
	"time"
	"gorm.io/gorm"
)

type ApiConfig struct {
	ID        string         `gorm:"type:uuid;primaryKey" json:"id"`
	SessionID uint           `gorm:"column:sessionId" json:"sessionId"`
	Token     string         `json:"token"`
	TenantID  uint           `gorm:"column:tenantId;default:1" json:"tenantId"`
	CreatedAt time.Time      `gorm:"column:createdAt" json:"createdAt"`
	UpdatedAt time.Time      `gorm:"column:updatedAt" json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deletedAt,omitempty"`
}

func (ApiConfig) TableName() string {
	return "ApiConfigs"
}
