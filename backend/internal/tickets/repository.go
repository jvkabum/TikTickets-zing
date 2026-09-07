package tickets

import (
	"context"
	"gorm.io/gorm"
)

type Repository interface {
	Create(ctx context.Context, ticket *Ticket) error
	GetByID(ctx context.Context, id uint, tenantID uint) (*Ticket, error)
	ListOpen(ctx context.Context, tenantID uint) ([]Ticket, error)
	Update(ctx context.Context, ticket *Ticket) error
	AcceptTicket(ctx context.Context, ticketID uint, userID uint, tenantID uint) error

	// Message methods
	ListMessages(ctx context.Context, ticketID uint, limit int, offset int) ([]Message, error)
	CreateMessage(ctx context.Context, message *Message) error
	GetMessageByID(ctx context.Context, messageID string) (*Message, error)
	DeleteMessage(ctx context.Context, messageID string) error
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
	if err := r.db.WithContext(ctx).Where("id = ? AND tenant_id = ?", id, tenantID).First(&ticket).Error; err != nil {
		return nil, err
	}
	return &ticket, nil
}

func (r *ticketRepository) ListOpen(ctx context.Context, tenantID uint) ([]Ticket, error) {
	var tickets []Ticket
	if err := r.db.WithContext(ctx).Where("status = ? AND tenant_id = ?", "open", tenantID).Find(&tickets).Error; err != nil {
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
	query := r.db.WithContext(ctx).Where("ticket_id = ?", ticketID).Order("created_at DESC")
	
	if limit > 0 {
		query = query.Limit(limit).Offset(offset)
	}

	if err := query.Find(&messages).Error; err != nil {
		return nil, err
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

func (r *ticketRepository) DeleteMessage(ctx context.Context, messageID string) error {
	return r.db.WithContext(ctx).Delete(&Message{}, "id = ?", messageID).Error
}
