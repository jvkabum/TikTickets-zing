package statistics

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

type Handler struct {
	svc *StatisticsService
}

func NewHandler(svc *StatisticsService) *Handler {
	return &Handler{svc: svc}
}

func (h *Handler) RegisterRoutes(g *echo.Group) {
	statistics := g.Group("")
	statistics.GET("", h.GetDashboard)
	statistics.GET("/dash-tickets-queues", h.GenericStats)
	statistics.GET("/contacts-report", h.GenericStats)
	statistics.GET("/statistics-per-users", h.GenericStats)
	statistics.GET("/statistics-tickets-times", h.GenericStats)
	statistics.GET("/statistics-tickets-channels", h.GenericStats)
	statistics.GET("/statistics-tickets-evolution-channels", h.GenericStats)
	statistics.GET("/statistics-tickets-evolution-by-period", h.GenericStats)
	statistics.GET("/statistics-tickets-per-users-detail", h.GenericStats)
	statistics.GET("/statistics-tickets-queue", h.GenericStats)
}

func (h *Handler) GetDashboard(c echo.Context) error {
	tenantID := c.Get("tenantId").(uint)
	
	data, err := h.svc.GetDashboardData(c.Request().Context(), tenantID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, data)
}

func (h *Handler) GenericStats(c echo.Context) error {
	return c.JSON(http.StatusOK, make([]interface{}, 0))
}
