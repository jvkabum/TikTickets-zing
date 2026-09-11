package tickets

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type TaskQueue interface {
	EnqueueFarewell(ctx context.Context, ticketID, tenantID uint) error
}

type WhatsAppWorker interface {
	SendMessage(ctx context.Context, channelID uint, toJID string, text string) (string, error)
	SendPoll(ctx context.Context, channelID uint, toJID string, question string, options []string, maxSelections int) (string, error)
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
	
	// Notifica via WebSocket no formato esperado pelo frontend Vue 3
	if s.wsNotifier != nil {
		s.wsNotifier.Broadcast(fmt.Sprintf("tenant:%d:ticket", tenantID), map[string]interface{}{
			"action": "update",
			"ticket": map[string]interface{}{
				"id":       ticketID,
				"status":   "open",
				"userId":   userID,
				"tenantId": tenantID,
			},
		})
		s.wsNotifier.Broadcast(fmt.Sprintf("%d:ticketList", tenantID), map[string]interface{}{
			"type": "chat:update",
		})
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
	now := time.Now()
	ticket.ClosedAt = &now

	err = s.repo.Update(ctx, ticket)
	if err != nil {
		return err
	}

	// Notifica encerramento no formato do frontend
	if s.wsNotifier != nil {
		s.wsNotifier.Broadcast(fmt.Sprintf("tenant:%d:ticket", tenantID), map[string]interface{}{
			"action": "update",
			"ticket": ticket,
		})
		s.wsNotifier.Broadcast(fmt.Sprintf("%d:ticketList", tenantID), map[string]interface{}{
			"type": "chat:update",
		})
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
	// 1. Validar se o ticket existe e pertence ao tenant
	ticket, err := s.repo.GetByID(ctx, ticketID, tenantID)
	if err != nil {
		return errors.New("ticket not found or access denied")
	}

	// 2. Enviar para fila do WhatsApp
	if s.waWorker != nil {
		channelID := uint(0)
		if ticket.WhatsappID != nil {
			channelID = *ticket.WhatsappID
		}

		toJID := ""
		if ticket.Contact != nil {
			if ticket.Contact.Number != "" {
				if ticket.IsGroup || ticket.Contact.IsGroup {
					toJID = fmt.Sprintf("%s@g.us", ticket.Contact.Number)
				} else {
					toJID = fmt.Sprintf("%s@s.whatsapp.net", ticket.Contact.Number)
				}
			} else if ticket.Contact.LID != "" {
				toJID = fmt.Sprintf("%s@lid", ticket.Contact.LID)
			}
		}

		if toJID != "" {
			var msgID string
			var errWa error

			if msg.SendType == "poll_creation" || (msg.MediaType != nil && *msg.MediaType == "poll_creation") {
				var pollData struct {
					Name    string `json:"name"`
					Options []struct {
						Name string `json:"name"`
					} `json:"options"`
				}
				if len(msg.PollData) > 0 {
					_ = json.Unmarshal(msg.PollData, &pollData)
				}
				options := make([]string, 0, len(pollData.Options))
				for _, o := range pollData.Options {
					if o.Name != "" {
						options = append(options, o.Name)
					}
				}
				if len(options) >= 2 {
					msgID, errWa = s.waWorker.SendPoll(ctx, channelID, toJID, pollData.Name, options, 1)
				} else {
					msgID, errWa = s.waWorker.SendMessage(ctx, channelID, toJID, msg.Body)
				}
			} else {
				msgID, errWa = s.waWorker.SendMessage(ctx, channelID, toJID, msg.Body)
			}

			if errWa != nil {
				return errors.New("falha ao enviar mensagem no whatsapp: " + errWa.Error())
			}
			msg.MessageID = msgID
		} else {
			msg.MessageID = "mock-uuid"
		}
	} else {
		msg.MessageID = "mock-uuid"
	}

	msg.TicketID = ticketID
	msg.TenantID = tenantID
	msg.FromMe = true

	if msg.ID == "" {
		msg.ID = uuid.New().String()
	}
	if msg.Status == "" {
		msg.Status = "sended"
	}
	if msg.SendType == "" {
		msg.SendType = "chat"
	}
	if msg.Ack == 0 {
		msg.Ack = 1
	}
	now := time.Now()
	if msg.CreatedAt.IsZero() {
		msg.CreatedAt = now
	}
	if msg.UpdatedAt.IsZero() {
		msg.UpdatedAt = now
	}

	// 3. Salvar no BD
	if err := s.repo.CreateMessage(ctx, msg); err != nil {
		return err
	}

	// 4. Atualizar última mensagem do ticket
	ticket.LastMessage = msg.Body
	ticket.UpdatedAt = time.Now()
	_ = s.repo.Update(ctx, ticket)

	// 5. Emitir notificações WsHub no formato esperado pelo frontend Vue 3
	if s.wsNotifier != nil {
		s.wsNotifier.Broadcast(fmt.Sprintf("tenant:%d:appMessage", tenantID), map[string]interface{}{
			"action":  "create",
			"message": msg,
			"ticket":  ticket,
		})
		s.wsNotifier.Broadcast(fmt.Sprintf("%d:ticketList", tenantID), map[string]interface{}{
			"type": "chat:create",
			"payload": map[string]interface{}{
				"id":        msg.ID,
				"messageId": msg.MessageID,
				"body":      msg.Body,
				"ack":       msg.Ack,
				"status":    msg.Status,
				"fromMe":    true,
				"read":      true,
				"sendType":  msg.SendType,
				"ticketId":  ticketID,
				"tenantId":  tenantID,
				"createdAt": msg.CreatedAt,
				"ticket":    ticket,
				"contact":   ticket.Contact,
			},
		})
		s.wsNotifier.Broadcast(fmt.Sprintf("%d:ticketList", tenantID), map[string]interface{}{
			"type":    "ticket:update",
			"payload": ticket,
		})
		// Compatibilidade com listeners genéricos
		s.wsNotifier.Broadcast("NEW_MESSAGE", map[string]interface{}{
			"ticketId": ticketID,
			"tenantId": tenantID,
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
		toJID := "5511999999999@s.whatsapp.net"
		_ = s.waWorker.RevokeMessage(ctx, *ticket.WhatsappID, toJID, messageID)
	}

	if s.wsNotifier != nil {
		s.wsNotifier.Broadcast(fmt.Sprintf("tenant:%d:appMessage", tenantID), map[string]interface{}{
			"action":    "delete",
			"messageId": messageID,
			"ticketId":  ticketID,
		})
		s.wsNotifier.Broadcast("MESSAGE_DELETED", map[string]interface{}{
			"ticketId":  ticketID,
			"tenantId":  tenantID,
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
