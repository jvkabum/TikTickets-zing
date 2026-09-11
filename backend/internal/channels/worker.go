package channels

import (
	"context"
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/google/uuid"
	_ "github.com/lib/pq"
	"go.mau.fi/whatsmeow"
	"go.mau.fi/whatsmeow/proto/waE2E"
	"go.mau.fi/whatsmeow/store"
	"go.mau.fi/whatsmeow/store/sqlstore"
	"go.mau.fi/whatsmeow/types"
	"go.mau.fi/whatsmeow/types/events"
	waLog "go.mau.fi/whatsmeow/util/log"
	"google.golang.org/protobuf/proto"
	"gorm.io/gorm"

	"github.com/tiktickets/backend-go/internal/contacts"
	"github.com/tiktickets/backend-go/internal/tickets"
)

type Worker interface {
	StartSession(ctx context.Context, channelID uint, tenantID uint) error
	StopSession(channelID uint) error
	SendMessage(ctx context.Context, channelID uint, toJID string, text string) (string, error)
	SendPoll(ctx context.Context, channelID uint, toJID string, question string, options []string, maxSelections int) (string, error)
	RevokeMessage(ctx context.Context, channelID uint, toJID string, msgID string) error
	SyncContacts(ctx context.Context, tenantID uint) (int64, error)
	AutoStartSessions(ctx context.Context)
}

type WhatsmeowWorker struct {
	repo           Repository
	clients        map[uint]*whatsmeow.Client
	clientsMutex   sync.RWMutex
	storeContainer *sqlstore.Container
	wsHub          *WsHub
	db             *gorm.DB
}

func NewWhatsmeowWorker(repo Repository, dbURI string, wsHub *WsHub, db *gorm.DB) (Worker, error) {
	// A engine Whatsmeow usa SQLStore puro (compatível com driver Postgres nativo ou SQLite)
	dbLog := waLog.Stdout("Database", "DEBUG", true)

	// dbURI precisa ser no padrão Postgres "postgres://user:pass@host/db"
	container, err := sqlstore.New(context.Background(), "postgres", dbURI, dbLog)
	if err != nil {
		return nil, fmt.Errorf("falha ao conectar o whatsmeow store: %w", err)
	}

	return &WhatsmeowWorker{
		repo:           repo,
		clients:        make(map[uint]*whatsmeow.Client),
		storeContainer: container,
		wsHub:          wsHub,
		db:             db,
	}, nil
}

