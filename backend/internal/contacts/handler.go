package contacts

import (
	"fmt"
	"net/http"
	"github.com/labstack/echo/v4"
)

type Handler struct {
	repo    Repository
	service *ContactService
}

func NewHandler(repo Repository, service *ContactService) *Handler {
	return &Handler{repo: repo, service: service}
}

func (h *Handler) RegisterRoutes(e *echo.Group) {
	e.POST("/contacts", h.CreateContact)
	e.GET("/contacts", h.ListContacts)
	e.GET("/contacts/:id", h.GetContact)
	e.PUT("/contacts/:id", h.UpdateContact)
	e.DELETE("/contacts/:id", h.DeleteContact)

	e.POST("/contacts/upload", h.UploadContacts)
	e.GET("/contacts/export", h.ExportContacts)
	e.POST("/contacts/export", h.ExportContacts)
	e.POST("/contacts/import", h.ImportContacts)
	e.POST("/contacts/sync", h.SyncContacts)
	e.PUT("/contact-tags/:id", h.UpdateTags)
	e.PUT("/contact-wallet/:id", h.UpdateWallet)
}

func (h *Handler) CreateContact(c echo.Context) error {
	tenantID := c.Get("tenantId").(uint) // Extract from JWT context middleware
	
	var req ContactDTO
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request"})
	}

	contact, err := h.service.Create(c.Request().Context(), tenantID, req)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	
	return c.JSON(http.StatusCreated, contact)
}

func (h *Handler) ListContacts(c echo.Context) error {
	tenantID := c.Get("tenantId").(uint)
	contacts, err := h.service.List(c.Request().Context(), tenantID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, contacts)
}

func (h *Handler) GetContact(c echo.Context) error {
	tenantID := c.Get("tenantId").(uint)
	// Mock string to int parsing
	id := uint(0)
	fmt.Sscanf(c.Param("id"), "%d", &id) 

	contact, err := h.service.GetByID(c.Request().Context(), tenantID, id)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, contact)
}

func (h *Handler) UpdateContact(c echo.Context) error {
	tenantID := c.Get("tenantId").(uint)
	id := uint(0)
	fmt.Sscanf(c.Param("id"), "%d", &id) 

	var req ContactDTO
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request"})
	}

	contact, err := h.service.Update(c.Request().Context(), tenantID, id, req)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, contact)
}

func (h *Handler) DeleteContact(c echo.Context) error {
	tenantID := c.Get("tenantId").(uint)
	id := uint(0)
	fmt.Sscanf(c.Param("id"), "%d", &id) 

	if err := h.service.Delete(c.Request().Context(), tenantID, id); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "Contato deletado"})
}

func (h *Handler) UploadContacts(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{"status": "uploaded"})
}

func (h *Handler) ExportContacts(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{"status": "exported"})
}

func (h *Handler) ImportContacts(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{"status": "imported"})
}

func (h *Handler) SyncContacts(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{"status": "synced"})
}

func (h *Handler) UpdateTags(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{"status": "tags_updated"})
}

func (h *Handler) UpdateWallet(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{"status": "wallet_updated"})
}
