package campaigns

import (
	"fmt"
	"net/http"
	"github.com/labstack/echo/v4"
)

type Handler struct {
	repo   Repository
	worker *CampaignWorker
	svc    *CampaignService
}

func NewHandler(repo Repository, worker *CampaignWorker, svc *CampaignService) *Handler {
	return &Handler{repo: repo, worker: worker, svc: svc}
}

func (h *Handler) RegisterRoutes(e *echo.Group) {
	e.POST("/campaigns", h.CreateCampaign)
	e.GET("/campaigns", h.ListCampaigns)
	e.GET("/campaigns/:id", h.GetCampaign)
	e.PUT("/campaigns/:id", h.UpdateCampaign)
	e.DELETE("/campaigns/:id", h.DeleteCampaign)
	e.POST("/campaigns/:id/start", h.StartCampaign)
	e.POST("/campaigns/cancel/:id", h.CancelCampaign)
	e.GET("/campaigns/contacts/:id", h.GetContacts)
	e.POST("/campaigns/contacts/:id", h.AddContact)
	e.DELETE("/campaigns/contacts/:id/:contactId", h.RemoveContact)
	e.DELETE("/campaigns/deleteall/contacts/:id", h.RemoveAllContacts)
}

func (h *Handler) CreateCampaign(c echo.Context) error {
	tenantID := c.Get("tenantId").(uint)
	var req Campaign
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request"})
	}
	req.TenantID = tenantID

	if err := h.svc.Create(c.Request().Context(), &req); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusCreated, req)
}

func (h *Handler) ListCampaigns(c echo.Context) error {
	tenantID := c.Get("tenantId").(uint)
	campaigns, err := h.svc.List(c.Request().Context(), tenantID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, campaigns)
}

func (h *Handler) GetCampaign(c echo.Context) error {
	tenantID := c.Get("tenantId").(uint)
	id := uint(0)
	fmt.Sscanf(c.Param("id"), "%d", &id) 

	campaign, err := h.svc.GetByID(c.Request().Context(), id, tenantID)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, campaign)
}

func (h *Handler) UpdateCampaign(c echo.Context) error {
	tenantID := c.Get("tenantId").(uint)
	id := uint(0)
	fmt.Sscanf(c.Param("id"), "%d", &id) 

	var req Campaign
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request"})
	}

	if err := h.svc.Update(c.Request().Context(), id, tenantID, &req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]string{"status": "updated"})
}

func (h *Handler) DeleteCampaign(c echo.Context) error {
	tenantID := c.Get("tenantId").(uint)
	id := uint(0)
	fmt.Sscanf(c.Param("id"), "%d", &id) 

	if err := h.svc.Delete(c.Request().Context(), id, tenantID); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, map[string]string{"status": "deleted"})
}

func (h *Handler) StartCampaign(c echo.Context) error {
	// Pega o ID da rota e despacha para o worker
	// h.worker.Process(campaignID)
	return c.JSON(http.StatusOK, map[string]string{"status": "started"})
}

func (h *Handler) CancelCampaign(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{"status": "cancelled"})
}

func (h *Handler) GetContacts(c echo.Context) error {
	return c.JSON(http.StatusOK, []interface{}{})
}

func (h *Handler) AddContact(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{"status": "added"})
}

func (h *Handler) RemoveContact(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{"status": "removed"})
}

func (h *Handler) RemoveAllContacts(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{"status": "removed_all"})
}
