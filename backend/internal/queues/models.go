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
	TenantID  uint           `gorm:"not null" json:"tenantId"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deletedAt,omitempty"`
}

func (Queue) TableName() string {
	return "Queues"
}
