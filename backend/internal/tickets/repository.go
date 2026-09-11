package tickets

import (
	"context"
	"fmt"
	"time"

	"gorm.io/gorm"
)

type Repository interface {
	Create(ctx context.Context, ticket *Ticket) error
	GetByID(ctx context.Context, id uint, tenantID uint) (*Ticket, error)
	ListOpen(ctx context.Context, tenantID uint) ([]Ticket, error)
	ListWithFilters(ctx context.Context, tenantID uint, statuses []string, searchParam string, isGroup *bool) ([]Ticket, error)
	Update(ctx context.Context, ticket *Ticket) error
	AcceptTicket(ctx context.Context, ticketID uint, userID uint, tenantID uint) error

	// Message methods
	ListMessages(ctx context.Context, ticketID uint, limit int, offset int) ([]Message, error)
	CreateMessage(ctx context.Context, message *Message) error
	GetMessageByID(ctx context.Context, messageID string) (*Message, error)
	GetMessageByAnyID(ctx context.Context, tenantID uint, messageID string) (*Message, error)
	UpdateMessageBody(ctx context.Context, tenantID uint, messageID string, newBody string) (*Message, error)
	DeleteMessage(ctx context.Context, messageID string) error
	FindOrCreateTicketForContact(ctx context.Context, tenantID uint, contactID uint) (*Ticket, error)
	GetDefaultWhatsappID(ctx context.Context, tenantID uint) (uint, error)
}

type ticketRepository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &ticketRepository{db: db}
}

func (r *ticketRepository) Create(ctx context.Context, ticket *Ticket) error {
	return r.db.WithContext(ctx).Create(ticket).Error
}

func (r *ticketRepository) GetByID(ctx context.Context, id uint, tenantID uint) (*Ticket, error) {
	var ticket Ticket
	if err := r.db.WithContext(ctx).
		Preload("Contact").
		Preload("User").
		Where("id = ? AND tenant_id = ?", id, tenantID).
		First(&ticket).Error; err != nil {
		return nil, err
	}
	return &ticket, nil
}

func (r *ticketRepository) ListOpen(ctx context.Context, tenantID uint) ([]Ticket, error) {
	var tickets []Ticket
	if err := r.db.WithContext(ctx).
		Preload("Contact").
		Preload("User").
		Where("status = ? AND tenant_id = ?", "open", tenantID).
		Order("updated_at DESC").
		Find(&tickets).Error; err != nil {
		return nil, err
	}
	return tickets, nil
}

func (r *ticketRepository) ListWithFilters(ctx context.Context, tenantID uint, statuses []string, searchParam string, isGroup *bool) ([]Ticket, error) {
	var tickets []Ticket
	query := r.db.WithContext(ctx).
		Preload("Contact").
		Preload("User").
		Where("\"Tickets\".tenant_id = ?", tenantID)

	if len(statuses) > 0 {
		query = query.Where("\"Tickets\".status IN ?", statuses)
	} else {
		query = query.Where("\"Tickets\".status IN ?", []string{"open", "pending"})
	}

	if isGroup != nil {
		if *isGroup {
			query = query.Where("\"Tickets\".is_group = ?", true)
		} else {
			query = query.Where("(\"Tickets\".is_group = ? OR \"Tickets\".is_group IS NULL)", false)
		}
	}

	if searchParam != "" {
		likeParam := "%" + searchParam + "%"
		query = query.Joins("LEFT JOIN \"Contacts\" ON \"Contacts\".id = \"Tickets\".contact_id").
			Where("\"Contacts\".name ILIKE ? OR \"Contacts\".number ILIKE ?", likeParam, likeParam)
	}

	query = query.Order("\"Tickets\".updated_at DESC")

	if err := query.Find(&tickets).Error; err != nil {
		return nil, err
	}
	return tickets, nil
}

func (r *ticketRepository) Update(ctx context.Context, ticket *Ticket) error {
	return r.db.WithContext(ctx).Save(ticket).Error
}

