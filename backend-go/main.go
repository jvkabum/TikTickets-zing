package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"flowdeskpro-backend/config"
	"flowdeskpro-backend/database"
	"flowdeskpro-backend/routes"
	"flowdeskpro-backend/utils/logger"

	"github.com/gin-gonic/gin"
)

func main() {
	// Carregar configurações
	cfg := config.Load()

	// Configurar logger
	logger := logger.New(cfg.LogLevel)

	// Conectar ao banco de dados
	db, err := database.Connect(cfg.Database)
	if err != nil {
		logger.Fatal("Erro ao conectar ao banco de dados:", err)
	}

	// Executar migrações
	if err := database.RunMigrations(db); err != nil {
		logger.Fatal("Erro ao executar migrações:", err)
	}

	// Popular banco com dados iniciais (apenas em desenvolvimento)
	if cfg.Environment == "development" {
		if err := database.SeedDatabase(db); err != nil {
			logger.Error("Erro ao popular banco:", err)
		}
	}

	// Configurar Gin
	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Criar router
	router := gin.New()
	router.Use(gin.Recovery())
	router.Use(logger.Middleware())

	// Configurar rotas
	routes.Setup(router, db, cfg)

	// Configurar servidor HTTP
	srv := &http.Server{
		Addr:    ":" + cfg.Port,
		Handler: router,
	}

	// Canal para receber sinais de shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	// Iniciar servidor em goroutine
	go func() {
		logger.Info("Servidor iniciando na porta:", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Fatal("Erro ao iniciar servidor:", err)
		}
	}()

	// Aguardar sinal de shutdown
	<-quit
	logger.Info("Desligando servidor...")

	// Contexto com timeout para shutdown graceful
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		logger.Fatal("Erro ao desligar servidor:", err)
	}

	logger.Info("Servidor desligado com sucesso")
}