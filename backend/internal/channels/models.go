package channels

import (
	"time"
	"gorm.io/gorm"
)

type Whatsapp struct {
	ID         uint           `gorm:"primaryKey" json:"id"`
	Name       string         `json:"name"`
	Session    string         `json:"session"`
	Qrcode     string         `json:"qrcode"`
	Status     string         `json:"status"`
	Type       string         `json:"type"`
	IsDefault  bool           `json:"isDefault"`
	TokenHook  string         `json:"tokenHook"`
	ChatFlowID    *uint          `json:"chatFlowId"`
	TenantID      uint           `gorm:"not null" json:"tenantId"`
	ProfilePicUrl string         `gorm:"column:profilePicUrl" json:"profilePicUrl"`
	Number        string         `json:"number"`
	Battery       string         `json:"battery"`
	Plugged       *bool          `json:"plugged"`
	CreatedAt     time.Time      `json:"createdAt"`
	UpdatedAt     time.Time      `json:"updatedAt"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"deletedAt,omitempty"`
}

func (Whatsapp) TableName() string {
	return "Whatsapps"
}
