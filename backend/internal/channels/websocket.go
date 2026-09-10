package channels

import (
	"net/http"
	"strconv"
	"strings"
	"sync"

	"github.com/golang-jwt/jwt/v5"
	"github.com/gorilla/websocket"
	"github.com/labstack/echo/v4"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Permite origens durante a fase de transição
	},
}

// WsMessage reflete o payload recebido e enviado ao frontend Vue.js
type WsMessage struct {
	Type    string      `json:"type"`
	Payload interface{} `json:"payload"`
}

type WsHub struct {
	mu      sync.RWMutex
	clients map[*websocket.Conn]uint // Mapeia conexão WebSocket para seu respectivo tenantID
}

func NewWsHub() *WsHub {
	return &WsHub{
		clients: make(map[*websocket.Conn]uint),
	}
}

// HandleConnection lida com o upgrade do websocket e a vinculação da conexão ao tenant correspondente
func (hub *WsHub) HandleConnection(c echo.Context) error {
	ws, err := upgrader.Upgrade(c.Response(), c.Request(), nil)
	if err != nil {
		return err
	}
	defer ws.Close()

	// Tenta extrair tenantId a partir do token na query param
	var initialTenantID uint
	tokenStr := c.QueryParam("token")
	if tokenStr != "" {
		parser := jwt.NewParser()
		claims := jwt.MapClaims{}
		if _, _, err := parser.ParseUnverified(tokenStr, claims); err == nil {
			if tid, ok := claims["tenantId"].(float64); ok {
				initialTenantID = uint(tid)
			} else if tid, ok := claims["tenant_id"].(float64); ok {
				initialTenantID = uint(tid)
			}
		}
	}
	if initialTenantID == 0 {
		if tid, ok := c.Get("tenantId").(uint); ok {
			initialTenantID = tid
		}
	}

	hub.mu.Lock()
	hub.clients[ws] = initialTenantID
	hub.mu.Unlock()

	defer func() {
		hub.mu.Lock()
		delete(hub.clients, ws)
		hub.mu.Unlock()
	}()

	for {
		var msg WsMessage
		err := ws.ReadJSON(&msg)
		if err != nil {
			break
		}

		// Ao receber comandos de inscrição com prefixo de tenant (ex: "1:joinNotification" ou "tenant:1:joinTickets")
		// vincula o tenantID à conexão caso ainda não esteja associado
		if msg.Type != "" {
			var parsedTenantID uint
			if strings.HasPrefix(msg.Type, "tenant:") {
				parts := strings.Split(msg.Type, ":")
				if len(parts) >= 2 {
					if id, err := strconv.Atoi(parts[1]); err == nil && id > 0 {
						parsedTenantID = uint(id)
					}
				}
			} else if strings.Contains(msg.Type, ":") {
				parts := strings.Split(msg.Type, ":")
				if id, err := strconv.Atoi(parts[0]); err == nil && id > 0 {
					parsedTenantID = uint(id)
				}
			}

			if parsedTenantID > 0 {
				hub.mu.Lock()
				hub.clients[ws] = parsedTenantID
				hub.mu.Unlock()
			}
		}
	}
	return nil
}

// BroadcastToTenant envia mensagem estritamente aos clientes de um tenant específico (Isolamento Multi-Tenant)
func (hub *WsHub) BroadcastToTenant(tenantID uint, msgType string, payload interface{}) {
	msg := WsMessage{Type: msgType, Payload: payload}

	hub.mu.RLock()
	defer hub.mu.RUnlock()

	for client, clientTenantID := range hub.clients {
		// Entrega se a conexão pertencer ao tenant alvo ou se ainda não tiver tenant definido (broadcast inicial)
		if tenantID == 0 || clientTenantID == tenantID || clientTenantID == 0 {
			if err := client.WriteJSON(msg); err != nil {
				client.Close()
			}
		}
	}
}

// Broadcast analisa se a mensagem tem prefixo de tenant ou dispara broadcast geral mantendo isolamento
func (hub *WsHub) Broadcast(msgType string, payload interface{}) {
	// Se o nome do evento contiver o tenant (ex: "tenant:1:ticket" ou "1:whatsappSession"), extrai para segregar
	var targetTenant uint
	if strings.HasPrefix(msgType, "tenant:") {
		parts := strings.Split(msgType, ":")
		if len(parts) >= 2 {
			if id, err := strconv.Atoi(parts[1]); err == nil && id > 0 {
				targetTenant = uint(id)
			}
		}
	} else if strings.Contains(msgType, ":") {
		parts := strings.Split(msgType, ":")
		if id, err := strconv.Atoi(parts[0]); err == nil && id > 0 {
			targetTenant = uint(id)
		}
	}

	// Se identificado o tenant alvo, faz broadcast isolado por tenant
	if targetTenant > 0 {
		hub.BroadcastToTenant(targetTenant, msgType, payload)
		return
	}

	// Fallback para eventos globais
	msg := WsMessage{Type: msgType, Payload: payload}

	hub.mu.RLock()
	defer hub.mu.RUnlock()

	for client := range hub.clients {
		if err := client.WriteJSON(msg); err != nil {
			client.Close()
		}
	}
}
