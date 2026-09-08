package channels

import (
	"time"
	"gorm.io/gorm"
)

type Whatsapp struct {
	ID            uint           `gorm:"primaryKey" json:"id"`
	Name          string         `json:"name"`
	Session       string         `json:"session"`
	Qrcode        string         `json:"qrcode"`
	Status        string         `json:"status"`
	Type          string         `json:"type"`
	IsDefault     bool           `gorm:"column:isDefault" json:"isDefault"`
	TokenHook     string         `gorm:"column:tokenHook" json:"tokenHook"`
	ChatFlowID    *uint          `gorm:"column:chatFlowId" json:"chatFlowId"`
	TenantID      uint           `gorm:"column:tenantId;default:1" json:"tenantId"`
	ProfilePicUrl string         `gorm:"column:profilePicUrl" json:"profilePicUrl"`
	Number        string         `json:"number"`
	Battery       string         `json:"battery"`
	Plugged       *bool          `json:"plugged"`
	CreatedAt     time.Time      `gorm:"column:createdAt" json:"createdAt"`
	UpdatedAt     time.Time      `gorm:"column:updatedAt" json:"updatedAt"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"deletedAt,omitempty"`
}

func (Whatsapp) TableName() string {
	return "Whatsapps"
}
