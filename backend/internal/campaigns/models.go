package campaigns

import (
	"time"
	"gorm.io/gorm"
)

type Campaign struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Name      string         `json:"name"`
	Status    string         `json:"status"`
	Message1  string         `json:"message1"`
	Message2  string         `json:"message2"`
	Message3  string         `json:"message3"`
	MediaUrl  string         `gorm:"column:mediaUrl" json:"mediaUrl"`
	Delay     int            `json:"delay"`
	TenantID  uint           `gorm:"column:tenantId;default:1" json:"tenantId"`
	CreatedAt time.Time      `gorm:"column:createdAt" json:"createdAt"`
	UpdatedAt time.Time      `gorm:"column:updatedAt" json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deletedAt,omitempty"`
}

func (Campaign) TableName() string {
	return "Campaigns"
}

type CampaignContact struct {
	ID            uint           `gorm:"primaryKey" json:"id"`
	Ack           int            `json:"ack"`
	MessageRandom string         `gorm:"column:messageRandom" json:"messageRandom"`
	CampaignID    uint           `gorm:"column:campaignId" json:"campaignId"`
	ContactID     uint           `gorm:"column:contactId" json:"contactId"`
	CreatedAt     time.Time      `gorm:"column:createdAt" json:"createdAt"`
	UpdatedAt     time.Time      `gorm:"column:updatedAt" json:"updatedAt"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"deletedAt,omitempty"`
}

func (CampaignContact) TableName() string {
	return "CampaignContacts"
}
