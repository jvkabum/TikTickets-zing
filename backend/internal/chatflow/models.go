package chatflow

import (
	"time"
	"gorm.io/gorm"
)

type ChatFlow struct {
	ID           uint           `gorm:"primaryKey" json:"id"`
	Name         string         `json:"name"`
	Flow         string         `gorm:"type:json" json:"flow"`
	IsActive     bool           `json:"isActive"`
	IsDeleted    bool           `json:"isDeleted"`
	CelularTeste string         `json:"celularTeste"`
	UserID       uint           `json:"userId"`
	TenantID     uint           `gorm:"not null" json:"tenantId"`
	CreatedAt    time.Time      `json:"createdAt"`
	UpdatedAt    time.Time      `json:"updatedAt"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"deletedAt,omitempty"`
}

func (ChatFlow) TableName() string {
	return "ChatFlows"
}

type AutoReply struct {
	ID           uint           `gorm:"primaryKey"`
	Name         string
	CelularTeste string
	Action       int
	TenantID     uint           `gorm:"not null"`
	CreatedAt    time.Time
	UpdatedAt    time.Time
	DeletedAt    gorm.DeletedAt `gorm:"index"`
}

func (AutoReply) TableName() string {
	return "AutoReplies"
}

type StepsReply struct {
	ID          uint           `gorm:"primaryKey"`
	Reply       string
	InitialStep bool
	AutoReplyID uint
	CreatedAt   time.Time
	UpdatedAt   time.Time
	DeletedAt   gorm.DeletedAt `gorm:"index"`
}

func (StepsReply) TableName() string {
	return "StepsReplies"
}
