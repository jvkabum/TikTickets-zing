package settings

import (
	"time"
)

type Setting struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Key       string         `gorm:"not null" json:"key"`
	Value     string         `gorm:"not null" json:"value"`
	TenantID  uint           `gorm:"column:tenantId;default:1" json:"tenantId"`
	CreatedAt time.Time      `gorm:"column:createdAt" json:"createdAt"`
	UpdatedAt time.Time      `gorm:"column:updatedAt" json:"updatedAt"`
}

func (Setting) TableName() string {
	return "Settings"
}
