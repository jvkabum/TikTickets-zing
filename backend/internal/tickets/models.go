package tickets

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"

	"gorm.io/gorm"

	"github.com/tiktickets/backend-go/internal/auth"
	"github.com/tiktickets/backend-go/internal/contacts"
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

	Contact *contacts.Contact `gorm:"foreignKey:ContactID" json:"contact,omitempty"`
	User    *auth.User        `gorm:"foreignKey:UserID" json:"user,omitempty"`
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

// JSONRaw gerencia dados em formato JSON/JSONB no PostgreSQL e serialização HTTP/JSON
type JSONRaw []byte

// Value converte JSONRaw para valor do banco de dados (NULL se vazio)
func (j JSONRaw) Value() (driver.Value, error) {
	if len(j) == 0 || string(j) == "null" || string(j) == `""` {
		return nil, nil
	}
	return string(j), nil
}

// Scan lê do PostgreSQL para JSONRaw
func (j *JSONRaw) Scan(value interface{}) error {
	if value == nil {
		*j = nil
		return nil
	}
	var bytes []byte
	switch v := value.(type) {
	case []byte:
		bytes = v
	case string:
		bytes = []byte(v)
	default:
		return errors.New("cannot scan type into JSONRaw")
	}

	if len(bytes) == 0 {
		*j = nil
		return nil
	}

	// Se for uma string JSON duplamente codificada
	if len(bytes) > 1 && bytes[0] == '"' && bytes[len(bytes)-1] == '"' {
		var unquoted string
		if err := json.Unmarshal(bytes, &unquoted); err == nil {
			bytes = []byte(unquoted)
		}
	}

	*j = append((*j)[0:0], bytes...)
	return nil
}

// MarshalJSON serializa para JSON (retorna null se vazio)
func (j JSONRaw) MarshalJSON() ([]byte, error) {
	if len(j) == 0 || string(j) == "null" {
		return []byte("null"), nil
	}
	return j, nil
}

// UnmarshalJSON deserializa de JSON
func (j *JSONRaw) UnmarshalJSON(data []byte) error {
	if j == nil {
		return errors.New("JSONRaw: UnmarshalJSON on nil pointer")
	}
	if len(data) == 0 || string(data) == "null" {
		*j = nil
		return nil
	}
	if len(data) > 1 && data[0] == '"' && data[len(data)-1] == '"' {
		var unquoted string
		if err := json.Unmarshal(data, &unquoted); err == nil {
			*j = append((*j)[0:0], []byte(unquoted)...)
			return nil
		}
	}
	*j = append((*j)[0:0], data...)
	return nil
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
	PollData    JSONRaw        `gorm:"type:jsonb;column:poll_data" json:"pollData"`
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
