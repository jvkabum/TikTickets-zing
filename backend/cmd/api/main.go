package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
	echoMiddleware "github.com/labstack/echo/v4/middleware"

	"github.com/tiktickets/backend-go/internal/api"
	"github.com/tiktickets/backend-go/internal/auth"
	"github.com/tiktickets/backend-go/internal/campaigns"
	"github.com/tiktickets/backend-go/internal/channels"
	"github.com/tiktickets/backend-go/internal/chatflow"
	"github.com/tiktickets/backend-go/internal/contacts"
	"github.com/tiktickets/backend-go/internal/facebook"
	"github.com/tiktickets/backend-go/internal/fastreplies"
	"github.com/tiktickets/backend-go/internal/queues"
	"github.com/tiktickets/backend-go/internal/settings"
	"github.com/tiktickets/backend-go/internal/statistics"
	"github.com/tiktickets/backend-go/internal/tags"
	"github.com/tiktickets/backend-go/internal/telemetry"
	"github.com/tiktickets/backend-go/internal/tenant"
	"github.com/tiktickets/backend-go/internal/tickets"
	"github.com/tiktickets/backend-go/internal/webhooks"
	"github.com/tiktickets/backend-go/pkg/config"
	"github.com/tiktickets/backend-go/pkg/database"
	customMiddleware "github.com/tiktickets/backend-go/pkg/middleware"
)