func (w *WhatsmeowWorker) StartSession(ctx context.Context, channelID uint, tenantID uint) error {
	w.clientsMutex.Lock()
	defer w.clientsMutex.Unlock()

	if client, exists := w.clients[channelID]; exists && client != nil {
		if !client.IsConnected() {
			_ = client.Connect()
		}
		return nil
	}

	channel, err := w.repo.GetByID(ctx, channelID, tenantID)
	if err != nil {
		return fmt.Errorf("canal %d não encontrado: %w", channelID, err)
	}

	var deviceStore *store.Device

	// 1. Tentar obter pelo JID gravado na session
	if channel.Session != "" {
		jid, parseErr := types.ParseJID(channel.Session)
		if parseErr == nil {
			deviceStore, err = w.storeContainer.GetDevice(context.Background(), jid)
			if err != nil {
				log.Printf("Erro ao obter device para JID %s: %v", jid, err)
			}
		}
	}

	// 2. Se não encontrou por Session, tentar reutilizar algum device pareado existente no container
	if deviceStore == nil || deviceStore.ID == nil {
		devices, _ := w.storeContainer.GetAllDevices(context.Background())
		for _, dev := range devices {
			if dev != nil && dev.ID != nil {
				// Verifica se esse device já está em uso por outro canal
				inUse := false
				for chID, cl := range w.clients {
					if chID != channelID && cl != nil && cl.Store != nil && cl.Store.ID != nil && cl.Store.ID.String() == dev.ID.String() {
						inUse = true
						break
					}
				}
				if !inUse {
					deviceStore = dev
					channel.Session = dev.ID.String()
					channel.Number = dev.ID.User
					log.Printf("Associando device existente %s ao canal %d", dev.ID.String(), channelID)
					_ = w.repo.Update(ctx, channel)
					break
				}
			}
		}
	}

	if deviceStore == nil {
		log.Printf("Criando novo device para o canal %d", channelID)
		deviceStore = w.storeContainer.NewDevice()
	} else {
		log.Printf("Reutilizando device %s para o canal %d", deviceStore.ID, channelID)
	}

	clientLog := waLog.Stdout(fmt.Sprintf("Client-%d", channelID), "INFO", true)
	client := whatsmeow.NewClient(deviceStore, clientLog)

	client.AddEventHandler(func(evt interface{}) {
		w.eventHandler(channel, evt)
	})

	if client.Store.ID == nil {
		// Device não pareado, solicitando QR Code
		qrChan, _ := client.GetQRChannel(context.Background())
		err = client.Connect()
		if err != nil {
			return err
		}

		go func() {
			for evt := range qrChan {
				if evt.Event == "code" {
					log.Printf("NOVO QR CODE [Canal %d]: %s", channelID, evt.Code)

					channel.Qrcode = evt.Code
					channel.Status = "qrcode"
					_ = w.repo.Update(ctx, channel)

					payload := map[string]interface{}{
						"action":  "update",
						"session": channel,
					}
					eventMapName := fmt.Sprintf("%d:whatsappSession", tenantID)
					w.wsHub.Broadcast(eventMapName, payload)
				} else if evt.Event == "success" {
					log.Printf("QR Code lido com sucesso [Canal %d]! Conectado.", channelID)
					channel.Status = "CONNECTED"

					if client.Store.ID != nil {
						channel.Number = client.Store.ID.User
						channel.Session = client.Store.ID.String()
						picInfo, err := client.GetProfilePictureInfo(ctx, client.Store.ID.ToNonAD(), &whatsmeow.GetProfilePictureParams{})
						if err == nil && picInfo != nil {
							channel.ProfilePicUrl = picInfo.URL
						}
					}

					_ = w.repo.Update(ctx, channel)

					w.wsHub.Broadcast(fmt.Sprintf("%d:whatsappSession", tenantID), map[string]interface{}{
						"action":  "update",
						"session": channel,
					})

					// Sincroniza contatos do WhatsApp de imediato e com reforço de agenda
					w.scheduleContactSync(tenantID)
				} else if evt.Event == "timeout" {
					log.Printf("QR Code expirado [Canal %d]", channelID)
					channel.Status = "DISCONNECTED"
					_ = w.repo.Update(ctx, channel)

					w.wsHub.Broadcast(fmt.Sprintf("%d:whatsappSession", tenantID), map[string]interface{}{
						"action":  "update",
						"session": channel,
					})
				} else {
					log.Printf("Evento QR [Canal %d]: %s", channelID, evt.Event)
				}
			}
		}()
	} else {
		// Sessão já existe, apenas reconecta silenciosamente
		err = client.Connect()
		if err != nil {
			return err
		}
		log.Printf("Sessão Whatsmeow auto-reconectada para o canal %d (Número: %s)", channelID, client.Store.ID.User)
		channel.Status = "CONNECTED"
		if client.Store.ID != nil {
			channel.Session = client.Store.ID.String()
			channel.Number = client.Store.ID.User
		}
		_ = w.repo.Update(ctx, channel)

		// Sincroniza contatos com reforço
		w.scheduleContactSync(tenantID)
	}

	w.clients[channelID] = client
	return nil
}

func (w *WhatsmeowWorker) StopSession(channelID uint) error {
	w.clientsMutex.Lock()
	defer w.clientsMutex.Unlock()

	client, exists := w.clients[channelID]
	if !exists {
		return nil
	}

	client.Disconnect()
	delete(w.clients, channelID)
	log.Printf("Sessão Whatsmeow parada graciosamente para o canal %d", channelID)
	return nil
}

