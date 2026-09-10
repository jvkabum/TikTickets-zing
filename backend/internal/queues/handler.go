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
	for _, prefix := range []string{"/queue", "/queues"} {
		queues := g.Group(prefix)
		queues.POST("", h.CreateQueue)
		queues.GET("", h.ListQueues)
		queues.GET("/:queueId", h.ShowQueue)
		queues.PUT("/:queueId", h.UpdateQueue)
		queues.DELETE("/:queueId", h.DeleteQueue)
	}
}

func getTenantID(c echo.Context) uint {
	if val := c.Get("tenantId"); val != nil {
		switch v := val.(type) {
		case uint:
			if v > 0 {
				return v
			}
		case uint64:
			if v > 0 {
				return uint(v)
			}
		case int:
			if v > 0 {
				return uint(v)
			}
		case int64:
			if v > 0 {
				return uint(v)
			}
		case float64:
			if v > 0 {
				return uint(v)
			}
		case string:
			if tid, err := strconv.ParseUint(v, 10, 32); err == nil && tid > 0 {
				return uint(tid)
			}
		}
	}
	return 1
}

func (h *Handler) CreateQueue(c echo.Context) error {
	tenantID := getTenantID(c)

	var req QueueRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid payload"})
	}

	if req.TenantID > 0 {
		tenantID = req.TenantID
	}

	queueName := req.Name
	if queueName == "" {
		queueName = req.Queue
	}

	color := req.Color
	if color == "" {
		color = "#2576d2"
	}

	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	queue := Queue{
		Name:     queueName,
		Queue:    queueName,
		Color:    color,
		Greeting: req.Greeting,
		IsActive: isActive,
		TenantID: tenantID,
	}

	if err := h.svc.Create(c.Request().Context(), &queue); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	queue.Queue = queue.Name
	return c.JSON(http.StatusCreated, queue)
}

func (h *Handler) ListQueues(c echo.Context) error {
	tenantID := getTenantID(c)
	queues, err := h.svc.List(c.Request().Context(), tenantID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	for i := range queues {
		queues[i].Queue = queues[i].Name
	}
	return c.JSON(http.StatusOK, queues)
}

func (h *Handler) ShowQueue(c echo.Context) error {
	tenantID := getTenantID(c)
	queueID, _ := strconv.ParseUint(c.Param("queueId"), 10, 32)
	
	queue, err := h.svc.GetByID(c.Request().Context(), uint(queueID), tenantID)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": err.Error()})
	}
	queue.Queue = queue.Name
	return c.JSON(http.StatusOK, queue)
}

func (h *Handler) UpdateQueue(c echo.Context) error {
	tenantID := getTenantID(c)
	queueID, _ := strconv.ParseUint(c.Param("queueId"), 10, 32)

	var req QueueRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid payload"})
	}

	queueName := req.Name
	if queueName == "" {
		queueName = req.Queue
	}

	updates := Queue{
		Name:     queueName,
		Queue:    queueName,
		Color:    req.Color,
		Greeting: req.Greeting,
	}
	if req.IsActive != nil {
		updates.IsActive = *req.IsActive
	}

	if err := h.svc.Update(c.Request().Context(), uint(queueID), tenantID, &updates); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, map[string]string{"status": "updated"})
}

func (h *Handler) DeleteQueue(c echo.Context) error {
	tenantID := getTenantID(c)
	queueID, _ := strconv.ParseUint(c.Param("queueId"), 10, 32)

	if err := h.svc.Delete(c.Request().Context(), uint(queueID), tenantID); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, map[string]string{"status": "deleted"})
}
