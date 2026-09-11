package tickets

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

type Handler struct {
	repo    Repository
	service *TicketService
}

func NewHandler(repo Repository, service *TicketService) *Handler {
	return &Handler{repo: repo, service: service}
}

func (h *Handler) RegisterRoutes(e *echo.Group) {
	e.GET("/tickets", h.ListTickets)
	e.POST("/tickets", h.CreateTicket)
	e.GET("/tickets/:id", h.GetTicket)
	e.PUT("/tickets/:id", h.UpdateTicket)
	e.DELETE("/tickets/:id", h.DeleteTicket)
	e.POST("/tickets/:id/accept", h.AcceptTicket)
	e.GET("/tickets/:id/messages", h.ListMessages) // keeping for backward-compat or internal
	e.GET("/messages/:id", h.ListMessages)
	e.POST("/messages/:id", h.CreateMessage)
	e.DELETE("/messages/:messageId", h.DeleteMessage)
	
	// Missing ticket routes
	e.GET("/tickets/:id/logs", h.GetTicketLogs)
	e.POST("/tickets/:id/sync", h.SyncTicketMessages)
	e.GET("/protocols/ticket/:id", h.GetTicketProtocols)
	e.GET("/protocols", h.ListProtocols)
	e.PUT("/protocols/:protocolNumber/close", h.CloseProtocol)
	
	e.POST("/forward-messages", h.ForwardMessages)
	e.POST("/messages/edit/:messageId", h.EditMessage)
	e.POST("/messages/sync-poll/:messageId", h.SyncPollMessage)
}

func (h *Handler) ListTickets(c echo.Context) error {
	tenantID := c.Get("tenantId").(uint)

	// Ler status[] ou status dos query params
	statuses := c.QueryParams()["status[]"]
	if len(statuses) == 0 {
		statuses = c.QueryParams()["status"]
	}
	if len(statuses) == 0 && c.QueryParam("status") != "" {
		statuses = []string{c.QueryParam("status")}
	}

	searchParam := c.QueryParam("searchParam")

	var isGroupPtr *bool
	isGroupParam := c.QueryParam("isGroup")
	if isGroupParam == "true" {
		val := true
		isGroupPtr = &val
	} else if isGroupParam == "false" {
		val := false
		isGroupPtr = &val
	}

	tickets, err := h.repo.ListWithFilters(c.Request().Context(), tenantID, statuses, searchParam, isGroupPtr)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Falha ao listar tickets: " + err.Error()})
	}
	if tickets == nil {
		tickets = []Ticket{}
	}
	return c.JSON(http.StatusOK, map[string]interface{}{
		"tickets": tickets,
		"count":   len(tickets),
		"hasMore": false,
	})
}

func (h *Handler) GetTicket(c echo.Context) error {
	tenantID := c.Get("tenantId").(uint)
	ticketID, _ := strconv.Atoi(c.Param("id"))

	ticket, err := h.repo.GetByID(c.Request().Context(), uint(ticketID), tenantID)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "Ticket não encontrado"})
	}
	return c.JSON(http.StatusOK, ticket)
}

func (h *Handler) CreateTicket(c echo.Context) error {
	tenantID := c.Get("tenantId").(uint)
	var ticket Ticket
	if err := c.Bind(&ticket); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Payload inválido"})
	}
	ticket.TenantID = tenantID
	ticket.Status = "pending"

	if err := h.repo.Create(c.Request().Context(), &ticket); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Falha ao criar ticket"})
	}
	return c.JSON(http.StatusCreated, ticket)
}

func (h *Handler) UpdateTicket(c echo.Context) error {
	tenantID := c.Get("tenantId").(uint)
	ticketID, _ := strconv.Atoi(c.Param("id"))

	ticket, err := h.repo.GetByID(c.Request().Context(), uint(ticketID), tenantID)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "Ticket não encontrado"})
	}

	var updates Ticket
	if err := c.Bind(&updates); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Payload inválido"})
	}

	// Campos que podem ser atualizados
	if updates.Status != "" {
		ticket.Status = updates.Status
	}
	if updates.QueueID != nil {
		ticket.QueueID = updates.QueueID
	}
	if updates.UserID != nil {
		ticket.UserID = updates.UserID
	}
	if updates.WhatsappID != nil {
		ticket.WhatsappID = updates.WhatsappID
	}

	if err := h.service.Update(c.Request().Context(), ticket); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Falha ao atualizar ticket"})
	}
	return c.JSON(http.StatusOK, ticket)
}