func (w *WhatsmeowWorker) eventHandler(channel *Whatsapp, evt interface{}) {
	switch v := evt.(type) {
	case *events.Message:
		w.handleIncomingMessage(channel, v)

	case *events.PairSuccess:
		log.Printf("[Canal %d] QR Code pareado com sucesso!", channel.ID)
		channel.Status = "PAIRING"
		_ = w.repo.Update(context.Background(), channel)
		w.wsHub.Broadcast(fmt.Sprintf("%d:whatsappSession", channel.TenantID), map[string]interface{}{
			"action":  "update",
			"session": channel,
		})

	case *events.Connected:
		log.Printf("[Canal %d] Conectado ao WhatsApp!", channel.ID)
		channel.Status = "CONNECTED"

		w.clientsMutex.RLock()
		client := w.clients[channel.ID]
		w.clientsMutex.RUnlock()
		if client != nil && client.Store.ID != nil {
			channel.Number = client.Store.ID.User
			channel.Session = client.Store.ID.String()
			picInfo, err := client.GetProfilePictureInfo(context.Background(), client.Store.ID.ToNonAD(), &whatsmeow.GetProfilePictureParams{})
			if err == nil && picInfo != nil {
				channel.ProfilePicUrl = picInfo.URL
			}
		}

		_ = w.repo.Update(context.Background(), channel)
		w.wsHub.Broadcast(fmt.Sprintf("%d:whatsappSession", channel.TenantID), map[string]interface{}{
			"action":  "update",
			"session": channel,
		})

		// Sincroniza contatos do WhatsApp de imediato e com reforços agendados
		w.scheduleContactSync(channel.TenantID)

	case *events.HistorySync:
		log.Printf("[Canal %d] Histórico e contatos descarregados pelo WhatsApp. Sincronizando contatos...", channel.ID)
		w.scheduleContactSync(channel.TenantID)

	case *events.LoggedOut:
		log.Printf("[Canal %d] Desconectado do WhatsApp!", channel.ID)
		channel.Status = "DISCONNECTED"
		_ = w.repo.Update(context.Background(), channel)
		w.wsHub.Broadcast(fmt.Sprintf("%d:whatsappSession", channel.TenantID), map[string]interface{}{
			"action":  "update",
			"session": channel,
		})

	case *events.Receipt:
		ackLevel := 1
		statusStr := "sended"

		switch v.Type {
		case types.ReceiptTypeSender:
			ackLevel = 1
			statusStr = "sended"
		case types.ReceiptTypeDelivered, "delivery", "delivered":
			ackLevel = 2
			statusStr = "delivered"
		case types.ReceiptTypeRead, types.ReceiptTypeReadSelf, types.ReceiptTypePlayed, types.ReceiptTypePlayedSelf:
			ackLevel = 3
			statusStr = "received"
		default:
			ackLevel = 2
			statusStr = "delivered"
		}

		if len(v.MessageIDs) > 0 {
			for _, mID := range v.MessageIDs {
				msgIDStr := string(mID)
				if msgIDStr == "" {
					continue
				}

				var dbMsg tickets.Message
				if errFind := w.db.Where("message_id = ? AND tenant_id = ?", msgIDStr, channel.TenantID).First(&dbMsg).Error; errFind == nil {
					// Atualiza no banco se o novo ack for superior
					if dbMsg.Ack < ackLevel {
						w.db.Model(&tickets.Message{}).Where("id = ?", dbMsg.ID).Updates(map[string]interface{}{
							"ack":    ackLevel,
							"status": statusStr,
						})
						dbMsg.Ack = ackLevel
						dbMsg.Status = statusStr
					}

					// Notifica websocket chat:ack para atualizar os tiques (enviado, recebido, lido)
					w.wsHub.Broadcast(fmt.Sprintf("%d:ticketList", channel.TenantID), map[string]interface{}{
						"type": "chat:ack",
						"payload": map[string]interface{}{
							"id":        dbMsg.ID,
							"messageId": dbMsg.MessageID,
							"ack":       ackLevel,
							"status":    statusStr,
							"ticketId":  dbMsg.TicketID,
						},
					})

					// Notifica canal tenant appMessage
					w.wsHub.Broadcast(fmt.Sprintf("tenant:%d:appMessage", channel.TenantID), map[string]interface{}{
						"action": "update",
						"message": map[string]interface{}{
							"id":        dbMsg.ID,
							"messageId": dbMsg.MessageID,
							"ack":       ackLevel,
							"status":    statusStr,
							"ticketId":  dbMsg.TicketID,
						},
					})
				} else {
					// Fallback: emite com o messageId para o frontend capturar
					w.wsHub.Broadcast(fmt.Sprintf("%d:ticketList", channel.TenantID), map[string]interface{}{
						"type": "chat:ack",
						"payload": map[string]interface{}{
							"messageId": msgIDStr,
							"ack":       ackLevel,
							"status":    statusStr,
						},
					})
				}
			}
		}

		// Se o próprio atendente leu a mensagem no celular (IsFromMe = true), zerar unread_messages do ticket
		if v.IsFromMe && (v.Type == types.ReceiptTypeRead || v.Type == types.ReceiptTypeReadSelf) {
			phone := ResolveContactNumber(nil, w.db, v.Chat)
			if phone != "" {
				var contact contacts.Contact
				if errC := w.db.Where("number = ? AND tenant_id = ?", phone, channel.TenantID).First(&contact).Error; errC == nil {
					var ticket tickets.Ticket
					if errT := w.db.Where("contact_id = ? AND tenant_id = ? AND status IN ('pending', 'open')", contact.ID, channel.TenantID).First(&ticket).Error; errT == nil {
						if ticket.UnreadMessages > 0 {
							ticket.UnreadMessages = 0
							w.db.Model(&tickets.Ticket{}).Where("id = ?", ticket.ID).Update("unread_messages", 0)
							ticket.Contact = &contact
							w.wsHub.Broadcast(fmt.Sprintf("%d:ticketList", channel.TenantID), map[string]interface{}{
								"type":    "ticket:update",
								"payload": ticket,
							})
						}
					}
				}
			}
		}
	}
}

