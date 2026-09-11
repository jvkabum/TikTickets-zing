package contacts

import (
	"time"
	"gorm.io/gorm"
)

type Contact struct {
	ID            uint           `gorm:"primaryKey" json:"id"`
	Name          string         `json:"name"`
	Number        string         `json:"number"`
	LID           string         `gorm:"column:lid;index" json:"lid"`
	ProfilePicUrl string         `gorm:"column:profile_pic_url" json:"profilePicUrl"`
	Pushname      string         `json:"pushname"`
	Email         string         `json:"email"`
	ExtraInfo     string         `gorm:"column:extra_info" json:"extraInfo"`
	TelegramID    string         `gorm:"column:telegram_id" json:"telegramId"`
	InstagramPK   *uint          `gorm:"column:instagram_pk" json:"instagramPk"`
	IsGroup       bool           `gorm:"column:is_group" json:"isGroup"`
	TenantID      uint           `gorm:"column:tenant_id;not null" json:"tenantId"`
	CreatedAt     time.Time      `gorm:"column:created_at" json:"createdAt"`
	UpdatedAt     time.Time      `gorm:"column:updated_at" json:"updatedAt"`
	DeletedAt     gorm.DeletedAt `gorm:"index;column:deleted_at" json:"deletedAt,omitempty"`
}

func (Contact) TableName() string {
	return "Contacts"
}

type ContactCustomField struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Name      string         `json:"name"`
	Value     string         `json:"value"`
	ContactID uint           `gorm:"column:contact_id;not null" json:"contactId"`
	CreatedAt time.Time      `gorm:"column:created_at" json:"createdAt"`
	UpdatedAt time.Time      `gorm:"column:updated_at" json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index;column:deleted_at" json:"deletedAt,omitempty"`
}

func (ContactCustomField) TableName() string {
	return "ContactCustomFields"
}
