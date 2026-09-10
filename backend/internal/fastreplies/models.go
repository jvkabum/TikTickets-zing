package fastreplies

import (
	"time"

	"gorm.io/gorm"
)

type FastReply struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Key       string         `gorm:"not null" json:"key" form:"key"`
	Message   string         `gorm:"not null" json:"message" form:"message"`
	TenantID  uint           `gorm:"not null" json:"tenantId"`
	UserID    *uint          `json:"userId"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deletedAt,omitempty"`
}

func (FastReply) TableName() string {
	return "FastReplies"
}
