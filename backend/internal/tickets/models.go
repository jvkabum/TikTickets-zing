package tickets

import (
	"time"
	"gorm.io/gorm"
)

type Ticket struct {
	ID                  uint           `gorm:"primaryKey" json:"id"`
	Status              string         `json:"status"` // pending, open, closed
	UnreadMessages      int            `gorm:"column:unreadMessages" json:"unreadMessages"`
	LastMessage         string         `gorm:"column:lastMessage" json:"lastMessage"`
	IsGroup             bool           `gorm:"column:isGroup" json:"isGroup"`
	IsActiveDemand      bool           `gorm:"column:isActiveDemand" json:"isActiveDemand"`
	IsFarewellMessage   bool           `gorm:"column:isFarewellMessage" json:"isFarewellMessage"`
	AttendanceCount     int            `gorm:"column:attendanceCount" json:"attendanceCount"`
	ContactID           uint           `gorm:"column:contactId;not null" json:"contactId"`
	UserID              *uint          `gorm:"column:userId" json:"userId"`
	TenantID            uint           `gorm:"column:tenantId;default:1" json:"tenantId"`
	QueueID             *uint          `gorm:"column:queueId" json:"queueId"`
	WhatsappID          *uint          `gorm:"column:whatsappId" json:"whatsappId"`
	ClosedAt            *time.Time     `gorm:"column:closedAt" json:"closedAt"`
	StartedAttendanceAt *time.Time     `gorm:"column:startedAttendanceAt" json:"startedAttendanceAt"`
	CreatedAt           time.Time      `gorm:"column:createdAt" json:"createdAt"`
	UpdatedAt           time.Time      `gorm:"column:updatedAt" json:"updatedAt"`
	DeletedAt           gorm.DeletedAt `gorm:"index" json:"deletedAt,omitempty"`
}

func (Ticket) TableName() string {
	return "Tickets"
}

type Protocol struct {
	ID             uint           `gorm:"primaryKey" json:"id"`
	ProtocolNumber string         `gorm:"column:protocolNumber" json:"protocolNumber"`
	Status         string         `json:"status"`
	TicketID       uint           `gorm:"column:ticketId" json:"ticketId"`
	CreatedAt      time.Time      `gorm:"column:createdAt" json:"createdAt"`
	UpdatedAt      time.Time      `gorm:"column:updatedAt" json:"updatedAt"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"deletedAt,omitempty"`
}

func (Protocol) TableName() string {
	return "Protocols"
}

type LogTicket struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Type      string         `json:"type"`
	TicketID  uint           `gorm:"column:ticketId" json:"ticketId"`
	CreatedAt time.Time      `gorm:"column:createdAt" json:"createdAt"`
	UpdatedAt time.Time      `gorm:"column:updatedAt" json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deletedAt,omitempty"`
}

func (LogTicket) TableName() string {
	return "LogTickets"
}

type Message struct {
	ID          string         `gorm:"type:uuid;primaryKey" json:"id"`
	MessageID   string         `gorm:"column:messageId" json:"messageId"`
	Ack         int            `json:"ack"`
	Status      string         `json:"status"`
	Read        bool           `json:"read"`
	FromMe      bool           `gorm:"column:fromMe" json:"fromMe"`
	Body        string         `json:"body"`
	SendType    string         `gorm:"column:sendType" json:"sendType"`
	PollData    string         `gorm:"type:jsonb;column:pollData" json:"pollData"`
	MediaUrl    *string        `gorm:"column:mediaUrl" json:"mediaUrl"`
	MediaName   *string        `gorm:"column:mediaName" json:"mediaName"`
	MediaType   *string        `gorm:"column:mediaType" json:"mediaType"`
	TicketID    uint           `gorm:"column:ticketId;not null" json:"ticketId"`
	QuotedMsgID *string        `gorm:"column:quotedMsgId" json:"quotedMsgId"`
	CreatedAt   time.Time      `gorm:"column:createdAt" json:"createdAt"`
	UpdatedAt   time.Time      `gorm:"column:updatedAt" json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"deletedAt,omitempty"`
}

func (Message) TableName() string {
	return "Messages"
}