// extractMessageBody extrai texto amigável ou identificação de mídia da mensagem
func extractMessageBody(msg *waE2E.Message) (body string, mediaType string) {
	if msg == nil {
		return "", "chat"
	}

	// 1. Enquetes (Poll Creation V1 a V6)
	if question, options := ExtractPollFromMessage(msg); question != "" || len(options) > 0 {
		return "📊 Enquete: " + question, "poll_creation"
	}

	if msg.Conversation != nil && *msg.Conversation != "" {
		return *msg.Conversation, "chat"
	}
	if msg.ExtendedTextMessage != nil && msg.ExtendedTextMessage.Text != nil {
		return *msg.ExtendedTextMessage.Text, "chat"
	}
	if msg.ImageMessage != nil {
		caption := ""
		if msg.ImageMessage.Caption != nil {
			caption = *msg.ImageMessage.Caption
		}
		if caption == "" {
			caption = "📷 Foto"
		}
		return caption, "image"
	}
	if msg.AudioMessage != nil {
		return "🎵 Áudio", "audio"
	}
	if msg.VideoMessage != nil {
		caption := ""
		if msg.VideoMessage.Caption != nil {
			caption = *msg.VideoMessage.Caption
		}
		if caption == "" {
			caption = "📹 Vídeo"
		}
		return caption, "video"
	}
	if msg.DocumentMessage != nil {
		title := "📄 Documento"
		if msg.DocumentMessage.Title != nil && *msg.DocumentMessage.Title != "" {
			title = "📄 " + *msg.DocumentMessage.Title
		}
		return title, "document"
	}
	if msg.StickerMessage != nil {
		return "🏷️ Figurinha", "sticker"
	}
	if msg.ContactMessage != nil {
		name := "👤 Contato"
		if msg.ContactMessage.DisplayName != nil && *msg.ContactMessage.DisplayName != "" {
			name = "👤 " + *msg.ContactMessage.DisplayName
		}
		return name, "contact"
	}
	return "", "chat"
}

