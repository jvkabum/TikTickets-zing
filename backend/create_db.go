package main

import (
	"fmt"
	"log"
	"strings"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"github.com/tiktickets/backend-go/pkg/config"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("Aviso: Arquivo .env não encontrado.")
	}
	cfg := config.Load()

	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=postgres port=%s sslmode=disable TimeZone=UTC",
		cfg.DBHost, cfg.DBUser, cfg.DBPassword, cfg.DBPort,
	)
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect: %v", err)
	}

	createSQL := fmt.Sprintf(`CREATE DATABASE "%s"`, cfg.DBName)
	err = db.Exec(createSQL).Error
	if err != nil {
		if strings.Contains(err.Error(), "already exists") || strings.Contains(err.Error(), "já existe") {
			log.Printf("Database '%s' já existe.", cfg.DBName)
		} else {
			log.Printf("Create DB error: %v", err)
		}
	} else {
		log.Printf("Database '%s' created successfully!", cfg.DBName)
	}
}
