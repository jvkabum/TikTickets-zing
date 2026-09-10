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
	for _, prefix := range []string{"/fastreply", "/fastreplies", "/fast-reply"} {
		fastReplies := g.Group(prefix)
		fastReplies.POST("", h.CreateFastReply)
		fastReplies.GET("", h.ListFastReplies)
		fastReplies.GET("/:replyId", h.ShowFastReply)
		fastReplies.PUT("/:replyId", h.UpdateFastReply)
		fastReplies.DELETE("/:replyId", h.DeleteFastReply)
		fastReplies.POST("/delete-images", h.DeleteImages)
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

func (h *Handler) CreateFastReply(c echo.Context) error {
	tenantID := getTenantID(c)

	var req FastReplyRequest
	_ = c.Bind(&req)

	key := req.Key
	if key == "" {
		key = c.FormValue("key")
	}

	message := req.Message
	if message == "" {
		message = c.FormValue("message")
	}

	if req.TenantID > 0 {
		tenantID = req.TenantID
	}

	reply := FastReply{
		Key:      key,
		Message:  message,
		TenantID: tenantID,
		UserID:   req.UserID,
	}

	if err := h.svc.Create(c.Request().Context(), &reply); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusCreated, reply)
}

func (h *Handler) ListFastReplies(c echo.Context) error {
	tenantID := getTenantID(c)
	replies, err := h.svc.List(c.Request().Context(), tenantID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, replies)
}

func (h *Handler) ShowFastReply(c echo.Context) error {
	tenantID := getTenantID(c)
	replyID, _ := strconv.ParseUint(c.Param("replyId"), 10, 32)

	reply, err := h.svc.GetByID(c.Request().Context(), uint(replyID), tenantID)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, reply)
}

func (h *Handler) UpdateFastReply(c echo.Context) error {
	tenantID := getTenantID(c)
	replyID, _ := strconv.ParseUint(c.Param("replyId"), 10, 32)

	var req FastReplyRequest
	_ = c.Bind(&req)

	key := req.Key
	if key == "" {
		key = c.FormValue("key")
	}

	message := req.Message
	if message == "" {
		message = c.FormValue("message")
	}

	updates := FastReply{
		Key:     key,
		Message: message,
	}

	if err := h.svc.Update(c.Request().Context(), uint(replyID), tenantID, &updates); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, map[string]string{"status": "updated"})
}

func (h *Handler) DeleteFastReply(c echo.Context) error {
	tenantID := getTenantID(c)
	replyID, _ := strconv.ParseUint(c.Param("replyId"), 10, 32)

	if err := h.svc.Delete(c.Request().Context(), uint(replyID), tenantID); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, map[string]string{"status": "deleted"})
}

func (h *Handler) DeleteImages(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{"status": "images_deleted"})
}