func main() {
	// 1. Carregar .env antes de tudo
	if err := godotenv.Load(); err != nil {
		log.Println("Aviso: Arquivo .env não encontrado, usando variáveis de sistema.")
	}

	// 2. Carregar configuração centralizada — aborta se alguma variável obrigatória estiver ausente
	cfg := config.Load()

	// 3. Banco de dados
	database.Connect(cfg)
	database.AutoMigrate()
	database.Seed(cfg)
	db := database.DB

	// Envia notificação para o Discord em segundo plano (detecta primeira instalação vs atualização)
	go telemetry.SendDiscordPing(db, cfg.DiscordWebhookURL, cfg.FrontendURL)

	// 4. Iniciar Echo
	e := echo.New()
	e.Use(echoMiddleware.Logger())
	e.Use(echoMiddleware.Recover())
	e.Use(echoMiddleware.CORSWithConfig(echoMiddleware.CORSConfig{
		AllowOrigins: []string{"*"},
		AllowMethods: []string{http.MethodGet, http.MethodHead, http.MethodPut, http.MethodPatch, http.MethodPost, http.MethodDelete, http.MethodOptions},
		AllowHeaders: []string{
			"*",
			echo.HeaderOrigin,
			echo.HeaderContentType,
			echo.HeaderAccept,
			echo.HeaderAuthorization,
			"Cache-Control",
			"Pragma",
			"If-None-Match",
			"X-Priority",
			"expires",
			"traceparent",
			"tracestate",
			"sentry-trace",
			"baggage",
			"X-Requested-With",
		},
	}))

	// 5. Inicialização de Repositórios e Services

	// Tenant
	tenantRepo := tenant.NewRepository(db)
	tenantSvc := tenant.NewTenantService(tenantRepo)
	tenantHandler := tenant.NewHandler(tenantRepo, tenantSvc)

	// Auth & Users
	authRepo := auth.NewRepository(db)
	authSvc := auth.NewAuthService(authRepo, tenantRepo)
	userSvc := auth.NewUserService(authRepo)
	authHandler := auth.NewHandler(authRepo, authSvc, userSvc, cfg.JWTSecret)

	// Contacts
	contactRepo := contacts.NewRepository(db)
	contactSvc := contacts.NewContactService(contactRepo)
	contactHandler := contacts.NewHandler(contactRepo, contactSvc)

	// Channels & Websocket
	channelsRepo := channels.NewRepository(db)
	channelSvc := channels.NewChannelService(channelsRepo, tenantRepo)

	// Whatsmeow URL vem do .env (WHATSMEOW_URL) ou é montada a partir das vars de DB
	whatsmeowURL := cfg.WhatsmeowURL
	if whatsmeowURL == "" {
		whatsmeowURL = fmt.Sprintf(
			"postgres://%s:%s@%s:%s/%s?sslmode=disable",
			cfg.DBUser, cfg.DBPassword, cfg.DBHost, cfg.DBPort, cfg.DBName,
		)
	}
	wsHub := channels.NewWsHub()
	channelsWorker, err := channels.NewWhatsmeowWorker(channelsRepo, whatsmeowURL, wsHub)
	if err != nil {
		log.Fatalf("Falha ao iniciar o WhatsmeowWorker: %v", err)
	}
	channelHandler := channels.NewHandler(channelSvc, channelsWorker)

	// Tickets
	ticketRepo := tickets.NewRepository(db)
	ticketWorker := tickets.NewZombieTicketWorker(db)
	_ = ticketWorker
	ticketSvc := tickets.NewTicketService(ticketRepo, nil, channelsWorker, wsHub)
	ticketHandler := tickets.NewHandler(ticketRepo, ticketSvc)

	// Chatflow
	chatFlowRepo := chatflow.NewRepository(db)
	chatFlowEngine := &chatflow.FlowEngine{}
	chatFlowSvc := chatflow.NewChatFlowService(chatFlowRepo)
	chatFlowHandler := chatflow.NewHandler(chatFlowRepo, chatFlowEngine, chatFlowSvc)

	// Campaigns
	campaignRepo := campaigns.NewRepository(db)
	campaignWorker := campaigns.NewCampaignWorker(campaignRepo)
	campaignSvc := campaigns.NewCampaignService(campaignRepo)
	campaignHandler := campaigns.NewHandler(campaignRepo, campaignWorker, campaignSvc)

	// Queues
	queueRepo := queues.NewRepository(db)
	queueSvc := queues.NewQueueService(queueRepo)
	queueHandler := queues.NewHandler(queueRepo, queueSvc)

	// Tags
	tagRepo := tags.NewRepository(db)
	tagSvc := tags.NewTagService(tagRepo)
	tagHandler := tags.NewHandler(tagRepo, tagSvc)

	// FastReplies
	fastReplyRepo := fastreplies.NewRepository(db)
	fastReplySvc := fastreplies.NewFastReplyService(fastReplyRepo)
	fastReplyHandler := fastreplies.NewHandler(fastReplyRepo, fastReplySvc)

	// Settings
	settingRepo := settings.NewRepository(db)
	settingSvc := settings.NewSettingService(settingRepo)
	settingHandler := settings.NewHandler(settingRepo, settingSvc)

	// Statistics
	statisticsSvc := statistics.NewStatisticsService(db)
	statisticsHandler := statistics.NewHandler(statisticsSvc)

	// API (Config & External)
	apiRepo := api.NewRepository(db)
	apiSvc := api.NewApiService(apiRepo)
	apiHandler := api.NewHandler(apiRepo, apiSvc)
	externalApiHandler := api.NewExternalHandler(apiRepo)

	// Webhooks
	webhookHandler := webhooks.NewHandler()

	// Facebook
	facebookHandler := facebook.NewHandler()

	// 6. Registro de Rotas (Públicas)
	public := e.Group("/api/v1")
	rootPublic := e.Group("") // Suporte a requisições diretas em /auth/login
	
	// Health Check
	e.GET("/health", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{"status": "ok"})
	})
	
	// Proxy Telemetria OTel
	e.POST("/otel/v1/traces", func(c echo.Context) error {
		// Mock do proxy para não dar 404
		return c.JSON(http.StatusOK, map[string]string{"status": "received"})
	})

	// Registro de Rotas (Protegidas) — JWT injetado via config, sem nenhum hardcode
	protected := e.Group("/api/v1")
	protected.Use(customMiddleware.JWTAuth([]byte(cfg.JWTSecret)))
	protected.Use(customMiddleware.TenantContext)

	authHandler.RegisterRoutes(public, protected)
	authHandler.RegisterRoutes(rootPublic, nil) // Suporte a /auth/login direto sem prefixo
	tenantHandler.RegisterRoutes(protected)
	contactHandler.RegisterRoutes(protected)
	ticketHandler.RegisterRoutes(protected)
	chatFlowHandler.RegisterRoutes(protected)
	campaignHandler.RegisterRoutes(protected)
	queueHandler.RegisterRoutes(protected)
	tagHandler.RegisterRoutes(protected)
	fastReplyHandler.RegisterRoutes(protected)
	settingHandler.RegisterRoutes(protected)
	statisticsHandler.RegisterRoutes(protected)
	apiHandler.RegisterRoutes(protected)
	facebookHandler.RegisterRoutes(protected)
	channelHandler.RegisterRoutes(protected)

	// Rotas Externas e Webhooks
	externalApiHandler.RegisterRoutes(public)
	webhookHandler.RegisterRoutes(public)

	// Websocket Endpoint
	protected.GET("/ws", wsHub.HandleConnection)

	// 7. Start Server
	log.Printf("TikTickets Go Backend iniciando na porta %s...", cfg.Port)
	if err := e.Start(":" + cfg.Port); err != nil && err != http.ErrServerClosed {
		log.Fatalf("Server failed to start: %v", err)
	}
}
