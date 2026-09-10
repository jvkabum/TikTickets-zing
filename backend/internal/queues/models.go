package queues

import (
	"time"

	"gorm.io/gorm"
)

type Queue struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Name      string         `gorm:"not null" json:"name"`
	Queue     string         `gorm:"-" json:"queue"` // Alias para total compatibilidade com frontend
	Color     string         `gorm:"default:'#2576d2'" json:"color"`
	Greeting  string         `json:"greeting"`
	IsActive  bool           `gorm:"column:isActive;default:true" json:"isActive"`
	TenantID  uint           `gorm:"column:tenantId;default:1" json:"tenantId"`
	CreatedAt time.Time      `gorm:"column:createdAt" json:"createdAt"`
	UpdatedAt time.Time      `gorm:"column:updatedAt" json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deletedAt,omitempty"`
}

func (Queue) TableName() string {
	return "Queues"
}

func (q *Queue) AfterFind(tx *gorm.DB) (err error) {
	q.Queue = q.Name
	return nil
}

func (q *Queue) BeforeSave(tx *gorm.DB) (err error) {
	if q.Name == "" && q.Queue != "" {
		q.Name = q.Queue
	}
	if q.Queue == "" && q.Name != "" {
		q.Queue = q.Name
	}
	if q.Color == "" {
		q.Color = "#2576d2"
	}
	return nil
}

type QueueRequest struct {
	Name     string `json:"name"`
	Queue    string `json:"queue"`
	Color    string `json:"color"`
	Greeting string `json:"greeting"`
	IsActive *bool  `json:"isActive"`
	TenantID uint   `json:"tenantId"`
}
