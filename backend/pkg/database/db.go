package database

import (
	"fmt"
	"log"
	"os"
	"strings"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"github.com/tiktickets/backend-go/internal/api"
	"github.com/tiktickets/backend-go/internal/auth"
	"github.com/tiktickets/backend-go/internal/campaigns"
	"github.com/tiktickets/backend-go/internal/channels"
	"github.com/tiktickets/backend-go/internal/chatflow"
	"github.com/tiktickets/backend-go/internal/contacts"
	"github.com/tiktickets/backend-go/internal/fastreplies"
	"github.com/tiktickets/backend-go/internal/queues"
	"github.com/tiktickets/backend-go/internal/settings"
	"github.com/tiktickets/backend-go/internal/tags"
	"github.com/tiktickets/backend-go/internal/tenant"
	"github.com/tiktickets/backend-go/internal/tickets"
	"github.com/tiktickets/backend-go/pkg/config"
)

var DB *gorm.DB

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

func AutoMigrate() {
	err := DB.AutoMigrate(
		&tenant.Tenant{},
		&settings.Setting{},
		&auth.User{},
		&auth.UserQueue{},
		&contacts.Contact{},
		&contacts.ContactCustomField{},
		&tickets.Ticket{},
		&tickets.Protocol{},
		&tickets.LogTicket{},
		&tickets.Message{},
		&queues.Queue{},
		&fastreplies.FastReply{},
		&tags.Tag{},
		&api.ApiConfig{},
		&channels.Whatsapp{},
		&chatflow.ChatFlow{},
		&chatflow.AutoReply{},
		&chatflow.StepsReply{},
		&campaigns.Campaign{},
		&campaigns.CampaignContact{},
	)
	if err != nil {
		log.Fatal("Failed to auto-migrate:", err)
	}
}

