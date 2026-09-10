package fastreplies

import (
	"time"

	"gorm.io/gorm"
)

type FastReply struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Key       string         `gorm:"not null" json:"key" form:"key"`
	Message   string         `gorm:"not null" json:"message" form:"message"`
	TenantID  uint           `gorm:"column:tenantId;default:1" json:"tenantId" form:"tenantId"`
	UserID    *uint          `gorm:"column:userId" json:"userId" form:"userId"`
	CreatedAt time.Time      `gorm:"column:createdAt" json:"createdAt"`
	UpdatedAt time.Time      `gorm:"column:updatedAt" json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deletedAt,omitempty"`
}

func (FastReply) TableName() string {
	return "FastReplies"
}

type FastReplyRequest struct {
	Key      string `json:"key" form:"key"`
	Message  string `json:"message" form:"message"`
	TenantID uint   `json:"tenantId" form:"tenantId"`
	UserID   *uint  `json:"userId" form:"userId"`
}
