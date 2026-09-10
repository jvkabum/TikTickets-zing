package tickets

import (
	"context"
	"errors"
	"testing"
)

type mockTicketRepository struct {
	ticket *Ticket
	err    error
	acceptErr error
}

func (m *mockTicketRepository) Create(ctx context.Context, ticket *Ticket) error { return nil }
func (m *mockTicketRepository) GetByID(ctx context.Context, id uint, tenantID uint) (*Ticket, error) {
	return m.ticket, m.err
}
func (m *mockTicketRepository) ListOpen(ctx context.Context, tenantID uint) ([]Ticket, error) {
	return nil, nil
}
func (m *mockTicketRepository) Update(ctx context.Context, ticket *Ticket) error { return nil }
func (m *mockTicketRepository) AcceptTicket(ctx context.Context, ticketID uint, userID uint, tenantID uint) error {
	return m.acceptErr
}
func (m *mockTicketRepository) ListMessages(ctx context.Context, ticketID uint, limit int, offset int) ([]Message, error) {
	return nil, nil
}
func (m *mockTicketRepository) CreateMessage(ctx context.Context, message *Message) error {
	return nil
}
func (m *mockTicketRepository) GetMessageByID(ctx context.Context, messageID string) (*Message, error) {
	return nil, nil
}
func (m *mockTicketRepository) DeleteMessage(ctx context.Context, messageID string) error {
	return nil
}

func TestAcceptTicket_Success(t *testing.T) {
	repo := &mockTicketRepository{acceptErr: nil}
	service := NewTicketService(repo, nil, nil, nil)

	err := service.AcceptTicket(context.Background(), 1, 100, 10)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
}

func TestAcceptTicket_Conflict(t *testing.T) {
	repo := &mockTicketRepository{acceptErr: context.DeadlineExceeded}
	service := NewTicketService(repo, nil, nil, nil)

	err := service.AcceptTicket(context.Background(), 1, 100, 10)
	if !errors.Is(err, context.DeadlineExceeded) {
		t.Fatalf("expected deadline exceeded (conflict) error, got %v", err)
	}
}

func TestCloseTicket_Success(t *testing.T) {
	repo := &mockTicketRepository{
		ticket: &Ticket{ID: 1, Status: "open", TenantID: 10},
	}
	service := NewTicketService(repo, nil, nil, nil)

	err := service.Close(context.Background(), 1, 10)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if repo.ticket.Status != "closed" {
		t.Fatalf("expected ticket status to be 'closed', got %s", repo.ticket.Status)
	}
}

func TestCloseTicket_AlreadyClosed(t *testing.T) {
	repo := &mockTicketRepository{
		ticket: &Ticket{ID: 1, Status: "closed", TenantID: 10},
	}
	service := NewTicketService(repo, nil, nil, nil)

	err := service.Close(context.Background(), 1, 10)
	if err == nil || err.Error() != "ticket already closed" {
		t.Fatalf("expected 'ticket already closed' error, got %v", err)
	}
}
