package tickets

import (
	"context"
	"errors"
	"testing"

	"github.com/tiktickets/backend-go/internal/contacts"
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
func (m *mockTicketRepository) ListWithFilters(ctx context.Context, tenantID uint, statuses []string, searchParam string, isGroup *bool) ([]Ticket, error) {
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

type mockWaWorker struct {
	sentJID  string
	sentText string
}

func (m *mockWaWorker) SendMessage(ctx context.Context, channelID uint, toJID string, text string) (string, error) {
	m.sentJID = toJID
	m.sentText = text
	return "wa-msg-123", nil
}

func (m *mockWaWorker) SendPoll(ctx context.Context, channelID uint, toJID string, question string, options []string, maxSelections int) (string, error) {
	m.sentJID = toJID
	m.sentText = question
	return "wa-poll-123", nil
}

func (m *mockWaWorker) RevokeMessage(ctx context.Context, channelID uint, toJID string, msgID string) error {
	return nil
}

func TestCreateMessage_SendsToRealContactJID(t *testing.T) {
	whatsappID := uint(1)
	repo := &mockTicketRepository{
		ticket: &Ticket{
			ID:         1,
			Status:     "open",
			TenantID:   10,
			WhatsappID: &whatsappID,
			Contact: &contacts.Contact{
				ID:     50,
				Number: "5511988887777",
			},
		},
	}
	wa := &mockWaWorker{}
	service := NewTicketService(repo, nil, wa, nil)

	msg := &Message{Body: "Olá mundo"}
	err := service.CreateMessage(context.Background(), 10, 1, msg)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	expectedJID := "5511988887777@s.whatsapp.net"
	if wa.sentJID != expectedJID {
		t.Fatalf("expected message sent to %s, got %s", expectedJID, wa.sentJID)
	}
	if msg.MessageID != "wa-msg-123" {
		t.Fatalf("expected messageID wa-msg-123, got %s", msg.MessageID)
	}
}

func TestCreateMessage_SendsPoll(t *testing.T) {
	whatsappID := uint(1)
	repo := &mockTicketRepository{
		ticket: &Ticket{
			ID:         1,
			Status:     "open",
			TenantID:   10,
			WhatsappID: &whatsappID,
			Contact: &contacts.Contact{
				ID:     50,
				Number: "5511988887777",
			},
		},
	}
	wa := &mockWaWorker{}
	service := NewTicketService(repo, nil, wa, nil)

	msg := &Message{
		Body:     "Qual o seu sabor favorito?",
		SendType: "poll_creation",
		PollData: JSONRaw(`{"name":"Qual o seu sabor favorito?","options":[{"name":"Chocolate"},{"name":"Morango"}]}`),
	}
	err := service.CreateMessage(context.Background(), 10, 1, msg)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	expectedJID := "5511988887777@s.whatsapp.net"
	if wa.sentJID != expectedJID {
		t.Fatalf("expected message sent to %s, got %s", expectedJID, wa.sentJID)
	}
	if wa.sentText != "Qual o seu sabor favorito?" {
		t.Fatalf("expected poll question sent, got %s", wa.sentText)
	}
	if msg.MessageID != "wa-poll-123" {
		t.Fatalf("expected messageID wa-poll-123, got %s", msg.MessageID)
	}
}