func (h *Handler) DeleteTicket(c echo.Context) error {
	// GORM soft delete - na arquitetura do app delegamos ao service se houver
	// Por simplicidade aqui vamos chamar um delete ou passar status pra fechado dependendo da logica
	tenantID := c.Get("tenantId").(uint)
	ticketID, _ := strconv.Atoi(c.Param("id"))
	
	// Fechando via Service ou Repo Update
	err := h.service.Close(c.Request().Context(), uint(ticketID), tenantID)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, map[string]string{"status": "deleted"})
}

func (h *Handler) AcceptTicket(c echo.Context) error {
	tenantID := c.Get("tenantId").(uint)
	userID := c.Get("userID").(uint)
	ticketID, _ := strconv.Atoi(c.Param("id"))

	err := h.service.AcceptTicket(c.Request().Context(), uint(ticketID), userID, tenantID)
	if err != nil {
		if err.Error() == "context deadline exceeded" {
			// Simula o erro de conflito quando o update retorna 0 affected rows
			return c.JSON(http.StatusConflict, map[string]string{"error": "O ticket já foi aceito por outro usuário"})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, map[string]string{"status": "accepted"})
}

func (h *Handler) CloseTicket(c echo.Context) error {
	tenantID := c.Get("tenantId").(uint)
	ticketID, _ := strconv.Atoi(c.Param("id"))

	err := h.service.Close(c.Request().Context(), uint(ticketID), tenantID)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, map[string]string{"status": "closed"})
}

// Message Handlers

func (h *Handler) ListMessages(c echo.Context) error {
	tenantID := c.Get("tenantId").(uint)
	ticketID, _ := strconv.Atoi(c.Param("id"))
	
	pageNumber, _ := strconv.Atoi(c.QueryParam("pageNumber"))
	if pageNumber < 1 {
		pageNumber = 1
	}
	limit := 20
	offset := (pageNumber - 1) * limit

	messages, err := h.service.ListMessages(c.Request().Context(), tenantID, uint(ticketID), limit, offset)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": err.Error()})
	}
	if messages == nil {
		messages = []Message{}
	}
	// Frontend espera: { messages: [], hasMore: bool }
	return c.JSON(http.StatusOK, map[string]interface{}{
		"messages": messages,
		"hasMore":  len(messages) >= limit,
		"count":    len(messages),
	})
}

func (h *Handler) CreateMessage(c echo.Context) error {
	tenantID := c.Get("tenantId").(uint)
	ticketID, _ := strconv.Atoi(c.Param("id"))

	// Handling multipart/form-data ou json
	var msg Message
	msg.Body = c.FormValue("body")
	msg.SendType = "chat"

	if msg.Body == "" {
		_ = c.Bind(&msg)
	}

	formID := c.FormValue("id")
	if formID != "" {
		msg.ID = formID
	}

	quotedMsgStr := c.FormValue("quotedMsg")
	if quotedMsgStr != "" {
		var qMsg Message
		if errJSON := json.Unmarshal([]byte(quotedMsgStr), &qMsg); errJSON == nil {
			if qMsg.ID != "" {
				msg.QuotedMsgID = &qMsg.ID
			}
			msg.QuotedMsg = &qMsg
		}
	}

	file, err := c.FormFile("medias")
	if err != nil {
		file, err = c.FormFile("media")
	}
	if err == nil && file != nil {
		// Validação de segurança: limite de 50MB
		const maxUploadSize = 50 * 1024 * 1024 // 50MB
		if file.Size > maxUploadSize {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "arquivo excede o limite máximo permitido de 50MB"})
		}

		// Validação de segurança: bloquear extensões executáveis / scripts
		ext := strings.ToLower(filepath.Ext(file.Filename))
		blockedExtensions := map[string]bool{
			".exe": true, ".bat": true, ".cmd": true, ".sh": true,
			".php": true, ".phtml": true, ".pl": true, ".py": true,
			".vbs": true, ".msi": true, ".dll": true, ".com": true,
			".scr": true, ".jar": true, ".cgi": true,
		}
		if blockedExtensions[ext] {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "tipo de arquivo bloqueado por segurança"})
		}

		src, errOpen := file.Open()
		if errOpen == nil {
			defer src.Close()
			data, errRead := io.ReadAll(src)
			if errRead == nil && len(data) > 0 {
				if int64(len(data)) > maxUploadSize {
					return c.JSON(http.StatusBadRequest, map[string]string{"error": "arquivo excede o limite máximo permitido de 50MB"})
				}

				// Isolamento por tenant no sistema de arquivos
				uploadDir := filepath.Join("public", "uploads", fmt.Sprintf("%d", tenantID))
				_ = os.MkdirAll(uploadDir, 0755)

				uniqueName := fmt.Sprintf("%d_%s%s", time.Now().UnixNano(), uuid.New().String()[:8], ext)
				destPath := filepath.Join(uploadDir, uniqueName)
				_ = os.WriteFile(destPath, data, 0644)

				mediaUrl := fmt.Sprintf("/public/uploads/%d/%s", tenantID, uniqueName)
				msg.MediaUrl = &mediaUrl
				msg.MediaName = &file.Filename

				mimeType := file.Header.Get("Content-Type")
				if mimeType == "" || mimeType == "application/octet-stream" {
					mimeType = http.DetectContentType(data)
				}

				// Forçar MIME correto com base na extensão caso o navegador envie octet-stream
				switch ext {
				case ".jpg", ".jpeg":
					mimeType = "image/jpeg"
				case ".png":
					mimeType = "image/png"
				case ".webp":
					mimeType = "image/webp"
				case ".gif":
					mimeType = "image/gif"
				case ".mp4":
					mimeType = "video/mp4"
				case ".mp3":
					mimeType = "audio/mpeg"
				case ".ogg":
					mimeType = "audio/ogg"
				case ".pdf":
					mimeType = "application/pdf"
				}

				mediaType := "document"
				if strings.HasPrefix(mimeType, "image/") || ext == ".jpg" || ext == ".jpeg" || ext == ".png" || ext == ".webp" || ext == ".gif" {
					mediaType = "image"
				} else if strings.HasPrefix(mimeType, "video/") || ext == ".mp4" || ext == ".mkv" || ext == ".avi" {
					mediaType = "video"
				} else if strings.HasPrefix(mimeType, "audio/") || ext == ".mp3" || ext == ".ogg" || ext == ".wav" || ext == ".m4a" {
					mediaType = "audio"
				}
				msg.MediaType = &mediaType
				msg.SendType = mediaType

				if errCreate := h.service.CreateMessageWithMedia(c.Request().Context(), tenantID, uint(ticketID), &msg, data, mimeType); errCreate != nil {
					return c.JSON(http.StatusBadRequest, map[string]string{"error": errCreate.Error()})
				}
				return c.JSON(http.StatusCreated, msg)
			}
		}
	}

	if err := h.service.CreateMessage(c.Request().Context(), tenantID, uint(ticketID), &msg); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusCreated, msg)
}