func Seed(cfg *config.Config) {
	var count int64
	DB.Model(&tenant.Tenant{}).Count(&count)
	if count > 0 {
		return // já foi semeado
	}

	log.Println("Seed: banco vazio detectado, iniciando criação dos dados padrão...")

	// ── 1. TENANT ──────────────────────────────────────────────────────────────
	// Replica: 20200904070001-create-default-tenant.ts
	businessHours := `[{"day":0,"hr1":"08:00","hr2":"12:00","hr3":"14:00","hr4":"18:00","type":"O","label":"Domingo"},{"day":1,"hr1":"08:00","hr2":"12:00","hr3":"14:00","hr4":"18:00","type":"O","label":"Segunda-Feira"},{"day":2,"hr1":"08:00","hr2":"12:00","hr3":"14:00","hr4":"18:00","type":"O","label":"Terça-Feira"},{"day":3,"hr1":"08:00","hr2":"12:00","hr3":"14:00","hr4":"18:00","type":"O","label":"Quarta-Feira"},{"day":4,"hr1":"08:00","hr2":"12:00","hr3":"14:00","hr4":"18:00","type":"O","label":"Quinta-Feira"},{"day":5,"hr1":"08:00","hr2":"12:00","hr3":"14:00","hr4":"18:00","type":"O","label":"Sexta-Feira"},{"day":6,"hr1":"08:00","hr2":"12:00","hr3":"14:00","hr4":"18:00","type":"O","label":"Sábado"}]`
	messageBusinessHours := "Olá! Fantástico receber seu contato! No momento estamos ausentes e não poderemos lhe atender, mas vamos priorizar seu atendimento e retornaremos logo mais. Agradecemos muito o contato."

	maxUsers := 99
	maxConns := 99
	t := tenant.Tenant{
		Name:                 "Empresa 01",
		Status:               "active",
		BusinessHours:        businessHours,
		MessageBusinessHours: messageBusinessHours,
		MaxUsers:             &maxUsers,
		MaxConnections:       &maxConns,
	}
	if err := DB.Create(&t).Error; err != nil {
		log.Fatalf("Seed: falha ao criar Tenant padrão: %v", err)
	}

	// ── 2. USUÁRIO ADMIN ───────────────────────────────────────────────────────
	// Replica: 20200904070005-create-default-users.ts
	adminPassword := os.Getenv("SEED_ADMIN_PASSWORD")
	if adminPassword == "" {
		log.Fatal("ERRO FATAL: SEED_ADMIN_PASSWORD não definida no .env")
	}
	adminEmail := os.Getenv("SEED_ADMIN_EMAIL")
	if adminEmail == "" {
		log.Fatal("ERRO FATAL: SEED_ADMIN_EMAIL não definida no .env")
	}
	adminConfigs := `{"filtrosAtendimento":{"searchParam":"","pageNumber":1,"status":["open","pending","closed"],"showAll":true,"count":null,"queuesIds":[],"withUnreadMessages":false,"isNotAssignedUser":false,"includeNotQueueDefined":true},"isDark":false}`

	adminHash, _ := bcrypt.GenerateFromPassword([]byte(adminPassword), bcrypt.DefaultCost)
	admin := auth.User{
		Name:         "Administrador",
		Email:        adminEmail,
		PasswordHash: string(adminHash),
		Profile:      "admin",
		TenantID:     t.ID,
		Status:       "active",
		Configs:      adminConfigs,
		IsOnline:     false,
	}
	if err := DB.Create(&admin).Error; err != nil {
		log.Fatalf("Seed: falha ao criar usuário admin: %v", err)
	}

	// ── 3. USUÁRIO SUPER ───────────────────────────────────────────────────────
	// Replica: 20240517000001-create-default-super.ts
	superPassword := os.Getenv("SEED_SUPER_PASSWORD")
	superEmail := os.Getenv("SEED_SUPER_EMAIL")
	if superEmail != "" && superPassword != "" {
		superConfigs := `{"filtrosAtendimento":{"searchParam":"","pageNumber":1,"status":["open","pending"],"showAll":true,"count":null,"queuesIds":[],"withUnreadMessages":false,"isNotAssignedUser":false,"includeNotQueueDefined":true},"isDark":false}`
		superHash, _ := bcrypt.GenerateFromPassword([]byte(superPassword), bcrypt.DefaultCost)
		superUser := auth.User{
			Name:         "Super",
			Email:        superEmail,
			PasswordHash: string(superHash),
			Profile:      "super",
			TenantID:     t.ID,
			Status:       "active",
			Configs:      superConfigs,
			IsOnline:     false,
		}
		if err := DB.Create(&superUser).Error; err != nil {
			log.Printf("Seed: aviso - falha ao criar usuário super: %v", err)
		} else {
			log.Printf("Seed: usuário super criado (%s)", superEmail)
		}
	} else {
		log.Println("Seed: SEED_SUPER_EMAIL/SEED_SUPER_PASSWORD não definidos, usuário super ignorado.")
	}

	// Atualiza o OwnerID do tenant com o ID do admin
	t.OwnerID = admin.ID
	DB.Save(&t)

	// ── 4. SETTINGS ───────────────────────────────────────────────────────────
	// Replica: 20200904070004-create-default-settings.ts
	defaultSettings := []settings.Setting{
		{Key: "userCreation", Value: "disabled", TenantID: t.ID},
		{Key: "NotViewTicketsQueueUndefined", Value: "disabled", TenantID: t.ID},
		{Key: "NotViewTicketsChatBot", Value: "disabled", TenantID: t.ID},
		{Key: "DirectTicketsToWallets", Value: "disabled", TenantID: t.ID},
		{Key: "botTicketActive", Value: "3", TenantID: t.ID},
		{Key: "NotViewAssignedTickets", Value: "disabled", TenantID: t.ID},
		{Key: "ignoreGroupMsg", Value: "enabled", TenantID: t.ID},
		{Key: "rejectCalls", Value: "disabled", TenantID: t.ID},
		{Key: "callRejectMessage", Value: "As chamadas de voz e vídeo estão desabilitas para esse WhatsApp, favor enviar uma mensagem de texto.", TenantID: t.ID},
	}
	for _, s := range defaultSettings {
		if err := DB.Create(&s).Error; err != nil {
			log.Printf("Seed: aviso - falha ao criar setting '%s': %v", s.Key, err)
		}
	}

	// ── 5. CANAIS PADRÃO ──────────────────────────────────────────────────────
	// Replica: 20200904070006-create-default-chanells.ts
	defaultChannels := []channels.Whatsapp{
		{Name: "Whatsapp 01", Status: "DISCONNECTED", Type: "whatsapp", IsDefault: true, TenantID: t.ID, Session: "", Qrcode: "", TokenHook: ""},
		{Name: "Instagram 01", Status: "DISCONNECTED", Type: "instagram", IsDefault: false, TenantID: t.ID, Session: "", Qrcode: "", TokenHook: ""},
		{Name: "Telegram 01", Status: "DISCONNECTED", Type: "telegram", IsDefault: false, TenantID: t.ID, Session: "", Qrcode: "", TokenHook: ""},
	}
	for _, ch := range defaultChannels {
		if err := DB.Create(&ch).Error; err != nil {
			log.Printf("Seed: aviso - falha ao criar canal '%s': %v", ch.Name, err)
		}
	}

	log.Println("✅ Seed finalizado: Tenant, Admin, Super, Settings e Canais padrão criados com sucesso.")
}
