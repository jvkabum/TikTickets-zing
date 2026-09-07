package facebook

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
	fb := g.Group("/fb")
	fb.POST("/register-pages", h.Store)
	fb.POST("/logout-pages", h.Logout)
}

func (h *Handler) Store(c echo.Context) error {
	// tenantID := c.Get("tenantId").(uint)
	var payload struct {
		Whatsapp  interface{} `json:"whatsapp"`
		AccountID string      `json:"accountId"`
		UserToken string      `json:"userToken"`
	}
	if err := c.Bind(&payload); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid payload"})
	}

	// 1. Obter Token Long-Lived da Graph API
	// 2. Vincular a página à conexão de Whatsapp(Canal) correspondente no Tenant

	return c.JSON(http.StatusOK, map[string]string{"status": "linked"})
}

func (h *Handler) Logout(c echo.Context) error {
	// tenantID := c.Get("tenantId").(uint)
	// Desvincula e apaga token
	return c.JSON(http.StatusOK, map[string]string{"status": "unlinked"})
}
