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
	MediaUrl  string         `json:"mediaUrl"`
	Delay     int            `json:"delay"`
	TenantID  uint           `gorm:"not null" json:"tenantId"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deletedAt,omitempty"`
}

func (Campaign) TableName() string {
	return "Campaigns"
}

type CampaignContact struct {
	ID            uint           `gorm:"primaryKey" json:"id"`
	Ack           int            `json:"ack"`
	MessageRandom string         `json:"messageRandom"`
	CampaignID    uint           `json:"campaignId"`
	ContactID     uint           `json:"contactId"`
	CreatedAt     time.Time      `json:"createdAt"`
	UpdatedAt     time.Time      `json:"updatedAt"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"deletedAt,omitempty"`
}

func (CampaignContact) TableName() string {
	return "CampaignContacts"
}
