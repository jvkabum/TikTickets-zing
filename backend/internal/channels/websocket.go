package channels

import (
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"sync"

	"github.com/gorilla/websocket"
	"github.com/labstack/echo/v4"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		origin := r.Header.Get("Origin")
		if origin == "" {
			return true
		}
		u, err := url.Parse(origin)
		if err != nil {
			return false
		}
		// Valida mesma origem, mesmo hostname ou ambiente local
		reqHost := strings.Split(r.Host, ":")[0]
		originHost := strings.Split(u.Host, ":")[0]
		if strings.EqualFold(reqHost, originHost) ||
			strings.HasPrefix(originHost, "localhost") ||
			strings.HasPrefix(originHost, "127.0.0.1") {
			return true
		}
		return false
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
	// 1. Obter tenantID validado criptograficamente pelo middleware JWTAuth
	tenantIDVal := c.Get("tenantId")
	var tenantID uint
	if tid, ok := tenantIDVal.(uint); ok {
		tenantID = tid
	} else if tidFloat, ok := tenantIDVal.(float64); ok {
		tenantID = uint(tidFloat)
	}

	// Rejeição estrita se o tenant não foi autenticado pelo token JWT assinado
	if tenantID == 0 {
		return echo.NewHTTPError(http.StatusUnauthorized, "Não autorizado: tenant não autenticado")
	}

	ws, err := upgrader.Upgrade(c.Response(), c.Request(), nil)
	if err != nil {
		return err
	}
	defer ws.Close()

	hub.mu.Lock()
	hub.clients[ws] = tenantID
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

		// SEGURANÇA: O tenantID da conexão é IMUTÁVEL e vinculado estritamente ao token assinado.
		// Mensagens enviadas pelo cliente NÃO podem alterar o tenantID associado à conexão.
	}
	return nil
}

// BroadcastToTenant envia mensagem estritamente aos clientes de um tenant específico (Isolamento Multi-Tenant)
func (hub *WsHub) BroadcastToTenant(tenantID uint, msgType string, payload interface{}) {
	if tenantID == 0 {
		return
	}
	msg := WsMessage{Type: msgType, Payload: payload}

	hub.mu.RLock()
	defer hub.mu.RUnlock()

	for client, clientTenantID := range hub.clients {
		// Entrega estritamente se a conexão pertencer ao tenant alvo
		if clientTenantID == tenantID {
			if err := client.WriteJSON(msg); err != nil {
				client.Close()
			}
		}
	}
}

// Broadcast analisa se a mensagem tem prefixo de tenant e dispara broadcast isolado por tenant
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

	// Eventos globais sem tenant específico são emitidos a todos os clientes conectados
	msg := WsMessage{Type: msgType, Payload: payload}

	hub.mu.RLock()
	defer hub.mu.RUnlock()

	for client := range hub.clients {
		if err := client.WriteJSON(msg); err != nil {
			client.Close()
		}
	}
}
