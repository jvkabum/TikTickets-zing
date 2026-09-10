package contacts

import (
	"time"
	"gorm.io/gorm"
)

type Contact struct {
	ID            uint           `gorm:"primaryKey" json:"id"`
	Name          string         `json:"name"`
	Number        string         `json:"number"`
	ProfilePicUrl string         `json:"profilePicUrl"`
	Pushname      string         `json:"pushname"`
	Email         string         `json:"email"`
	ExtraInfo     string         `json:"extraInfo"`
	TelegramID    string         `json:"telegramId"`
	InstagramPK   *uint          `json:"instagramPk"`
	IsGroup       bool           `json:"isGroup"`
	TenantID      uint           `gorm:"not null" json:"tenantId"`
	CreatedAt     time.Time      `json:"createdAt"`
	UpdatedAt     time.Time      `json:"updatedAt"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"deletedAt,omitempty"`
}

func (Contact) TableName() string {
	return "Contacts"
}

type ContactCustomField struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Name      string         `json:"name"`
	Value     string         `json:"value"`
	ContactID uint           `json:"contactId"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deletedAt,omitempty"`
}

func (ContactCustomField) TableName() string {
	return "ContactCustomFields"
}