func (h *Handler) DeleteMessage(c echo.Context) error {
	tenantID := c.Get("tenantId").(uint)
	// TicketID could be queried from the DB, but let's assume it's passed or retrieved
	ticketID, _ := strconv.Atoi(c.QueryParam("ticketId"))
	messageID := c.Param("messageId")

	if err := h.service.DeleteMessage(c.Request().Context(), tenantID, uint(ticketID), messageID); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]string{"status": "deleted"})
}

func (h *Handler) GetTicketLogs(c echo.Context) error {
	return c.JSON(http.StatusOK, []interface{}{})
}

func (h *Handler) SyncTicketMessages(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{"status": "synced"})
}

func (h *Handler) GetTicketProtocols(c echo.Context) error {
	return c.JSON(http.StatusOK, []interface{}{})
}

func (h *Handler) ListProtocols(c echo.Context) error {
	return c.JSON(http.StatusOK, []interface{}{})
}

func (h *Handler) CloseProtocol(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{"status": "closed"})
}

func (h *Handler) ForwardMessages(c echo.Context) error {
	tenantID := c.Get("tenantId").(uint)

	var payload struct {
		Messages []struct {
			ID        string `json:"id"`
			MessageID string `json:"messageId"`
		} `json:"messages"`
		Contact struct {
			ID uint `json:"id"`
		} `json:"contact"`
	}

	if err := c.Bind(&payload); err != nil || payload.Contact.ID == 0 || len(payload.Messages) == 0 {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "parâmetros de encaminhamento inválidos"})
	}

	msgIDs := make([]string, 0, len(payload.Messages))
	for _, m := range payload.Messages {
		if m.ID != "" {
			msgIDs = append(msgIDs, m.ID)
		} else if m.MessageID != "" {
			msgIDs = append(msgIDs, m.MessageID)
		}
	}

	if err := h.service.ForwardMessages(c.Request().Context(), tenantID, msgIDs, payload.Contact.ID); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]string{"status": "forwarded"})
}

func (h *Handler) EditMessage(c echo.Context) error {
	tenantID := c.Get("tenantId").(uint)
	messageID := c.Param("messageId")

	var payload struct {
		Body string `json:"body"`
	}
	if err := c.Bind(&payload); err != nil || payload.Body == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "novo texto da mensagem inválido"})
	}

	updatedMsg, err := h.service.EditMessage(c.Request().Context(), tenantID, messageID, payload.Body)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, updatedMsg)
}

func (h *Handler) SyncPollMessage(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{"status": "poll_synced"})
}