// handleIncomingMessage processa integralmente a mensagem recebida pelo Whatsmeow:
// 1. Identifica remetente e chat
// 2. Cria ou atualiza o Contato no banco
// 3. Busca ou cria o Ticket em aberto
// 4. Salva o registro da Mensagem
// 5. Emite os broadcasts WebSocket para o frontend atualizar chat e lista em tempo real
func (w *WhatsmeowWorker) handleIncomingMessage(channel *Whatsapp, evt *events.Message) {
	if w.db == nil {
		log.Printf("[Canal %d] Banco de dados não configurado no WhatsmeowWorker", channel.ID)
		return
	}

	// 0. Interceptar e processar votos em enquete em tempo real
	if evt != nil && evt.Message != nil && evt.Message.GetPollUpdateMessage() != nil {
		w.clientsMutex.RLock()
		client := w.clients[channel.ID]
		w.clientsMutex.RUnlock()
		if client != nil {
			if err := ProcessPollVoteMessage(context.Background(), client, w.db, w.wsHub, channel.TenantID, evt); err != nil {
				log.Printf("[Canal %d] Erro ao processar voto de enquete: %v", channel.ID, err)
			}
		}
		return
	}

	body, mediaType := extractMessageBody(evt.Message)
	if body == "" {
		return
	}

	senderJID := evt.Info.Sender
	chatJID := evt.Info.Chat
	fromMe := evt.Info.IsFromMe
	isGroup := evt.Info.IsGroup

	var targetJID types.JID
	var defaultName string

	if isGroup {
		targetJID = chatJID
		defaultName = chatJID.User
	} else if fromMe {
		targetJID = chatJID
		defaultName = chatJID.User
	} else {
		targetJID = senderJID
		if evt.Info.PushName != "" {
			defaultName = evt.Info.PushName
		} else {
			defaultName = senderJID.User
		}
	}

	w.clientsMutex.RLock()
	client := w.clients[channel.ID]
	w.clientsMutex.RUnlock()

	// 1. Resolver identidade do contato com suporte nativo a LID e JID
	contact, errContact := ResolveContactIdentity(
		w.db,
		client,
		targetJID,
		defaultName,
		evt.Info.PushName,
		isGroup,
		channel.TenantID,
	)
	if errContact != nil || contact == nil {
		log.Printf("Erro ao resolver identidade do contato: %v", errContact)
		return
	}

	// Se o contato não possuir foto de perfil, busca e salva em background do WhatsApp
	if contact.ProfilePicUrl == "" {
		FetchAndSaveProfilePic(client, w.db, w.wsHub, contact.ID, targetJID, channel.TenantID)
	}

	log.Printf("[Canal %d / %s] Mensagem Recebida: %s (fromMe: %v, Contato ID: %d, LID: %s)",
		channel.ID, contact.Number, body, fromMe, contact.ID, contact.LID)

	now := time.Now()

	// 2. Buscar ou criar o Ticket aberto/pendente
	var ticket tickets.Ticket
	errTicket := w.db.Where("contact_id = ? AND tenant_id = ? AND status IN ('open', 'pending')", contact.ID, channel.TenantID).
		Order("created_at DESC").
		First(&ticket).Error

	isNewTicket := false
	if errTicket != nil {
		isNewTicket = true
		unread := 0
		if !fromMe {
			unread = 1
		}
		var defaultQueueID *uint
		var q struct {
			ID uint
		}
		if errQ := w.db.Table("Queues").Where("tenant_id = ?", channel.TenantID).Order("id ASC").Limit(1).Scan(&q).Error; errQ == nil && q.ID > 0 {
			defaultQueueID = &q.ID
		}

		ticket = tickets.Ticket{
			Status:         "pending",
			UnreadMessages: unread,
			LastMessage:    body,
			IsGroup:        contact.IsGroup,
			ContactID:      contact.ID,
			TenantID:       channel.TenantID,
			WhatsappID:     &channel.ID,
			QueueID:        defaultQueueID,
			CreatedAt:      now,
			UpdatedAt:      now,
		}
		if errCreateTicket := w.db.Create(&ticket).Error; errCreateTicket != nil {
			log.Printf("Erro ao criar ticket para mensagem recebida: %v", errCreateTicket)
			return
		}
	} else {
		ticket.LastMessage = body
		ticket.UpdatedAt = now
		if !fromMe {
			ticket.UnreadMessages++
		}
		if ticket.WhatsappID == nil {
			ticket.WhatsappID = &channel.ID
		}
		w.db.Save(&ticket)
	}

	// Vincula o ponteiro do contato ao ticket para serialização correta no socket
	ticket.Contact = contact

	// 3. Salvar a Mensagem em Messages
	msgID := evt.Info.ID
	if msgID == "" {
		msgID = uuid.New().String()
	}

	statusMsg := "received"
	if fromMe {
		statusMsg = "sended"
	}

	// Extrair metadados se for enquete (poll_creation)
	var pollDataJSON tickets.JSONRaw
	if question, options := ExtractPollFromMessage(evt.Message); question != "" || len(options) > 0 {
		pollJSONStr := BuildPollDataJSON(question, options)
		if pollJSONStr != "" {
			pollDataJSON = tickets.JSONRaw(pollJSONStr)
		}
	}

	var mediaTypePtr *string
	if mediaType != "chat" {
		mediaTypePtr = &mediaType
	}

	msgRecord := tickets.Message{
		ID:        uuid.New().String(),
		MessageID: msgID,
		TicketID:  ticket.ID,
		TenantID:  channel.TenantID,
		Body:      body,
		PollData:  pollDataJSON,
		MediaType: mediaTypePtr,
		FromMe:    fromMe,
		Read:      fromMe,
		SendType:  mediaType,
		Status:    statusMsg,
		Ack:       1,
		CreatedAt: now,
		UpdatedAt: now,
	}

	if errSaveMsg := w.db.Create(&msgRecord).Error; errSaveMsg != nil {
		log.Printf("Erro ao gravar mensagem em Messages: %v", errSaveMsg)
		return
	}

	// 4. Emitir eventos WebSocket em tempo real para o frontend
	if w.wsHub != nil {
		// Notifica o canal do tenant para o TicketList.vue (notificações e contadores)
		w.wsHub.Broadcast(fmt.Sprintf("tenant:%d:appMessage", channel.TenantID), map[string]interface{}{
			"action":  "create",
			"message": msgRecord,
			"ticket":  ticket,
		})

		// Notifica chat:create para renderizar no Chat.vue focado e emitir som
		w.wsHub.Broadcast(fmt.Sprintf("%d:ticketList", channel.TenantID), map[string]interface{}{
			"type": "chat:create",
			"payload": map[string]interface{}{
				"id":        msgRecord.ID,
				"messageId": msgRecord.MessageID,
				"body":      msgRecord.Body,
				"ack":       msgRecord.Ack,
				"status":    msgRecord.Status,
				"pollData":  msgRecord.PollData,
				"mediaType": msgRecord.MediaType,
				"fromMe":    msgRecord.FromMe,
				"read":      msgRecord.Read,
				"sendType":  msgRecord.SendType,
				"ticketId":  ticket.ID,
				"tenantId":  channel.TenantID,
				"createdAt": msgRecord.CreatedAt,
				"ticket":    ticket,
				"contact":   contact,
			},
		})

		// Atualiza a linha do ticket na lista de conversas
		w.wsHub.Broadcast(fmt.Sprintf("%d:ticketList", channel.TenantID), map[string]interface{}{
			"type":    "ticket:update",
			"payload": ticket,
		})

		// Se o ticket acabou de ser criado, notifica a fila de pendentes
		if isNewTicket {
			w.wsHub.Broadcast(fmt.Sprintf("%d:ticketList", channel.TenantID), map[string]interface{}{
				"type":    "notification:new",
				"payload": ticket,
			})
		}
	}
}

