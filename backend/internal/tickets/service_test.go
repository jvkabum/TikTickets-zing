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
func (m *mockTicketRepository) GetMessageByAnyID(ctx context.Context, tenantID uint, messageID string) (*Message, error) {
	return nil, nil
}
func (m *mockTicketRepository) UpdateMessageBody(ctx context.Context, tenantID uint, messageID string, newBody string) (*Message, error) {
	return nil, nil
}
func (m *mockTicketRepository) DeleteMessage(ctx context.Context, messageID string) error {
	return nil
}
func (m *mockTicketRepository) FindOrCreateTicketForContact(ctx context.Context, tenantID uint, contactID uint) (*Ticket, error) {
	return &Ticket{ID: 1, ContactID: contactID, TenantID: tenantID}, nil
}
func (m *mockTicketRepository) GetDefaultWhatsappID(ctx context.Context, tenantID uint) (uint, error) {
	return 1, nil
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

func (m *mockWaWorker) SendMessageReply(ctx context.Context, channelID uint, toJID string, text string, quotedID, quotedParticipant, quotedText string) (string, error) {
	m.sentJID = toJID
	m.sentText = text
	return "wa-msg-123", nil
}

func (m *mockWaWorker) SendMedia(ctx context.Context, channelID uint, toJID string, data []byte, filename string, mimeType string, mediaType string, caption string) (string, error) {
	m.sentJID = toJID
	m.sentText = filename
	return "wa-media-123", nil
}

func (m *mockWaWorker) SendMediaReply(ctx context.Context, channelID uint, toJID string, data []byte, filename string, mimeType string, mediaType string, caption string, quotedID, quotedParticipant, quotedText string) (string, error) {
	m.sentJID = toJID
	m.sentText = filename
	return "wa-media-123", nil
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

func TestCreateMessage_SendMedia_Success(t *testing.T) {
	whatsappID := uint(5)
	mediaType := "image"
	mediaName := "foto.jpg"
	repo := &mockTicketRepository{
		ticket: &Ticket{
			ID:         1,
			Status:     "open",
			TenantID:   10,
			WhatsappID: &whatsappID,
			Contact: &contacts.Contact{
				ID:     50,
				Number: "+55 (11) 98888-7777",
			},
		},
	}
	wa := &mockWaWorker{}
	service := NewTicketService(repo, nil, wa, nil)

	msg := &Message{
		Body:      "Legenda da foto",
		MediaType: &mediaType,
		MediaName: &mediaName,
	}
	mediaData := []byte("fake-image-bytes")
	err := service.CreateMessageWithMedia(context.Background(), 10, 1, msg, mediaData, "image/jpeg")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	expectedJID := "5511988887777@s.whatsapp.net"
	if wa.sentJID != expectedJID {
		t.Fatalf("expected media sent to %s, got %s", expectedJID, wa.sentJID)
	}
	if msg.MessageID != "wa-media-123" {
		t.Fatalf("expected messageID wa-media-123, got %s", msg.MessageID)
	}
}

func TestCreateMessage_FallbackDefaultWhatsappID(t *testing.T) {
	repo := &mockTicketRepository{
		ticket: &Ticket{
			ID:         1,
			Status:     "open",
			TenantID:   10,
			WhatsappID: nil, // sem canal explícito no ticket
			Contact: &contacts.Contact{
				ID:     50,
				Number: "5511999990000",
			},
		},
	}
	wa := &mockWaWorker{}
	service := NewTicketService(repo, nil, wa, nil)

	msg := &Message{Body: "Teste com canal fallback"}
	err := service.CreateMessage(context.Background(), 10, 1, msg)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	expectedJID := "5511999990000@s.whatsapp.net"
	if wa.sentJID != expectedJID {
		t.Fatalf("expected message sent to %s, got %s", expectedJID, wa.sentJID)
	}
	if msg.MessageID != "wa-msg-123" {
		t.Fatalf("expected messageID wa-msg-123, got %s", msg.MessageID)
	}
}

func TestCreateMessage_WithQuotedMessage(t *testing.T) {
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

	quotedMsgID := "original-msg-1"
	msg := &Message{
		Body:        "Resposta para a mensagem anterior",
		QuotedMsgID: &quotedMsgID,
		QuotedMsg: &Message{
			ID:        quotedMsgID,
			MessageID: "wa-original-123",
			Body:      "Mensagem original do cliente",
			FromMe:    false,
		},
	}
	err := service.CreateMessage(context.Background(), 10, 1, msg)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if wa.sentText != "Resposta para a mensagem anterior" {
		t.Fatalf("expected sentText 'Resposta para a mensagem anterior', got %s", wa.sentText)
	}
	if msg.QuotedMsg == nil || msg.QuotedMsg.MessageID != "wa-original-123" {
		t.Fatalf("expected QuotedMsg populated")
	}
}

func TestUpdateTicket_Realtime(t *testing.T) {
	repo := &mockTicketRepository{
		ticket: &Ticket{ID: 1, Status: "pending", TenantID: 10},
	}
	service := NewTicketService(repo, nil, nil, nil)

	repo.ticket.Status = "open"
	userID := uint(99)
	repo.ticket.UserID = &userID

	err := service.Update(context.Background(), repo.ticket)
	if err != nil {
		t.Fatalf("expected no error on update, got %v", err)
	}
	if repo.ticket.Status != "open" || *repo.ticket.UserID != 99 {
		t.Fatalf("expected ticket updated")
	}
}



