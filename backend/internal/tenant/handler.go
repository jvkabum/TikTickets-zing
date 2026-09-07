package tenant

import (
	"encoding/json"
	"fmt"
	"net/http"
	"github.com/labstack/echo/v4"
)

type Handler struct {
	repo    Repository
	service *TenantService
}

func NewHandler(repo Repository, service *TenantService) *Handler {
	return &Handler{repo: repo, service: service}
}

func (h *Handler) RegisterRoutes(e *echo.Group) {
	e.GET("/tenant/settings", h.GetSettings)
	e.PUT("/tenant/settings", h.UpdateSettings)

	e.GET("/tenants/business-hours", h.GetBusinessHours)
	e.PUT("/tenants/business-hours", h.UpdateBusinessHours)
	e.GET("/tenants/message-business-hours", h.GetMessageBusinessHours) // Optional, if needed
	e.PUT("/tenants/message-business-hours", h.UpdateMessageBusinessHours)

	// Admin tenants
	e.GET("/admin/tenants", h.ListTenants)
	e.POST("/admin/tenants", h.CreateTenant)
	e.PUT("/admin/tenantsUpdate/:id", h.UpdateTenant)
	e.DELETE("/admin/tenants/:id", h.DeleteTenant)
}

func (h *Handler) GetSettings(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{"status": "ok"})
}

func (h *Handler) UpdateSettings(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{"status": "updated"})
}

func (h *Handler) ListTenants(c echo.Context) error {
	tenants, err := h.service.ListTenants(c.Request().Context())
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, tenants)
}

func (h *Handler) CreateTenant(c echo.Context) error {
	var req Tenant
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid payload"})
	}

	tenant, err := h.service.CreateTenant(c.Request().Context(), req)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, tenant)
}

func (h *Handler) UpdateTenant(c echo.Context) error {
	idParam := c.Param("id")
	var id uint
	if _, err := fmt.Sscanf(idParam, "%d", &id); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid id"})
	}

	var req Tenant
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid payload"})
	}

	tenant, err := h.service.UpdateTenant(c.Request().Context(), id, req)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, tenant)
}

func (h *Handler) DeleteTenant(c echo.Context) error {
	idParam := c.Param("id")
	var id uint
	if _, err := fmt.Sscanf(idParam, "%d", &id); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid id"})
	}

	if err := h.service.DeleteTenant(c.Request().Context(), id); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]string{"status": "deleted"})
}

type BusinessHoursResponse struct {
	BusinessHours        json.RawMessage `json:"businessHours"`
	MessageBusinessHours string          `json:"messageBusinessHours"`
}

func (h *Handler) GetBusinessHours(c echo.Context) error {
	tenantID := c.Get("tenantId").(uint)
	tenant, err := h.service.GetTenant(c.Request().Context(), tenantID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	
	resp := BusinessHoursResponse{
		MessageBusinessHours: tenant.MessageBusinessHours,
	}
	if tenant.BusinessHours != "" {
		resp.BusinessHours = json.RawMessage(tenant.BusinessHours)
	} else {
		resp.BusinessHours = json.RawMessage("[]")
	}

	return c.JSON(http.StatusOK, resp)
}

func (h *Handler) UpdateBusinessHours(c echo.Context) error {
	tenantID := c.Get("tenantId").(uint)
	
	var body []map[string]interface{}
	if err := c.Bind(&body); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid payload"})
	}
	
	b, _ := json.Marshal(body)
	tenant, err := h.service.UpdateBusinessHours(c.Request().Context(), tenantID, string(b))
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	resp := BusinessHoursResponse{
		MessageBusinessHours: tenant.MessageBusinessHours,
	}
	if tenant.BusinessHours != "" {
		resp.BusinessHours = json.RawMessage(tenant.BusinessHours)
	} else {
		resp.BusinessHours = json.RawMessage("[]")
	}

	return c.JSON(http.StatusOK, resp)
}

func (h *Handler) GetMessageBusinessHours(c echo.Context) error {
	return h.GetBusinessHours(c)
}

func (h *Handler) UpdateMessageBusinessHours(c echo.Context) error {
	tenantID := c.Get("tenantId").(uint)
	
	var body struct {
		MessageBusinessHours string `json:"messageBusinessHours"`
	}
	if err := c.Bind(&body); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid payload"})
	}
	
	tenant, err := h.service.UpdateMessageBusinessHours(c.Request().Context(), tenantID, body.MessageBusinessHours)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	resp := BusinessHoursResponse{
		MessageBusinessHours: tenant.MessageBusinessHours,
	}
	if tenant.BusinessHours != "" {
		resp.BusinessHours = json.RawMessage(tenant.BusinessHours)
	} else {
		resp.BusinessHours = json.RawMessage("[]")
	}

	return c.JSON(http.StatusOK, resp)
}
