package controllers

import (
	"log"
	"net/http"
	"sync"

	"flowdeskpro-backend/models"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"gorm.io/gorm"
)

type WebSocketController struct {
	db *gorm.DB
	// Mapa de conexões ativas por empresa
	connections map[uint]map[*websocket.Conn]bool
	mutex       sync.RWMutex
}

type WebSocketMessage struct {
	Type    string      `json:"type"`
	Data    interface{} `json:"data"`
	CompanyID uint      `json:"company_id"`
}

type ChatMessage struct {
	ID        uint   `json:"id"`
	Body      string `json:"body"`
	FromMe    bool   `json:"fromMe"`
	ContactID uint   `json:"contact_id"`
	CompanyID uint   `json:"company_id"`
	UserID    *uint  `json:"user_id"`
	CreatedAt string `json:"created_at"`
}

func NewWebSocketController(db *gorm.DB) *WebSocketController {
	return &WebSocketController{
		db:          db,
		connections: make(map[uint]map[*websocket.Conn]bool),
	}
}

func (wc *WebSocketController) HandleWebSocket(c *gin.Context) {
	// Obter user_id do contexto (autenticado via middleware)
	userIDInterface, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário não autenticado"})
		return
	}

	userID, ok := userIDInterface.(uint)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "ID de usuário inválido"})
		return
	}

	// Obter empresa do usuário
	var user models.User
	if err := wc.db.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Usuário não encontrado"})
		return
	}

	if user.CompanyID == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Usuário não está associado a uma empresa"})
		return
	}

	companyID := *user.CompanyID

	// Configurar upgrade do WebSocket
	upgrader := websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			return true // Em produção, implementar verificação de origem
		},
	}

	// Fazer upgrade da conexão HTTP para WebSocket
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("Erro ao fazer upgrade para WebSocket: %v", err)
		return
	}
	defer conn.Close()

	// Adicionar conexão ao mapa
	wc.mutex.Lock()
	if wc.connections[companyID] == nil {
		wc.connections[companyID] = make(map[*websocket.Conn]bool)
	}
	wc.connections[companyID][conn] = true
	wc.mutex.Unlock()

	// Remover conexão quando sair
	defer func() {
		wc.mutex.Lock()
		delete(wc.connections[companyID], conn)
		if len(wc.connections[companyID]) == 0 {
			delete(wc.connections, companyID)
		}
		wc.mutex.Unlock()
	}()

	// Enviar mensagem de boas-vindas
	welcomeMsg := WebSocketMessage{
		Type:      "connection",
		Data:      "Conectado com sucesso",
		CompanyID: companyID,
	}
	conn.WriteJSON(welcomeMsg)

	// Loop principal para receber mensagens
	for {
		var msg WebSocketMessage
		err := conn.ReadJSON(&msg)
		if err != nil {
			log.Printf("Erro ao ler mensagem WebSocket: %v", err)
			break
		}

		// Processar mensagem baseada no tipo
		switch msg.Type {
		case "chat_message":
			wc.handleChatMessage(conn, msg, userID, companyID)
		case "typing":
			wc.broadcastToCompany(companyID, WebSocketMessage{
				Type:      "typing",
				Data:      msg.Data,
				CompanyID: companyID,
			}, conn)
		case "read_receipt":
			wc.handleReadReceipt(msg, companyID)
		default:
			log.Printf("Tipo de mensagem desconhecido: %s", msg.Type)
		}
	}
}

func (wc *WebSocketController) handleChatMessage(conn *websocket.Conn, msg WebSocketMessage, userID, companyID uint) {
	// Extrair dados da mensagem
	chatData, ok := msg.Data.(map[string]interface{})
	if !ok {
		conn.WriteJSON(gin.H{"error": "Formato de mensagem inválido"})
		return
	}

	// Criar mensagem no banco
	message := models.Message{
		Body:      chatData["body"].(string),
		FromMe:    true,
		ContactID: uint(chatData["contact_id"].(float64)),
		CompanyID: companyID,
		UserId:    &userID,
	}

	if err := wc.db.Create(&message).Error; err != nil {
		conn.WriteJSON(gin.H{"error": "Erro ao salvar mensagem"})
		return
	}

	// Preparar mensagem para broadcast
	broadcastMsg := WebSocketMessage{
		Type: "chat_message",
		Data: ChatMessage{
			ID:        message.ID,
			Body:      message.Body,
			FromMe:    message.FromMe,
			ContactID: message.ContactID,
			CompanyID: message.CompanyID,
			UserID:    message.UserId,
			CreatedAt: message.CreatedAt.Format("2006-01-02T15:04:05Z"),
		},
		CompanyID: companyID,
	}

	// Enviar para todos os usuários da empresa
	wc.broadcastToCompany(companyID, broadcastMsg, nil)
}

func (wc *WebSocketController) handleReadReceipt(msg WebSocketMessage, companyID uint) {
	// Implementar lógica de confirmação de leitura
	readData, ok := msg.Data.(map[string]interface{})
	if !ok {
		return
	}

	messageID := uint(readData["message_id"].(float64))

	// Atualizar status de leitura no banco
	wc.db.Model(&models.Message{}).Where("id = ? AND company_id = ?", messageID, companyID).Update("read", true)

	// Broadcast da confirmação de leitura
	wc.broadcastToCompany(companyID, WebSocketMessage{
		Type:      "read_receipt",
		Data:      readData,
		CompanyID: companyID,
	}, nil)
}

func (wc *WebSocketController) broadcastToCompany(companyID uint, msg WebSocketMessage, excludeConn *websocket.Conn) {
	wc.mutex.RLock()
	connections, exists := wc.connections[companyID]
	wc.mutex.RUnlock()

	if !exists {
		return
	}

	for conn := range connections {
		if conn != excludeConn {
			err := conn.WriteJSON(msg)
			if err != nil {
				log.Printf("Erro ao enviar mensagem WebSocket: %v", err)
				conn.Close()
			}
		}
	}
}

// Método para enviar mensagem para uma empresa específica (usado por outros controladores)
func (wc *WebSocketController) SendToCompany(companyID uint, msgType string, data interface{}) {
	wc.broadcastToCompany(companyID, WebSocketMessage{
		Type:      msgType,
		Data:      data,
		CompanyID: companyID,
	}, nil)
}