package tickets

import (
	"time"
	"gorm.io/gorm"
)

type Ticket struct {
	ID                  uint           `gorm:"primaryKey" json:"id"`
	Status              string         `json:"status"` // pending, open, closed
	UnreadMessages      int            `json:"unreadMessages"`
	LastMessage         string         `json:"lastMessage"`
	IsGroup             bool           `json:"isGroup"`
	IsActiveDemand      bool           `json:"isActiveDemand"`
	IsFarewellMessage   bool           `json:"isFarewellMessage"`
	AttendanceCount     int            `json:"attendanceCount"`
	ContactID           uint           `gorm:"not null" json:"contactId"`
	UserID              *uint          `json:"userId"`
	TenantID            uint           `gorm:"not null" json:"tenantId"`
	QueueID             *uint          `json:"queueId"`
	WhatsappID          *uint          `json:"whatsappId"`
	ClosedAt            *time.Time     `json:"closedAt"`
	StartedAttendanceAt *time.Time     `json:"startedAttendanceAt"`
	CreatedAt           time.Time      `json:"createdAt"`
	UpdatedAt           time.Time      `json:"updatedAt"`
	DeletedAt           gorm.DeletedAt `gorm:"index" json:"deletedAt,omitempty"`
}

func (Ticket) TableName() string {
	return "Tickets"
}

type Protocol struct {
	ID             uint           `gorm:"primaryKey" json:"id"`
	ProtocolNumber string         `json:"protocolNumber"`
	Status         string         `json:"status"`
	TicketID       uint           `json:"ticketId"`
	CreatedAt      time.Time      `json:"createdAt"`
	UpdatedAt      time.Time      `json:"updatedAt"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"deletedAt,omitempty"`
}

func (Protocol) TableName() string {
	return "Protocols"
}

type LogTicket struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Type      string         `json:"type"`
	TicketID  uint           `json:"ticketId"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deletedAt,omitempty"`
}

func (LogTicket) TableName() string {
	return "LogTickets"
}

type Message struct {
	ID          string         `gorm:"type:uuid;primaryKey" json:"id"`
	MessageID   string         `json:"messageId"`
	Ack         int            `json:"ack"`
	Status      string         `json:"status"`
	Read        bool           `json:"read"`
	FromMe      bool           `json:"fromMe"`
	Body        string         `json:"body"`
	SendType    string         `json:"sendType"`
	PollData    string         `gorm:"type:jsonb" json:"pollData"`
	MediaUrl    *string        `json:"mediaUrl"`
	MediaName   *string        `json:"mediaName"`
	MediaType   *string        `json:"mediaType"`
	TicketID    uint           `gorm:"not null" json:"ticketId"`
	QuotedMsgID *string        `json:"quotedMsgId"`
	CreatedAt   time.Time      `json:"createdAt"`
	UpdatedAt   time.Time      `json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"deletedAt,omitempty"`
}

func (Message) TableName() string {
	return "Messages"
}
