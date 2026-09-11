package channels

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/tiktickets/backend-go/internal/tickets"
	"go.mau.fi/whatsmeow"
	"go.mau.fi/whatsmeow/proto/waE2E"
	"go.mau.fi/whatsmeow/types/events"
	"gorm.io/gorm"
)

// ProcessPollVoteMessage processa eventos de voto em enquete e atualiza os contadores no banco e no frontend
func ProcessPollVoteMessage(
	ctx context.Context,
	client *whatsmeow.Client,
	db *gorm.DB,
	wsHub *WsHub,
	tenantID uint,
	evt *events.Message,
) error {
	if evt == nil || evt.Message == nil || evt.Message.GetPollUpdateMessage() == nil {
		return nil
	}

	if client == nil {
		return fmt.Errorf("cliente whatsmeow não inicializado")
	}

	// 1. Descriptografar o voto com retentativas e fallback de Device (estratégia Gesttik)
	var pollVote *waE2E.PollVoteMessage
	var err error
	for attempt := 0; attempt < 3; attempt++ {
		pollVote, err = client.DecryptPollVote(ctx, evt)
		if err == nil && pollVote != nil {
			break
		}

		// Fallback: em grupos ou chats multi-device, zerar o Device do Chat JID
		originalChat := evt.Info.Chat
		evt.Info.Chat.Device = 0
		pollVote, err = client.DecryptPollVote(ctx, evt)
		evt.Info.Chat = originalChat
		if err == nil && pollVote != nil {
			break
		}

		time.Sleep(150 * time.Millisecond)
	}

	if err != nil || pollVote == nil {
		return fmt.Errorf("falha ao descriptografar voto da enquete: %w", err)
	}

	pollUpdate := evt.Message.GetPollUpdateMessage()
	pollID := pollUpdate.GetPollCreationMessageKey().GetID()
	if pollID == "" {
		return fmt.Errorf("voto recebido sem poll_id")
	}

	// 2. Localizar a mensagem da enquete no banco
	var pollMsg tickets.Message
	if errFind := db.Where("message_id = ? AND tenant_id = ?", pollID, tenantID).First(&pollMsg).Error; errFind != nil {
		return fmt.Errorf("mensagem da enquete %s não encontrada: %w", pollID, errFind)
	}

	// 3. Desserializar PollData existente
	var pollData PollDataStructure
	if len(pollMsg.PollData) > 0 {
		_ = json.Unmarshal(pollMsg.PollData, &pollData)
	}

	if len(pollData.Options) == 0 {
		return nil
	}

	// 4. Mapear votos e atualizar contadores
	selectedHashes := pollVote.GetSelectedOptions()
	for _, optHash := range selectedHashes {
		hashHex := fmt.Sprintf("%x", optHash)
		for i := range pollData.Options {
			if fmt.Sprintf("%x", GenerateOptionHash(pollData.Options[i].Name)) == hashHex {
				pollData.Options[i].Votes++
				break
			}
		}
	}

	// 5. Salvar novos votos no banco
	updatedBytes, errJSON := json.Marshal(pollData)
	if errJSON == nil {
		pollMsg.PollData = updatedBytes
		db.Model(&tickets.Message{}).Where("id = ?", pollMsg.ID).Update("poll_data", updatedBytes)
	}

	// 6. Notificar frontend via WebSocket em tempo real
	if wsHub != nil {
		wsHub.Broadcast(fmt.Sprintf("%d:ticketList", tenantID), map[string]interface{}{
			"type": "chat:update",
			"payload": map[string]interface{}{
				"id":        pollMsg.ID,
				"messageId": pollMsg.MessageID,
				"pollData":  pollData,
				"ticketId":  pollMsg.TicketID,
			},
		})
	}

	log.Printf("[POLL] Voto registrado para a enquete %s no tenant %d", pollID, tenantID)
	return nil
}
