package webhooks

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

type Handler struct {
}

func NewHandler() *Handler {
	return &Handler{}
}

func (h *Handler) RegisterRoutes(g *echo.Group) {
	// Facebook Messenger Verification Challenge
	g.GET("/fb-messenger-hooks/:token", h.CheckServiceMessenger)
	// Facebook Messenger Incoming Webhook
	g.POST("/fb-messenger-hooks/:token", h.ReceivedRequestMessenger)
	
	// API 360 Incoming Webhook
	g.POST("/wabahooks/360/:token", h.ReceivedRequest360)
}

func (h *Handler) CheckServiceMessenger(c echo.Context) error {
	challenge := c.QueryParam("hub.challenge")
	return c.String(http.StatusOK, challenge)
}

func (h *Handler) ReceivedRequestMessenger(c echo.Context) error {
	// Recebe o payload do webhook do facebook
	// Emite o evento para a fila Asynq processar o recebimento no Chatflow ou na aba Tickets
	return c.JSON(http.StatusOK, map[string]string{"message": "Message add queue"})
}

func (h *Handler) ReceivedRequest360(c echo.Context) error {
	// token := c.Param("token")
	// Recebe o payload do WABA 360
	return c.JSON(http.StatusOK, map[string]string{"message": "Message add queue"})
}
