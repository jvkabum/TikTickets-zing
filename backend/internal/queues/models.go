package queues

import (
	"time"

	"gorm.io/gorm"
)

type Queue struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Name      string         `gorm:"not null" json:"name"`
	Color     string         `gorm:"not null" json:"color"`
	Greeting  string         `json:"greeting"`
	TenantID  uint           `gorm:"column:tenantId;default:1" json:"tenantId"`
	CreatedAt time.Time      `gorm:"column:createdAt" json:"createdAt"`
	UpdatedAt time.Time      `gorm:"column:updatedAt" json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deletedAt,omitempty"`
}

func (Queue) TableName() string {
	return "Queues"
}