// SyncContacts sincroniza todos os contatos capturados pelo whatsmeow para a tabela Contacts
func (w *WhatsmeowWorker) SyncContacts(ctx context.Context, tenantID uint) (int64, error) {
	if w.db == nil {
		return 0, fmt.Errorf("banco de dados não configurado no worker")
	}

	// 1. Inserir/Atualizar contatos telefônicos reais (@s.whatsapp.net) e grupos (@g.us), IGNORANDO LIDs puros na coluna number!
	query := `
		INSERT INTO "Contacts" (name, number, pushname, is_group, tenant_id, created_at, updated_at)
		SELECT DISTINCT ON (split_part(split_part(c.their_jid, '@', 1), ':', 1))
			COALESCE(NULLIF(c.full_name, ''), NULLIF(c.push_name, ''), NULLIF(c.business_name, ''), NULLIF(c.first_name, ''), split_part(split_part(c.their_jid, '@', 1), ':', 1)) as name,
			split_part(split_part(c.their_jid, '@', 1), ':', 1) as number,
			c.push_name as pushname,
			(c.their_jid LIKE '%@g.us') as is_group,
			? as tenant_id,
			NOW() as created_at,
			NOW() as updated_at
		FROM whatsmeow_contacts c
		WHERE c.their_jid IS NOT NULL 
		  AND c.their_jid != '' 
		  AND c.their_jid NOT LIKE '%@lid'
		ORDER BY split_part(split_part(c.their_jid, '@', 1), ':', 1), (c.full_name IS NOT NULL AND c.full_name != '') DESC, (c.push_name IS NOT NULL AND c.push_name != '') DESC
		ON CONFLICT (number, tenant_id) DO UPDATE 
		SET 
			name = CASE 
				WHEN "Contacts".name IS NULL OR "Contacts".name = '' OR "Contacts".name = "Contacts".number 
				THEN EXCLUDED.name 
				ELSE "Contacts".name 
			END,
			pushname = COALESCE(NULLIF(EXCLUDED.pushname, ''), "Contacts".pushname),
			updated_at = NOW();
	`

	result := w.db.WithContext(ctx).Exec(query, tenantID)
	if result.Error != nil {
		log.Printf("[WhatsmeowWorker] Falha ao sincronizar contatos para o tenant %d: %v", tenantID, result.Error)
		return 0, result.Error
	}

	// 2. Preencher o campo LID nos contatos a partir do whatsmeow_lid_map
	_ = w.db.WithContext(ctx).Exec(`
		UPDATE "Contacts" c
		SET lid = split_part(split_part(m.lid, '@', 1), ':', 1)
		FROM whatsmeow_lid_map m
		WHERE c.number = split_part(split_part(m.pn, '@', 1), ':', 1)
		  AND c.tenant_id = ?
		  AND (c.lid IS NULL OR c.lid = '');
	`, tenantID)

	// 3. Reparar e unificar contatos preexistentes que tinham sido gravados com LID na coluna number
	repaired, _ := RepairLIDContacts(w.db, tenantID)
	if repaired > 0 {
		log.Printf("[WhatsmeowWorker] %d contato(s) reparado(s)/unificado(s) pelo mapeamento LID -> Phone no tenant %d", repaired, tenantID)
	}

	log.Printf("[WhatsmeowWorker] Sincronização de contatos do Whatsmeow concluída com sucesso! Tenant %d - %d contatos processados.", tenantID, result.RowsAffected)

	if w.wsHub != nil {
		w.wsHub.Broadcast(fmt.Sprintf("%d:contactList", tenantID), map[string]interface{}{
			"action": "reload",
		})
	}

	// 4. Enriquecer fotos de perfil para contatos sem foto em background
	go w.syncMissingProfilePics(tenantID)

	return result.RowsAffected, nil
}

