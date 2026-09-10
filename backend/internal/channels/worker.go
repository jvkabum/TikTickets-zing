package channels

import (
	"context"
	"fmt"
	"log"
	"sync"

	"go.mau.fi/whatsmeow"
	"go.mau.fi/whatsmeow/store"
	"go.mau.fi/whatsmeow/store/sqlstore"
	"go.mau.fi/whatsmeow/types"
	"go.mau.fi/whatsmeow/types/events"
	waLog "go.mau.fi/whatsmeow/util/log"
	"go.mau.fi/whatsmeow/proto/waE2E"
	"google.golang.org/protobuf/proto"
	_ "github.com/lib/pq"
)

type Worker interface {
	StartSession(ctx context.Context, channelID uint, tenantID uint) error
	StopSession(channelID uint) error
	SendMessage(ctx context.Context, channelID uint, toJID string, text string) (string, error)
	RevokeMessage(ctx context.Context, channelID uint, toJID string, msgID string) error
}

type WhatsmeowWorker struct {
	repo           Repository
	clients        map[uint]*whatsmeow.Client
	clientsMutex   sync.RWMutex
	storeContainer *sqlstore.Container
	wsHub          *WsHub
}

func NewWhatsmeowWorker(repo Repository, dbURI string, wsHub *WsHub) (Worker, error) {
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
	}, nil
}

func (w *WhatsmeowWorker) StartSession(ctx context.Context, channelID uint, tenantID uint) error {
	w.clientsMutex.Lock()
	defer w.clientsMutex.Unlock()

	if _, exists := w.clients[channelID]; exists {
		return fmt.Errorf("sessão já em execução para o canal %d", channelID)
	}

	channel, err := w.repo.GetByID(ctx, channelID, tenantID)
	if err != nil {
		return fmt.Errorf("canal %d não encontrado: %w", channelID, err)
	}

	var deviceStore *store.Device

	if channel.Session != "" {
		jid, parseErr := types.ParseJID(channel.Session)
		if parseErr == nil {
			deviceStore, err = w.storeContainer.GetDevice(context.Background(), jid)
			if err != nil {
				log.Printf("Erro ao obter device para JID %s: %v", jid, err)
			}
		}
	}

	if deviceStore == nil {
		log.Printf("Criando novo device para o canal %d", channelID)
		deviceStore = w.storeContainer.NewDevice()
	} else {
		log.Printf("Reutilizando device %s para o canal %d", channel.Session, channelID)
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
		log.Printf("Sessão Whatsmeow auto-reconectada para o canal %d", channelID)
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
		text := v.Message.GetConversation()
		if text == "" && v.Message.GetExtendedTextMessage() != nil {
			text = v.Message.GetExtendedTextMessage().GetText()
		}
		log.Printf("[Canal %d / %s] Mensagem Recebida: %s", channel.ID, v.Info.Sender.User, text)
		
		// 1. Verificar se usuário tem ticket aberto
		// 2. Se não tiver, passar para o Chatflow Engine (Bot)
		// 3. Se tiver ticket e não for do bot, gravar a mensagem no GORM Tickets
		
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

	case *events.LoggedOut:
		log.Printf("[Canal %d] Desconectado do WhatsApp!", channel.ID)
		channel.Status = "DISCONNECTED"
		_ = w.repo.Update(context.Background(), channel)
		w.wsHub.Broadcast(fmt.Sprintf("%d:whatsappSession", channel.TenantID), map[string]interface{}{
			"action":  "update",
			"session": channel,
		})

	case *events.Receipt:
		if v.Type == events.ReceiptTypeRead || v.Type == events.ReceiptTypeReadSelf {
			log.Printf("[Canal %d] Recibo de leitura. Mensagens: %v", channel.ID, v.MessageIDs)
			// TODO: Atualizar status do ticket para lido (Blue Ticks)
		}
	}
}

func (w *WhatsmeowWorker) SendMessage(ctx context.Context, channelID uint, toJID string, text string) (string, error) {
	w.clientsMutex.RLock()
	client, exists := w.clients[channelID]
	w.clientsMutex.RUnlock()
	
	if !exists {
		return "", fmt.Errorf("client not connected")
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
	w.clientsMutex.RLock()
	client, exists := w.clients[channelID]
	w.clientsMutex.RUnlock()
	
	if !exists {
		return fmt.Errorf("client not connected")
	}

	parsedJID, err := types.ParseJID(toJID)
	if err != nil {
		return err
	}

	_, err = client.RevokeMessage(ctx, parsedJID, types.MessageID(msgID))
	return err
}
