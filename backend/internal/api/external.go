package api

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

type ExternalHandler struct {
	repo Repository
}

func NewExternalHandler(repo Repository) *ExternalHandler {
	return &ExternalHandler{repo: repo}
}

// Middleware to authenticate external API tokens
func (h *ExternalHandler) ExternalAPIAuth(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		authHeader := c.Request().Header.Get("Authorization")
		if authHeader == "" {
			return c.JSON(http.StatusUnauthorized, map[string]string{"error": "missing authorization header"})
		}
		
		// Expected: Bearer <token>
		token := authHeader
		if len(authHeader) > 7 && authHeader[:7] == "Bearer " {
			token = authHeader[7:]
		}

		apiConfig, err := h.repo.GetByToken(c.Request().Context(), token)
		if err != nil || apiConfig == nil {
			return c.JSON(http.StatusUnauthorized, map[string]string{"error": "invalid or expired token"})
		}

		c.Set("tenantId", apiConfig.TenantID)
		c.Set("sessionId", apiConfig.SessionID)
		return next(c)
	}
}

func (h *ExternalHandler) RegisterRoutes(g *echo.Group) {
	// Ex: /api/v1/external/messages
	external := g.Group("/external")
	external.Use(h.ExternalAPIAuth)
	external.POST("/messages", h.SendMessage) // Nova API Go
	external.POST("/:apiId", h.LegacySendMessage) // API legado
	external.POST("/:apiId/start-session", h.LegacyStartSession) // API legado
}

func (h *ExternalHandler) SendMessage(c echo.Context) error {
	//tenantID := c.Get("tenantId").(uint)
	//sessionID := c.Get("sessionId").(uint)

	var payload struct {
		Number string `json:"number"`
		Body   string `json:"body"`
		Medias []string `json:"medias"`
	}
	if err := c.Bind(&payload); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid payload"})
	}

	// Aqui delegaríamos para o Channels (Whatsmeow) para realizar o disparo real
	// channelsWorker.SendMessage(...)

	return c.JSON(http.StatusOK, map[string]string{"status": "queued"})
}

func (h *ExternalHandler) LegacySendMessage(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{"status": "queued"})
}

func (h *ExternalHandler) LegacyStartSession(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{"status": "session_started"})
}
