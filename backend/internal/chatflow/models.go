package chatflow

import (
	"time"
	"gorm.io/gorm"
)

type ChatFlow struct {
	ID           uint           `gorm:"primaryKey" json:"id"`
	Name         string         `json:"name"`
	Flow         string         `gorm:"type:json" json:"flow"`
	IsActive     bool           `gorm:"column:isActive" json:"isActive"`
	IsDeleted    bool           `gorm:"column:isDeleted" json:"isDeleted"`
	CelularTeste string         `gorm:"column:celularTeste" json:"celularTeste"`
	UserID       uint           `gorm:"column:userId" json:"userId"`
	TenantID     uint           `gorm:"column:tenantId;default:1" json:"tenantId"`
	CreatedAt    time.Time      `gorm:"column:createdAt" json:"createdAt"`
	UpdatedAt    time.Time      `gorm:"column:updatedAt" json:"updatedAt"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"deletedAt,omitempty"`
}

func (ChatFlow) TableName() string {
	return "ChatFlows"
}

type AutoReply struct {
	ID           uint           `gorm:"primaryKey" json:"id"`
	Name         string         `json:"name"`
	CelularTeste string         `gorm:"column:celularTeste" json:"celularTeste"`
	Action       int            `json:"action"`
	TenantID     uint           `gorm:"column:tenantId;default:1" json:"tenantId"`
	CreatedAt    time.Time      `gorm:"column:createdAt" json:"createdAt"`
	UpdatedAt    time.Time      `gorm:"column:updatedAt" json:"updatedAt"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"deletedAt,omitempty"`
}

func (AutoReply) TableName() string {
	return "AutoReplies"
}

type StepsReply struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	Reply       string         `json:"reply"`
	InitialStep bool           `gorm:"column:initialStep" json:"initialStep"`
	AutoReplyID uint           `gorm:"column:autoReplyId" json:"autoReplyId"`
	CreatedAt   time.Time      `gorm:"column:createdAt" json:"createdAt"`
	UpdatedAt   time.Time      `gorm:"column:updatedAt" json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"deletedAt,omitempty"`
}

func (StepsReply) TableName() string {
	return "StepsReplies"
}
