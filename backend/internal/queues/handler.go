package queues

import (
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
)

type Handler struct {
	repo Repository
	svc  *QueueService
}

func NewHandler(repo Repository, svc *QueueService) *Handler {
	return &Handler{repo: repo, svc: svc}
}

func (h *Handler) RegisterRoutes(g *echo.Group) {
	queues := g.Group("/queue")
	queues.POST("", h.CreateQueue)
	queues.GET("", h.ListQueues)
	queues.GET("/:queueId", h.ShowQueue)
	queues.PUT("/:queueId", h.UpdateQueue)
	queues.DELETE("/:queueId", h.DeleteQueue)
}

func (h *Handler) CreateQueue(c echo.Context) error {
	tenantID := c.Get("tenantId").(uint)
	var queue Queue
	if err := c.Bind(&queue); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid payload"})
	}
	queue.TenantID = tenantID

	if err := h.svc.Create(c.Request().Context(), &queue); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusCreated, queue)
}

func (h *Handler) ListQueues(c echo.Context) error {
	tenantID := c.Get("tenantId").(uint)
	queues, err := h.svc.List(c.Request().Context(), tenantID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, queues)
}

func (h *Handler) ShowQueue(c echo.Context) error {
	tenantID := c.Get("tenantId").(uint)
	queueID, _ := strconv.ParseUint(c.Param("queueId"), 10, 32)
	
	queue, err := h.svc.GetByID(c.Request().Context(), uint(queueID), tenantID)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, queue)
}

func (h *Handler) UpdateQueue(c echo.Context) error {
	tenantID := c.Get("tenantId").(uint)
	queueID, _ := strconv.ParseUint(c.Param("queueId"), 10, 32)

	var updates Queue
	if err := c.Bind(&updates); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid payload"})
	}

	if err := h.svc.Update(c.Request().Context(), uint(queueID), tenantID, &updates); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, map[string]string{"status": "updated"})
}

func (h *Handler) DeleteQueue(c echo.Context) error {
	tenantID := c.Get("tenantId").(uint)
	queueID, _ := strconv.ParseUint(c.Param("queueId"), 10, 32)

	if err := h.svc.Delete(c.Request().Context(), uint(queueID), tenantID); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, map[string]string{"status": "deleted"})
}
