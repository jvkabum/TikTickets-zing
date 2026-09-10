package tags

import (
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
)

type Handler struct {
	repo Repository
	svc  *TagService
}

func NewHandler(repo Repository, svc *TagService) *Handler {
	return &Handler{repo: repo, svc: svc}
}

func (h *Handler) RegisterRoutes(g *echo.Group) {
	tags := g.Group("/tags")
	tags.POST("", h.CreateTag)
	tags.GET("", h.ListTags)
	tags.GET("/", h.ListTags) // Trailing slash — frontend envia /tags/?isActive=null
	tags.GET("/:tagId", h.ShowTag)
	tags.PUT("/:tagId", h.UpdateTag)
	tags.DELETE("/:tagId", h.DeleteTag)
}

func (h *Handler) CreateTag(c echo.Context) error {
	tenantID := c.Get("tenantId").(uint)
	var tag Tag
	if err := c.Bind(&tag); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid payload"})
	}
	tag.TenantID = tenantID

	if err := h.svc.Create(c.Request().Context(), &tag); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusCreated, tag)
}

func (h *Handler) ListTags(c echo.Context) error {
	tenantID := c.Get("tenantId").(uint)
	tags, err := h.svc.List(c.Request().Context(), tenantID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, tags)
}

func (h *Handler) ShowTag(c echo.Context) error {
	tenantID := c.Get("tenantId").(uint)
	tagID, _ := strconv.ParseUint(c.Param("tagId"), 10, 32)

	tag, err := h.svc.GetByID(c.Request().Context(), uint(tagID), tenantID)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, tag)
}

func (h *Handler) UpdateTag(c echo.Context) error {
	tenantID := c.Get("tenantId").(uint)
	tagID, _ := strconv.ParseUint(c.Param("tagId"), 10, 32)

	var updates Tag
	if err := c.Bind(&updates); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid payload"})
	}

	if err := h.svc.Update(c.Request().Context(), uint(tagID), tenantID, &updates); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, map[string]string{"status": "updated"})
}

func (h *Handler) DeleteTag(c echo.Context) error {
	tenantID := c.Get("tenantId").(uint)
	tagID, _ := strconv.ParseUint(c.Param("tagId"), 10, 32)

	if err := h.svc.Delete(c.Request().Context(), uint(tagID), tenantID); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, map[string]string{"status": "deleted"})
}
