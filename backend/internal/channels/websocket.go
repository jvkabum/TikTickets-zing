package channels

import (
	"log"
	"net/http"
	"github.com/gorilla/websocket"
	"github.com/labstack/echo/v4"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins for the migration phase
	},
}

// WsMessage reflete o payload recebido do frontend Vue.js atual (baseado no Socket.io legado)
type WsMessage struct {
	Type    string      `json:"type"`
	Payload interface{} `json:"payload"`
}

type WsHub struct {
	clients map[*websocket.Conn]bool
}

func NewWsHub() *WsHub {
	return &WsHub{
		clients: make(map[*websocket.Conn]bool),
	}
}

// HandleConnection lida com o upgrade do websocket e o loop de leitura
func (hub *WsHub) HandleConnection(c echo.Context) error {
	ws, err := upgrader.Upgrade(c.Response(), c.Request(), nil)
	if err != nil {
		return err
	}
	defer ws.Close()

	hub.clients[ws] = true
	defer delete(hub.clients, ws)

	for {
		var msg WsMessage
		err := ws.ReadJSON(&msg)
		if err != nil {
			log.Println("Error reading json.", err)
			break
		}
		// Dispatch action based on msg.Type
		log.Printf("Received WS Message: %s", msg.Type)
	}
	return nil
}

func (hub *WsHub) Broadcast(msgType string, payload interface{}) {
	msg := WsMessage{Type: msgType, Payload: payload}
	for client := range hub.clients {
		if err := client.WriteJSON(msg); err != nil {
			client.Close()
			delete(hub.clients, client)
		}
	}
}
