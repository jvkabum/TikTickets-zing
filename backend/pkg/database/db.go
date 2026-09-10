package database

import (
	"fmt"
	"log"
	"strings"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"github.com/tiktickets/backend-go/pkg/config"
)

var DB *gorm.DB

// Connect inicializa a conexão com o PostgreSQL, criando o banco de dados caso ele não exista.
func Connect(cfg *config.Config) {
	// Tentar conectar no banco 'postgres' para criar o banco de dados caso não exista
	defaultDsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=postgres port=%s sslmode=disable TimeZone=UTC",
		cfg.DBHost, cfg.DBUser, cfg.DBPassword, cfg.DBPort,
	)
	defaultDb, err := gorm.Open(postgres.Open(defaultDsn), &gorm.Config{})
	if err == nil {
		createSQL := fmt.Sprintf(`CREATE DATABASE "%s"`, cfg.DBName)
		err := defaultDb.Exec(createSQL).Error
		if err != nil {
			if !strings.Contains(err.Error(), "already exists") && !strings.Contains(err.Error(), "já existe") {
				log.Printf("Warning: Falha ao tentar criar banco (pode já existir): %v", err)
			}
		} else {
			log.Printf("Banco de dados '%s' criado automaticamente com sucesso!", cfg.DBName)
		}
		sqlDB, _ := defaultDb.DB()
		if sqlDB != nil {
			sqlDB.Close()
		}
	} else {
		log.Printf("Warning: Não foi possível conectar ao db default para auto-criação: %v", err)
	}

	// Conectar ao banco de dados alvo
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=UTC",
		cfg.DBHost, cfg.DBUser, cfg.DBPassword, cfg.DBName, cfg.DBPort,
	)
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	DB = db
}
