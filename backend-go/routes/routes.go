package routes

import (
	"flowdeskpro-backend/config"
	"flowdeskpro-backend/controllers"
	"flowdeskpro-backend/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func Setup(router *gin.Engine, db *gorm.DB, cfg *config.Config) {
	// Middleware global
	router.Use(gin.Recovery())
	router.Use(middleware.CORS())

	// Rotas públicas
	public := router.Group("/api")
	{
		// Auth routes
		authController := controllers.NewAuthController(db, cfg)
		public.POST("/auth/login", authController.Login)
		public.POST("/auth/register", authController.Register)
		public.POST("/auth/refresh", authController.RefreshToken)

		// Health check
		public.GET("/health", func(c *gin.Context) {
			c.JSON(200, gin.H{"status": "ok", "message": "FlowDeskPro Backend"})
		})
	}

	// Rotas protegidas
	protected := router.Group("/api")
	protected.Use(middleware.AuthMiddleware(cfg.JWT.Secret))
	{
		// User routes
		userController := controllers.NewUserController(db)
		protected.GET("/users/profile", userController.GetProfile)
		protected.PUT("/users/profile", userController.UpdateProfile)

		// Company routes
		companyController := controllers.NewCompanyController(db)
		protected.GET("/companies", companyController.List)
		protected.POST("/companies", companyController.Create)
		protected.GET("/companies/:id", companyController.Get)
		protected.PUT("/companies/:id", companyController.Update)
		protected.DELETE("/companies/:id", companyController.Delete)

		// Contact routes
		contactController := controllers.NewContactController(db)
		protected.GET("/contacts", contactController.List)
		protected.POST("/contacts", contactController.Create)
		protected.GET("/contacts/:id", contactController.Get)
		protected.PUT("/contacts/:id", contactController.Update)
		protected.DELETE("/contacts/:id", contactController.Delete)

		// Message routes
		messageController := controllers.NewMessageController(db)
		protected.GET("/messages", messageController.List)
		protected.POST("/messages", messageController.Create)
		protected.GET("/messages/:id", messageController.Get)
		protected.PUT("/messages/:id", messageController.Update)
		protected.DELETE("/messages/:id", messageController.Delete)
	}

	// WebSocket routes
	ws := router.Group("/ws")
	ws.Use(middleware.AuthMiddleware(cfg.JWT.Secret))
	{
		wsController := controllers.NewWebSocketController(db)
		ws.GET("/chat", wsController.HandleWebSocket)
	}
}