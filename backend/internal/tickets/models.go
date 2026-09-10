package tickets

import (
	"time"
	"gorm.io/gorm"
)

type Ticket struct {
	ID                  uint           `gorm:"primaryKey" json:"id"`
	Status              string         `json:"status"` // pending, open, closed
	UnreadMessages      int            `gorm:"column:unread_messages" json:"unreadMessages"`
	LastMessage         string         `gorm:"column:last_message" json:"lastMessage"`
	IsGroup             bool           `gorm:"column:is_group" json:"isGroup"`
	IsActiveDemand      bool           `gorm:"column:is_active_demand" json:"isActiveDemand"`
	IsFarewellMessage   bool           `gorm:"column:is_farewell_message" json:"isFarewellMessage"`
	AttendanceCount     int            `gorm:"column:attendance_count" json:"attendanceCount"`
	ContactID           uint           `gorm:"column:contact_id;not null" json:"contactId"`
	UserID              *uint          `gorm:"column:user_id" json:"userId"`
	TenantID            uint           `gorm:"column:tenant_id;not null" json:"tenantId"`
	QueueID             *uint          `gorm:"column:queue_id" json:"queueId"`
	WhatsappID          *uint          `gorm:"column:whatsapp_id" json:"whatsappId"`
	ClosedAt            *time.Time     `gorm:"column:closed_at" json:"closedAt"`
	StartedAttendanceAt *time.Time     `gorm:"column:started_attendance_at" json:"startedAttendanceAt"`
	CreatedAt           time.Time      `gorm:"column:created_at" json:"createdAt"`
	UpdatedAt           time.Time      `gorm:"column:updated_at" json:"updatedAt"`
	DeletedAt           gorm.DeletedAt `gorm:"index;column:deleted_at" json:"deletedAt,omitempty"`
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
	MessageID   string         `gorm:"column:message_id" json:"messageId"`
	Ack         int            `json:"ack"`
	Status      string         `json:"status"`
	Read        bool           `json:"read"`
	FromMe      bool           `gorm:"column:from_me" json:"fromMe"`
	Body        string         `json:"body"`
	SendType    string         `gorm:"column:send_type" json:"sendType"`
	PollData    string         `gorm:"type:jsonb;column:poll_data" json:"pollData"`
	MediaUrl    *string        `gorm:"column:media_url" json:"mediaUrl"`
	MediaName   *string        `gorm:"column:media_name" json:"mediaName"`
	MediaType   *string        `gorm:"column:media_type" json:"mediaType"`
	TicketID    uint           `gorm:"column:ticket_id;not null" json:"ticketId"`
	TenantID    uint           `gorm:"column:tenant_id;not null" json:"tenantId"`
	QuotedMsgID *string        `gorm:"column:quoted_msg_id" json:"quotedMsgId"`
	CreatedAt   time.Time      `gorm:"column:created_at" json:"createdAt"`
	UpdatedAt   time.Time      `gorm:"column:updated_at" json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `gorm:"index;column:deleted_at" json:"deletedAt,omitempty"`
}

func (Message) TableName() string {
	return "Messages"
}
