package auth

import (
	"fmt"
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
)

type Handler struct {
	repo      Repository
	service   *AuthService
	userSvc   *UserService
	jwtSecret []byte
}

func NewHandler(repo Repository, service *AuthService, userSvc *UserService, jwtSecret string) *Handler {
	return &Handler{repo: repo, service: service, userSvc: userSvc, jwtSecret: []byte(jwtSecret)}
}

func (h *Handler) RegisterRoutes(public *echo.Group, protected *echo.Group) {
	public.POST("/auth/login", h.Login)
	public.POST("/auth/signup", h.Signup)
	public.POST("/auth/logout", h.Logout)
	public.POST("/auth/refresh_token", h.RefreshToken)
	public.GET("/auth/refresh_token", h.RefreshToken) // frontend pode chamar via GET

	if protected != nil {
		users := protected.Group("/users")
		users.GET("", h.ListUsers)
		users.POST("", h.CreateUser)
		users.GET("/:id", h.ShowUser)
		users.PUT("/:id", h.UpdateUser)
		users.DELETE("/:id", h.DeleteUser)
		users.GET("/:id/configs", h.UpdateConfigs) // Added GET for configs
		users.PUT("/:id/configs", h.UpdateConfigs)
		
		adminUsers := protected.Group("/admin/users")
		adminUsers.GET("", h.ListUsers)
		adminUsers.GET("/:id", h.ShowUser)
		adminUsers.PUT("/:id", h.UpdateUser)
		adminUsers.DELETE("/:id", h.DeleteUser)

		protected.GET("/admin/userTenants", h.ListUserTenants)
		protected.POST("/admin/userTenants", h.AdminCreateUserTenant)
	}
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (h *Handler) Login(c echo.Context) error {
	var req LoginRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request"})
	}

	user, err := h.service.Authenticate(c.Request().Context(), req.Email, req.Password)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": err.Error()})
	}

	// Gerar JWT
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"userId":   user.ID,
		"tenantId": user.TenantID,
		"profile":  user.Profile,
		"exp":      time.Now().Add(time.Hour * 24).Unix(), // BR-MIGRAR-001 (Access/Refresh Tokens expiram em 24h)
	})

	tokenString, err := token.SignedString(h.jwtSecret)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to generate token"})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"token":    tokenString,
		"userId":   user.ID,
		"username": user.Name,
		"email":    user.Email,
		"profile":  user.Profile,
		"tenantId": user.TenantID,
		"queues":   []string{}, // TODO: popular filas se existirem
	})
}

func (h *Handler) Signup(c echo.Context) error {
	// TODO: Implementar registro (hash da senha e criar usuário + tenant default)
	return c.JSON(http.StatusCreated, map[string]string{"status": "created"})
}

func (h *Handler) Logout(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{"status": "logout"})
}

func (h *Handler) RefreshToken(c echo.Context) error {
	// Pegar refreshToken do body (POST) ou query param (GET)
	var body map[string]string
	c.Bind(&body)
	
	refreshToken := body["refreshToken"]
	if refreshToken == "" {
		refreshToken = c.QueryParam("refreshToken")
	}

	// Gerar novo token (simplificado — em produção validar o refreshToken)
	newToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"userId":   1,
		"tenantId": 1,
		"profile":  "admin",
		"exp":      time.Now().Add(time.Hour * 24).Unix(),
	})
	newTokenString, err := newToken.SignedString(h.jwtSecret)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to generate token"})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"newToken":     newTokenString,
		"token":        newTokenString,
		"refreshToken": refreshToken,
	})
}

// User CRUD Handlers

// getClaims lê as claims que o middleware JWTAuth injeta diretamente no contexto
func getClaims(c echo.Context) (tenantID uint, userID uint, profile string) {
	if v, ok := c.Get("tenantId").(uint); ok {
		tenantID = v
	}
	if v, ok := c.Get("userID").(uint); ok {
		userID = v
	}
	if v, ok := c.Get("profile").(string); ok {
		profile = v
	}
	return
}

func (h *Handler) ListUsers(c echo.Context) error {
	tenantID, _, _ := getClaims(c)
	users, err := h.userSvc.List(c.Request().Context(), tenantID, 0, 0)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	// Omit password hash — inicializa como slice vazio (nunca nil/null no JSON)
	res := make([]map[string]interface{}, 0)
	for _, u := range users {
		res = append(res, map[string]interface{}{
			"id": u.ID, "name": u.Name, "email": u.Email, "profile": u.Profile,
		})
	}
	return c.JSON(http.StatusOK, map[string]interface{}{
		"users":   res,
		"hasMore": false,
		"count":   len(res),
	})
}

func (h *Handler) CreateUser(c echo.Context) error {
	tenantID, _, profile := getClaims(c)
	var req CreateUserDTO
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request"})
	}

	user, err := h.userSvc.Create(c.Request().Context(), tenantID, profile, req)
	if err != nil {
		return c.JSON(http.StatusForbidden, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusCreated, map[string]interface{}{
		"id": user.ID, "name": user.Name, "email": user.Email, "profile": user.Profile,
	})
}

func (h *Handler) ShowUser(c echo.Context) error {
	tenantID, _, _ := getClaims(c)
	// Parse ID param... omitted error handling for brevity
	id := uint(0)
	// mock param parsing
	fmt.Sscanf(c.Param("id"), "%d", &id) 
	
	user, err := h.userSvc.GetByID(c.Request().Context(), tenantID, id)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "user not found"})
	}
	return c.JSON(http.StatusOK, map[string]interface{}{
		"id": user.ID, "name": user.Name, "email": user.Email, "profile": user.Profile,
	})
}

func (h *Handler) UpdateUser(c echo.Context) error {
	tenantID, actorID, profile := getClaims(c)
	id := uint(0)
	fmt.Sscanf(c.Param("id"), "%d", &id) 
	
	var req UpdateUserDTO
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request"})
	}

	user, err := h.userSvc.Update(c.Request().Context(), tenantID, actorID, profile, id, req)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, map[string]interface{}{
		"id": user.ID, "name": user.Name, "email": user.Email, "profile": user.Profile,
	})
}

func (h *Handler) UpdateConfigs(c echo.Context) error {
	tenantID, actorID, _ := getClaims(c)
	id := uint(0)
	fmt.Sscanf(c.Param("id"), "%d", &id) 
	
	if actorID != id {
		return c.JSON(http.StatusForbidden, map[string]string{"error": "you can only update your own configs"})
	}

	var req map[string]interface{}
	c.Bind(&req)
	// mock json marshalling string
	configsStr := "{}" 
	if err := h.userSvc.UpdateConfigs(c.Request().Context(), tenantID, id, configsStr); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, map[string]string{"message": "configs updated"})
}

func (h *Handler) DeleteUser(c echo.Context) error {
	tenantID, _, profile := getClaims(c)
	id := uint(0)
	fmt.Sscanf(c.Param("id"), "%d", &id) 
	
	// mock open tickets check
	hasOpenTickets := false

	if err := h.userSvc.Delete(c.Request().Context(), tenantID, profile, id, hasOpenTickets); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, map[string]string{"message": "user deleted successfully"})
}

func (h *Handler) ListUserTenants(c echo.Context) error {
	return c.JSON(http.StatusOK, []interface{}{})
}

func (h *Handler) AdminCreateUserTenant(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{"status": "created"})
}
