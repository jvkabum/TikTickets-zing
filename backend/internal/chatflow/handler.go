package chatflow

import (
	"fmt"
	"net/http"
	"io"
	"encoding/json"
	"github.com/labstack/echo/v4"
)

type Handler struct {
	repo   Repository
	engine *FlowEngine
	svc    *ChatFlowService
}

func NewHandler(repo Repository, engine *FlowEngine, svc *ChatFlowService) *Handler {
	return &Handler{repo: repo, engine: engine, svc: svc}
}

func (h *Handler) RegisterRoutes(e *echo.Group) {
	e.POST("/chat-flow", h.CreateFlow)
	e.GET("/chat-flow", h.ListChatFlows)
	e.GET("/chat-flow/:id", h.GetChatFlow)
	e.PUT("/chat-flow/:id", h.UpdateChatFlow)
	e.DELETE("/chat-flow/:id", h.DeleteChatFlow)
	e.POST("/chat-flow/:id/trigger", h.TriggerFlow)
	e.GET("/admin/chatflow/:tenantId", h.AdminListChatFlows)

	e.GET("/auto-reply", h.ListAutoReplies)
	e.POST("/auto-reply", h.CreateAutoReply)
	e.GET("/auto-reply/:id", h.GetAutoReply)
	e.PUT("/auto-reply/:id", h.UpdateAutoReply)
	e.DELETE("/auto-reply/:id", h.DeleteAutoReply)
	e.POST("/auto-reply/:id/steps", h.UpdateAutoReplySteps)
	e.PUT("/auto-reply/:id/steps/:stepsReplyId", h.UpdateAutoReplyStepIndividual)
	e.DELETE("/auto-reply/:id/steps/:stepsReplyId", h.DeleteAutoReplyStepIndividual)

	e.GET("/auto-reply-action", h.ListAutoReplyActions)
	e.POST("/auto-reply-action", h.CreateAutoReplyAction)
	e.PUT("/auto-reply-action/:id", h.UpdateAutoReplyAction)
	e.DELETE("/auto-reply-action/:id", h.DeleteAutoReplyAction)
}

func (h *Handler) CreateFlow(c echo.Context) error {
	tenantID := c.Get("tenantId").(uint)

	bodyBytes, err := io.ReadAll(c.Request().Body)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "could not read body"})
	}

	var payload map[string]interface{}
	if err := json.Unmarshal(bodyBytes, &payload); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid payload"})
	}

	var req ChatFlow
	_ = json.Unmarshal(bodyBytes, &req)

	req.TenantID = tenantID

	// Se o payload tiver "flow" explícito, usar seu conteúdo.
	// Se tiver "nodeList" na raiz, o próprio bodyBytes é a estrutura do fluxo.
	if flowVal, ok := payload["flow"]; ok && flowVal != nil {
		flowBytes, _ := json.Marshal(flowVal)
		req.Flow = JSONField(flowBytes)
	} else if _, ok := payload["nodeList"]; ok {
		req.Flow = JSONField(bodyBytes)
	}

	// Se ainda estiver vazio ou sem nós, inicializa com o fluxo padrão oficial
	if len(req.Flow) == 0 || string(req.Flow) == "null" || string(req.Flow) == "{}" {
		req.Flow = JSONField(DefaultFlowJSON)
	}

	if err := h.svc.Create(c.Request().Context(), &req); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusCreated, req)
}

func (h *Handler) ListChatFlows(c echo.Context) error {
	tenantID := c.Get("tenantId").(uint)
	flows, err := h.svc.List(c.Request().Context(), tenantID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	if flows == nil {
		flows = []ChatFlow{}
	}
	// Frontend espera: { chatFlow: [] }
	return c.JSON(http.StatusOK, map[string]interface{}{
		"chatFlow": flows,
	})
}

func (h *Handler) AdminListChatFlows(c echo.Context) error {
	tenantID := uint(0)
	fmt.Sscanf(c.Param("tenantId"), "%d", &tenantID)
	if tenantID == 0 {
		if v, ok := c.Get("tenantId").(uint); ok {
			tenantID = v
		} else if v, ok := c.Get("tenant_id").(uint); ok {
			tenantID = v
		}
	}

	flows, err := h.svc.List(c.Request().Context(), tenantID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	if flows == nil {
		flows = []ChatFlow{}
	}
	return c.JSON(http.StatusOK, map[string]interface{}{
		"chatFlow": flows,
	})
}

func (h *Handler) GetChatFlow(c echo.Context) error {
	tenantID := c.Get("tenantId").(uint)
	id := uint(0)
	fmt.Sscanf(c.Param("id"), "%d", &id) 

	flow, err := h.svc.GetByID(c.Request().Context(), id, tenantID)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, flow)
}

func (h *Handler) UpdateChatFlow(c echo.Context) error {
	tenantID := c.Get("tenantId").(uint)
	id := uint(0)
	fmt.Sscanf(c.Param("id"), "%d", &id) 

	bodyBytes, err := io.ReadAll(c.Request().Body)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "could not read body"})
	}

	var payload map[string]interface{}
	if err := json.Unmarshal(bodyBytes, &payload); err != nil {
		var req ChatFlow
		if err := json.Unmarshal(bodyBytes, &req); err != nil {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid payload"})
		}
	}
	_ = json.Unmarshal(bodyBytes, &payload)

	var req ChatFlow
	_ = json.Unmarshal(bodyBytes, &req)

	if flowVal, ok := payload["flow"]; ok && flowVal != nil {
		flowBytes, _ := json.Marshal(flowVal)
		req.Flow = JSONField(flowBytes)
	} else if _, ok := payload["nodeList"]; ok {
		req.Flow = JSONField(bodyBytes)
	}

	if err := h.svc.Update(c.Request().Context(), id, tenantID, &req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, map[string]string{"status": "updated"})
}

func (h *Handler) TriggerFlow(c echo.Context) error {
	tenantID := c.Get("tenantId").(uint)
	id := uint(0)
	fmt.Sscanf(c.Param("id"), "%d", &id) 

	var req ChatFlow
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid payload"})
	}

	if err := h.svc.Update(c.Request().Context(), id, tenantID, &req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, map[string]string{"status": "flow triggered"})
}

func (h *Handler) ListAutoReplies(c echo.Context) error {
	return c.JSON(http.StatusOK, []interface{}{})
}

func (h *Handler) CreateAutoReply(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{"status": "created"})
}

func (h *Handler) GetAutoReply(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{})
}

func (h *Handler) UpdateAutoReply(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{"status": "updated"})
}

func (h *Handler) DeleteAutoReply(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{"status": "deleted"})
}

func (h *Handler) UpdateAutoReplySteps(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{"status": "steps_updated"})
}

func (h *Handler) UpdateAutoReplyStepIndividual(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{"status": "step_updated"})
}

func (h *Handler) DeleteAutoReplyStepIndividual(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{"status": "step_deleted"})
}

func (h *Handler) ListAutoReplyActions(c echo.Context) error {
	return c.JSON(http.StatusOK, []interface{}{})
}

func (h *Handler) CreateAutoReplyAction(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{"status": "created"})
}

func (h *Handler) UpdateAutoReplyAction(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{"status": "updated"})
}

func (h *Handler) DeleteAutoReplyAction(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{"status": "deleted"})
}

func (h *Handler) DeleteChatFlow(c echo.Context) error {
	tenantID := c.Get("tenantId").(uint)
	id := uint(0)
	fmt.Sscanf(c.Param("id"), "%d", &id) 

	if err := h.svc.Delete(c.Request().Context(), id, tenantID); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, map[string]string{"status": "deleted"})
}