// getClientForTenant retorna o primeiro cliente WhatsApp conectado para o tenant informado
func (w *WhatsmeowWorker) getClientForTenant(tenantID uint) *whatsmeow.Client {
	w.clientsMutex.RLock()
	defer w.clientsMutex.RUnlock()

	for chID, client := range w.clients {
		if client != nil && client.IsConnected() {
			var ch Whatsapp
			if err := w.db.Where("id = ? AND tenant_id = ?", chID, tenantID).First(&ch).Error; err == nil {
				return client
			}
		}
	}
	return nil
}

// syncMissingProfilePics busca fotos de perfil para contatos que ainda não possuem foto
func (w *WhatsmeowWorker) syncMissingProfilePics(tenantID uint) {
	defer func() {
		if r := recover(); r != nil {
			log.Printf("[ProfilePic] Recuperado de pânico em syncMissingProfilePics: %v", r)
		}
	}()

	client := w.getClientForTenant(tenantID)
	if client == nil {
		return
	}

	var contactsWithoutPic []contacts.Contact
	if err := w.db.Where("tenant_id = ? AND (profile_pic_url IS NULL OR profile_pic_url = '')", tenantID).
		Limit(50).
		Find(&contactsWithoutPic).Error; err != nil || len(contactsWithoutPic) == 0 {
		return
	}

	log.Printf("[ProfilePic] Encontrados %d contato(s) sem foto no tenant %d. Buscando fotos em background...", len(contactsWithoutPic), tenantID)

	for _, c := range contactsWithoutPic {
		if !client.IsConnected() {
			break
		}
		var targetJID types.JID
		if c.IsGroup {
			targetJID = types.NewJID(c.Number, types.GroupServer)
		} else {
			targetJID = types.NewJID(c.Number, types.DefaultUserServer)
		}
		FetchAndSaveProfilePic(client, w.db, w.wsHub, c.ID, targetJID, tenantID)
		time.Sleep(300 * time.Millisecond)
	}
}

// scheduleContactSync dispara uma sincronização imediata no ato do evento e reforços agendados (5s e 15s)
// para assegurar que toda a agenda descarregada pelo celular após o pareamento seja capturada sem perdas.
func (w *WhatsmeowWorker) scheduleContactSync(tenantID uint) {
	go func() {
		// 1. Sincronização imediata no ato do scan/conexão
		_, _ = w.SyncContacts(context.Background(), tenantID)

		// 2. Reforço após 5 segundos (quando o WhatsApp termina de descarregar os primeiros pacotes de contatos)
		time.Sleep(5 * time.Second)
		_, _ = w.SyncContacts(context.Background(), tenantID)

		// 3. Reforço após mais 10 segundos para agendas com milhares de contatos
		time.Sleep(10 * time.Second)
		_, _ = w.SyncContacts(context.Background(), tenantID)
	}()
}

