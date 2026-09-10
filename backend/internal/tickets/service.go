package tickets

import (
	"context"
	"errors"
	"time"

	"gorm.io/gorm"
)

type TaskQueue interface {
	EnqueueFarewell(ctx context.Context, ticketID, tenantID uint) error
}

type WhatsAppWorker interface {
	SendMessage(ctx context.Context, channelID uint, toJID string, text string) (string, error)
	RevokeMessage(ctx context.Context, channelID uint, toJID string, msgID string) error
}

type WsNotifier interface {
	Broadcast(msgType string, payload interface{})
}

type TicketService struct {
	repo       Repository
	queue      TaskQueue
	waWorker   WhatsAppWorker
	wsNotifier WsNotifier
}

func NewTicketService(repo Repository, queue TaskQueue, waWorker WhatsAppWorker, wsNotifier WsNotifier) *TicketService {
	return &TicketService{repo: repo, queue: queue, waWorker: waWorker, wsNotifier: wsNotifier}
}

// AcceptTicket lida com aceitação de ticket. Evita colisão (Concurrency/Race Condition) 
// onde 2 usuários puxam o mesmo ticket ao mesmo tempo.
func (s *TicketService) AcceptTicket(ctx context.Context, ticketID uint, userID uint, tenantID uint) error {
	// A lógica atômica real mora no Repositório
	err := s.repo.AcceptTicket(ctx, ticketID, userID, tenantID)
	if err != nil {
		return err
	}
	
	// Aqui dispararia Webhook ou Websocket de Broadcast para notificar 
	// aos demais usuários que o ticket sumiu da fila de 'pending'.
	if s.wsNotifier != nil {
		s.wsNotifier.Broadcast("TICKET_ACCEPTED", map[string]interface{}{
			"ticketId": ticketID,
			"userId":   userID,
			"tenantId": tenantID,
		})
	}
	return nil
}

// Close - Regra BR-MIGRAR-005: Disparo de farewellMessage
func (s *TicketService) Close(ctx context.Context, ticketID uint, tenantID uint) error {
	ticket, err := s.repo.GetByID(ctx, ticketID, tenantID)
	if err != nil {
		return err
	}
	
	if ticket.Status == "closed" {
		return errors.New("ticket already closed")
	}

	ticket.Status = "closed"
	// ticket.ClosedAt = time.Now() // Depende da Struct

	err = s.repo.Update(ctx, ticket)
	if err != nil {
		return err
	}

	// BR-MIGRAR-005: Emitir job assíncrono para fila disparar a mensagem de despedida
	if s.queue != nil {
		_ = s.queue.EnqueueFarewell(ctx, ticketID, tenantID)
	}
	
	return nil
}

// Message methods

func (s *TicketService) ListMessages(ctx context.Context, tenantID uint, ticketID uint, limit int, offset int) ([]Message, error) {
	// 1. Validar se o ticket existe e pertence ao tenant
	_, err := s.repo.GetByID(ctx, ticketID, tenantID)
	if err != nil {
		return nil, errors.New("ticket not found or access denied")
	}

	// 2. Buscar as mensagens
	return s.repo.ListMessages(ctx, ticketID, limit, offset)
}

func (s *TicketService) CreateMessage(ctx context.Context, tenantID uint, ticketID uint, msg *Message) error {
	// 1. Validar se o ticket existe
	ticket, err := s.repo.GetByID(ctx, ticketID, tenantID)
	if err != nil {
		return errors.New("ticket not found or access denied")
	}

	// 2. Enviar para fila do WhatsApp
	if s.waWorker != nil && ticket.WhatsappID != nil {
		// Pega o número do contato associado ao ticket
		// O ticket precisa carregar o Contact.Number. Vamos simular aqui:
		toJID := "5511999999999@s.whatsapp.net" // idealmente: ticket.Contact.Number + "@s.whatsapp.net"
		msgID, errWa := s.waWorker.SendMessage(ctx, *ticket.WhatsappID, toJID, msg.Body)
		if errWa != nil {
			return errors.New("falha ao enviar mensagem no whatsapp: " + errWa.Error())
		}
		msg.MessageID = msgID
	} else {
		msg.MessageID = "mock-uuid"
	}

	msg.TicketID = ticketID
	msg.FromMe = true

	// 3. Salvar no BD
	if err := s.repo.CreateMessage(ctx, msg); err != nil {
		return err
	}

	// 4. Emitir WsHub
	if s.wsNotifier != nil {
		s.wsNotifier.Broadcast("NEW_MESSAGE", map[string]interface{}{
			"ticketId": ticketID,
			"message":  msg,
		})
	}
	return nil
}

func (s *TicketService) DeleteMessage(ctx context.Context, tenantID uint, ticketID uint, messageID string) error {
	// 1. Validar ticket
	ticket, err := s.repo.GetByID(ctx, ticketID, tenantID)
	if err != nil {
		return errors.New("ticket not found or access denied")
	}

	// 2. Apagar lógica (Soft Delete) do DB
	if err := s.repo.DeleteMessage(ctx, messageID); err != nil {
		return err
	}

	// 3. Revoke no WhatsApp e WsHub update
	if s.waWorker != nil && ticket.WhatsappID != nil {
		toJID := "5511999999999@s.whatsapp.net" // idealmente: ticket.Contact.Number
		_ = s.waWorker.RevokeMessage(ctx, *ticket.WhatsappID, toJID, messageID)
	}

	if s.wsNotifier != nil {
		s.wsNotifier.Broadcast("MESSAGE_DELETED", map[string]interface{}{
			"ticketId":  ticketID,
			"messageId": messageID,
		})
	}

	return nil
}

type ZombieTicketWorker struct {
	db *gorm.DB
}

func NewZombieTicketWorker(db *gorm.DB) *ZombieTicketWorker {
	return &ZombieTicketWorker{db: db}
}

// CloseZombies - Regra BR-HUMANA-001: Fechamento Automático Zumbis
func (w *ZombieTicketWorker) CloseZombies(ctx context.Context, tenantID uint, daysToClose int) error {
	threshold := time.Now().AddDate(0, 0, -daysToClose)
	
	return w.db.WithContext(ctx).
		Model(&Ticket{}).
		Where("tenant_id = ? AND status = ? AND updated_at < ?", tenantID, "open", threshold).
		Update("status", "closed").Error
}