func (r *ticketRepository) AcceptTicket(ctx context.Context, ticketID uint, userID uint, tenantID uint) error {
	result := r.db.WithContext(ctx).
		Model(&Ticket{}).
		Where("id = ? AND tenant_id = ? AND status = ?", ticketID, tenantID, "pending").
		Updates(map[string]interface{}{
			"status":  "open",
			"user_id": userID,
		})

	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return context.DeadlineExceeded // or custom conflict error
	}
	return nil
}

func (r *ticketRepository) ListMessages(ctx context.Context, ticketID uint, limit int, offset int) ([]Message, error) {
	var messages []Message
	query := r.db.WithContext(ctx).Preload("QuotedMsg").Where("ticket_id = ?", ticketID).Order("created_at DESC")
	
	if limit > 0 {
		query = query.Limit(limit).Offset(offset)
	}

	if err := query.Find(&messages).Error; err != nil {
		return nil, err
	}

	// Inverte o slice para retornar em ordem cronológica ascendente (mais antigas no topo, mais recentes embaixo)
	for i, j := 0, len(messages)-1; i < j; i, j = i+1, j-1 {
		messages[i], messages[j] = messages[j], messages[i]
	}

	return messages, nil
}

func (r *ticketRepository) CreateMessage(ctx context.Context, message *Message) error {
	return r.db.WithContext(ctx).Create(message).Error
}

func (r *ticketRepository) GetMessageByID(ctx context.Context, messageID string) (*Message, error) {
	var message Message
	if err := r.db.WithContext(ctx).Where("id = ?", messageID).First(&message).Error; err != nil {
		return nil, err
	}
	return &message, nil
}

func (r *ticketRepository) GetMessageByAnyID(ctx context.Context, tenantID uint, messageID string) (*Message, error) {
	var message Message
	if err := r.db.WithContext(ctx).Where("(id = ? OR message_id = ?) AND tenant_id = ?", messageID, messageID, tenantID).First(&message).Error; err != nil {
		return nil, err
	}
	return &message, nil
}

func (r *ticketRepository) UpdateMessageBody(ctx context.Context, tenantID uint, messageID string, newBody string) (*Message, error) {
	msg, err := r.GetMessageByAnyID(ctx, tenantID, messageID)
	if err != nil {
		return nil, err
	}
	msg.Body = newBody
	msg.UpdatedAt = time.Now()
	if err := r.db.WithContext(ctx).Model(&Message{}).Where("id = ?", msg.ID).Updates(map[string]interface{}{
		"body":       newBody,
		"updated_at": msg.UpdatedAt,
	}).Error; err != nil {
		return nil, err
	}
	return msg, nil
}

func (r *ticketRepository) DeleteMessage(ctx context.Context, messageID string) error {
	return r.db.WithContext(ctx).Delete(&Message{}, "id = ?", messageID).Error
}

func (r *ticketRepository) FindOrCreateTicketForContact(ctx context.Context, tenantID uint, contactID uint) (*Ticket, error) {
	var ticket Ticket
	err := r.db.WithContext(ctx).
		Where("contact_id = ? AND tenant_id = ? AND status IN ('open', 'pending')", contactID, tenantID).
		Order("created_at DESC").
		First(&ticket).Error
	if err == nil {
		return &ticket, nil
	}

	now := time.Now()
	ticket = Ticket{
		Status:         "open",
		UnreadMessages: 0,
		ContactID:      contactID,
		TenantID:       tenantID,
		CreatedAt:      now,
		UpdatedAt:      now,
	}
	if errCreate := r.db.WithContext(ctx).Create(&ticket).Error; errCreate != nil {
		return nil, errCreate
	}
	return &ticket, nil
}

func (r *ticketRepository) GetDefaultWhatsappID(ctx context.Context, tenantID uint) (uint, error) {
	var ch struct {
		ID uint
	}
	if err := r.db.WithContext(ctx).Table("Whatsapps").Where("tenant_id = ? AND (status = 'CONNECTED' OR session != '')", tenantID).Order("is_default DESC, id ASC").Limit(1).Scan(&ch).Error; err == nil && ch.ID > 0 {
		return ch.ID, nil
	}
	return 0, fmt.Errorf("nenhum canal conectado para o tenant %d", tenantID)
}
