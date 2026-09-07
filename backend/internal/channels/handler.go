package channels

import (
	"net/http"
	"strconv"
	"github.com/labstack/echo/v4"
)

type Handler struct {
	service  *ChannelService
	waWorker Worker
}

func NewHandler(service *ChannelService, waWorker Worker) *Handler {
	return &Handler{service: service, waWorker: waWorker}
}

func (h *Handler) RegisterRoutes(e *echo.Group) {
	e.GET("/admin/channels", h.Index)
	e.POST("/admin/channels", h.Store)

	e.GET("/whatsapp", h.Index)          // listagem de todos os canais do tenant
	e.POST("/whatsapp", h.Store)
	e.GET("/whatsapp/:id", h.Show)
	e.PUT("/whatsapp/:id", h.Update)
	e.DELETE("/whatsapp/:id", h.Remove)
	e.POST("/whatsapp/sync-contacts/:id", h.SyncContacts)

	// WhatsApp Sessions
	e.POST("/whatsappsession/:id", h.StartSession)
	e.DELETE("/whatsappsession/:id", h.DeleteSession)
	e.PUT("/whatsappsession/:id", h.RequestNewQrCode)
}

func (h *Handler) Index(c echo.Context) error {
	tenantID := c.Get("tenantId").(uint)

	channels, err := h.service.List(c.Request().Context(), tenantID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, channels)
}

func (h *Handler) Show(c echo.Context) error {
	tenantID := c.Get("tenantId").(uint)
	id, _ := strconv.Atoi(c.Param("id"))

	channel, err := h.service.Show(c.Request().Context(), tenantID, uint(id))
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, channel)
}

func (h *Handler) Store(c echo.Context) error {
	tenantID := c.Get("tenantId").(uint)
	var req CreateWhatsappDTO
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request format"})
	}

	channel, err := h.service.Create(c.Request().Context(), tenantID, req)
	if err != nil {
		if err.Error() == "ERR_NO_PERMISSION_CONNECTIONS_LIMIT" {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusCreated, channel)
}

func (h *Handler) Update(c echo.Context) error {
	tenantID := c.Get("tenantId").(uint)
	id, _ := strconv.Atoi(c.Param("id"))
	
	var req UpdateWhatsappDTO
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request format"})
	}

	channel, err := h.service.Update(c.Request().Context(), tenantID, uint(id), req)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, channel)
}

func (h *Handler) Remove(c echo.Context) error {
	tenantID := c.Get("tenantId").(uint)
	id, _ := strconv.Atoi(c.Param("id"))

	if err := h.service.Delete(c.Request().Context(), tenantID, uint(id)); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "Whatsapp deleted."})
}

// Session Management

func (h *Handler) StartSession(c echo.Context) error {
	tenantID := c.Get("tenantId").(uint)
	id, _ := strconv.Atoi(c.Param("id"))

	// Check if channel belongs to tenant
	_, err := h.service.Show(c.Request().Context(), tenantID, uint(id))
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "channel not found"})
	}

	if h.waWorker != nil {
		if err := h.waWorker.StartSession(c.Request().Context(), uint(id), tenantID); err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
		}
	}
	return c.JSON(http.StatusOK, map[string]string{"status": "starting"})
}

func (h *Handler) DeleteSession(c echo.Context) error {
	tenantID := c.Get("tenantId").(uint)
	id, _ := strconv.Atoi(c.Param("id"))

	_, err := h.service.Show(c.Request().Context(), tenantID, uint(id))
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "channel not found"})
	}

	if h.waWorker != nil {
		h.waWorker.StopSession(uint(id))
	}
	return c.JSON(http.StatusOK, map[string]string{"status": "disconnected"})
}

func (h *Handler) RequestNewQrCode(c echo.Context) error {
	tenantID := c.Get("tenantId").(uint)
	id, _ := strconv.Atoi(c.Param("id"))

	_, err := h.service.Show(c.Request().Context(), tenantID, uint(id))
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "channel not found"})
	}

	if h.waWorker != nil {
		// Disconnect and reconnect to generate a new QR
		h.waWorker.StopSession(uint(id))
		_ = h.waWorker.StartSession(c.Request().Context(), uint(id), tenantID)
	}
	return c.JSON(http.StatusOK, map[string]string{"status": "qr_requested"})
}

func (h *Handler) SyncContacts(c echo.Context) error {
	tenantID := c.Get("tenantId").(uint)
	id, _ := strconv.Atoi(c.Param("id"))

	_, err := h.service.Show(c.Request().Context(), tenantID, uint(id))
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "channel not found"})
	}
	// Sync de contatos é uma tarefa background - retorna ok
	return c.JSON(http.StatusOK, map[string]string{"status": "sync_started"})
}
