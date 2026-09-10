package fastreplies

import (
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
)

type Handler struct {
	repo Repository
	svc  *FastReplyService
}

func NewHandler(repo Repository, svc *FastReplyService) *Handler {
	return &Handler{repo: repo, svc: svc}
}

func (h *Handler) RegisterRoutes(g *echo.Group) {
	fastReplies := g.Group("/fastreply")
	fastReplies.POST("", h.CreateFastReply)
	fastReplies.GET("", h.ListFastReplies)
	fastReplies.GET("/:replyId", h.ShowFastReply)
	fastReplies.PUT("/:replyId", h.UpdateFastReply)
	fastReplies.DELETE("/:replyId", h.DeleteFastReply)
	fastReplies.POST("/delete-images", h.DeleteImages)
}

func (h *Handler) CreateFastReply(c echo.Context) error {
	tenantID := c.Get("tenantId").(uint)
	var reply FastReply
	if err := c.Bind(&reply); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid payload"})
	}
	reply.TenantID = tenantID

	if err := h.svc.Create(c.Request().Context(), &reply); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusCreated, reply)
}

func (h *Handler) ListFastReplies(c echo.Context) error {
	tenantID := c.Get("tenantId").(uint)
	replies, err := h.svc.List(c.Request().Context(), tenantID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, replies)
}

func (h *Handler) ShowFastReply(c echo.Context) error {
	tenantID := c.Get("tenantId").(uint)
	replyID, _ := strconv.ParseUint(c.Param("replyId"), 10, 32)

	reply, err := h.svc.GetByID(c.Request().Context(), uint(replyID), tenantID)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, reply)
}

func (h *Handler) UpdateFastReply(c echo.Context) error {
	tenantID := c.Get("tenantId").(uint)
	replyID, _ := strconv.ParseUint(c.Param("replyId"), 10, 32)

	var updates FastReply
	if err := c.Bind(&updates); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid payload"})
	}

	if err := h.svc.Update(c.Request().Context(), uint(replyID), tenantID, &updates); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, map[string]string{"status": "updated"})
}

func (h *Handler) DeleteFastReply(c echo.Context) error {
	tenantID := c.Get("tenantId").(uint)
	replyID, _ := strconv.ParseUint(c.Param("replyId"), 10, 32)

	if err := h.svc.Delete(c.Request().Context(), uint(replyID), tenantID); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, map[string]string{"status": "deleted"})
}

func (h *Handler) DeleteImages(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{"status": "images_deleted"})
}
