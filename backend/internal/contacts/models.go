package contacts

import (
	"time"
	"gorm.io/gorm"
)

type Contact struct {
	ID            uint           `gorm:"primaryKey" json:"id"`
	Name          string         `json:"name"`
	Number        string         `json:"number"`
	ProfilePicUrl string         `gorm:"column:profilePicUrl" json:"profilePicUrl"`
	Pushname      string         `gorm:"column:pushname" json:"pushname"`
	Email         string         `json:"email"`
	ExtraInfo     string         `gorm:"column:extraInfo" json:"extraInfo"`
	TelegramID    string         `gorm:"column:telegramId" json:"telegramId"`
	InstagramPK   *uint          `gorm:"column:instagramPk" json:"instagramPk"`
	IsGroup       bool           `gorm:"column:isGroup" json:"isGroup"`
	TenantID      uint           `gorm:"column:tenantId;default:1" json:"tenantId"`
	CreatedAt     time.Time      `gorm:"column:createdAt" json:"createdAt"`
	UpdatedAt     time.Time      `gorm:"column:updatedAt" json:"updatedAt"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"deletedAt,omitempty"`
}

func (Contact) TableName() string {
	return "Contacts"
}

type ContactCustomField struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Name      string         `json:"name"`
	Value     string         `json:"value"`
	ContactID uint           `gorm:"column:contactId" json:"contactId"`
	CreatedAt time.Time      `gorm:"column:createdAt" json:"createdAt"`
	UpdatedAt time.Time      `gorm:"column:updatedAt" json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deletedAt,omitempty"`
}

func (ContactCustomField) TableName() string {
	return "ContactCustomFields"
}
