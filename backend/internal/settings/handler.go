package settings

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

type Handler struct {
	repo Repository
	svc  *SettingService
}

func NewHandler(repo Repository, svc *SettingService) *Handler {
	return &Handler{repo: repo, svc: svc}
}

func (h *Handler) RegisterRoutes(g *echo.Group) {
	settings := g.Group("/settings")
	settings.GET("", h.ListSettings)
	settings.GET("/:settingKey", h.GetSetting)
	settings.PUT("/:settingKey", h.UpdateSetting)
	
	g.PUT("/admin/settings/:tenantId", h.AdminUpdateSettings)
}

func (h *Handler) ListSettings(c echo.Context) error {
	tenantID := c.Get("tenantId").(uint)
	settingsList, err := h.svc.List(c.Request().Context(), tenantID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, settingsList)
}

func (h *Handler) GetSetting(c echo.Context) error {
	tenantID := c.Get("tenantId").(uint)
	key := c.Param("settingKey")

	setting, err := h.svc.GetByKey(c.Request().Context(), tenantID, key)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "setting not found"})
	}
	return c.JSON(http.StatusOK, setting)
}

func (h *Handler) UpdateSetting(c echo.Context) error {
	tenantID := c.Get("tenantId").(uint)
	key := c.Param("settingKey")

	var payload struct {
		Value string `json:"value"`
	}
	if err := c.Bind(&payload); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid payload"})
	}

	if err := h.svc.UpdateOrCreate(c.Request().Context(), tenantID, key, payload.Value); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, map[string]string{"status": "updated"})
}

func (h *Handler) AdminUpdateSettings(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{"status": "updated"})
}