func (w *WhatsmeowWorker) getOrConnectClient(ctx context.Context, channelID uint) (*whatsmeow.Client, error) {
	w.clientsMutex.RLock()
	client, exists := w.clients[channelID]
	w.clientsMutex.RUnlock()

	if exists && client != nil {
		if !client.IsConnected() {
			_ = client.Connect()
		}
		return client, nil
	}

	// 1. Tentar auto-iniciar a sessão do canal solicitado se existir no banco
	if w.db != nil && channelID > 0 {
		var ch Whatsapp
		if err := w.db.WithContext(ctx).First(&ch, "id = ?", channelID).Error; err == nil {
			log.Printf("[WhatsmeowWorker] Canal %d não estava em memória, auto-iniciando sessão...", channelID)
			if errStart := w.StartSession(ctx, channelID, ch.TenantID); errStart == nil {
				w.clientsMutex.RLock()
				client = w.clients[channelID]
				w.clientsMutex.RUnlock()
				if client != nil {
					if !client.IsConnected() {
						_ = client.Connect()
					}
					return client, nil
				}
			}
		}
	}

	// 2. Fallback: procurar qualquer outro canal já conectado no pool
	w.clientsMutex.RLock()
	for _, c := range w.clients {
		if c != nil && c.IsConnected() {
			client = c
			break
		}
	}
	w.clientsMutex.RUnlock()

	if client != nil {
		return client, nil
	}

	// 3. Fallback: se nenhum cliente ativo em memória, tentar auto-iniciar o primeiro canal com sessão no banco
	if w.db != nil {
		var activeCh Whatsapp
		if err := w.db.WithContext(ctx).Where("status = 'CONNECTED' OR session != ''").Order("is_default DESC, id ASC").First(&activeCh).Error; err == nil {
			log.Printf("[WhatsmeowWorker] Auto-iniciando canal ativo de fallback %d (%s)...", activeCh.ID, activeCh.Name)
			if errStart := w.StartSession(ctx, activeCh.ID, activeCh.TenantID); errStart == nil {
				w.clientsMutex.RLock()
				client = w.clients[activeCh.ID]
				w.clientsMutex.RUnlock()
				if client != nil {
					return client, nil
				}
			}
		}
	}

	return nil, fmt.Errorf("whatsapp não conectado. Verifique o status da conexão em Canais")
}

func (w *WhatsmeowWorker) AutoStartSessions(ctx context.Context) {
	if w.db == nil {
		return
	}

	var channelsList []Whatsapp
	if err := w.db.WithContext(ctx).Find(&channelsList).Error; err != nil {
		log.Printf("[WhatsmeowWorker] Erro ao listar canais para auto-start: %v", err)
		return
	}

	for _, ch := range channelsList {
		if ch.Type == "" || ch.Type == "whatsapp" {
			log.Printf("[WhatsmeowWorker] Auto-iniciando sessão do canal %d (%s)...", ch.ID, ch.Name)
			go func(channel Whatsapp) {
				if err := w.StartSession(context.Background(), channel.ID, channel.TenantID); err != nil {
					log.Printf("[WhatsmeowWorker] Falha ao auto-iniciar canal %d: %v", channel.ID, err)
				}
			}(ch)
		}
	}
}

func (w *WhatsmeowWorker) SendMessage(ctx context.Context, channelID uint, toJID string, text string) (string, error) {
	client, err := w.getOrConnectClient(ctx, channelID)
	if err != nil {
		return "", err
	}

	parsedJID, err := types.ParseJID(toJID)
	if err != nil {
		return "", err
	}

	resp, err := client.SendMessage(ctx, parsedJID, &waE2E.Message{
		Conversation: proto.String(text),
	})
	if err != nil {
		return "", err
	}
	return resp.ID, nil
}

func (w *WhatsmeowWorker) RevokeMessage(ctx context.Context, channelID uint, toJID string, msgID string) error {
	client, err := w.getOrConnectClient(ctx, channelID)
	if err != nil {
		return err
	}

	parsedJID, err := types.ParseJID(toJID)
	if err != nil {
		return err
	}

	_, err = client.RevokeMessage(ctx, parsedJID, types.MessageID(msgID))
	return err
}

func (w *WhatsmeowWorker) SendPoll(ctx context.Context, channelID uint, toJID string, question string, options []string, maxSelections int) (string, error) {
	client, err := w.getOrConnectClient(ctx, channelID)
	if err != nil {
		return "", err
	}

	parsedJID, err := types.ParseJID(toJID)
	if err != nil {
		return "", err
	}

	if maxSelections <= 0 {
		maxSelections = 1
	}

	msg := client.BuildPollCreation(question, options, maxSelections)
	resp, err := client.SendMessage(ctx, parsedJID, msg)
	if err != nil {
		return "", err
	}
	return resp.ID, nil
}


