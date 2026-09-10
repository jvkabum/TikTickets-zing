package api

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

type Handler struct {
	repo Repository
	svc  *ApiService
}

func NewHandler(repo Repository, svc *ApiService) *Handler {
	return &Handler{repo: repo, svc: svc}
}

func (h *Handler) RegisterRoutes(g *echo.Group) {
	apiConfigs := g.Group("/api-config")
	apiConfigs.POST("", h.CreateApiConfig)
	apiConfigs.GET("", h.ListApiConfigs)
	apiConfigs.PUT("/:apiId", h.UpdateApiConfig)
	apiConfigs.DELETE("/:apiId", h.DeleteApiConfig)
	apiConfigs.PUT("/renew-token/:apiId", h.RenewToken)
}

func (h *Handler) CreateApiConfig(c echo.Context) error {
	tenantID := c.Get("tenantId").(uint)
	var apiConfig ApiConfig
	if err := c.Bind(&apiConfig); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid payload"})
	}
	apiConfig.TenantID = tenantID

	if err := h.svc.Create(c.Request().Context(), &apiConfig); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusCreated, apiConfig)
}

func (h *Handler) ListApiConfigs(c echo.Context) error {
	tenantID := c.Get("tenantId").(uint)
	configs, err := h.repo.List(c.Request().Context(), tenantID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, configs)
}

func (h *Handler) UpdateApiConfig(c echo.Context) error {
	tenantID := c.Get("tenantId").(uint)
	apiID := c.Param("apiId")

	var updates ApiConfig
	if err := c.Bind(&updates); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid payload"})
	}

	if err := h.svc.Update(c.Request().Context(), apiID, tenantID, &updates); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, map[string]string{"status": "updated"})
}

func (h *Handler) DeleteApiConfig(c echo.Context) error {
	tenantID := c.Get("tenantId").(uint)
	apiID := c.Param("apiId")

	if err := h.repo.Delete(c.Request().Context(), apiID, tenantID); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, map[string]string{"status": "deleted"})
}

func (h *Handler) RenewToken(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{"status": "token_renewed"})
}
