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
	log.Println("Verificando integridade dos dados padrão (Seeds)...")

	// Hash oficial do Sequelize/Node para a senha '123456'
	// $2a$08$/wEAiCcLkfGcnzxCQprgYeFryP7MCOIbjcpRlWTPY/EQ/ON.gI0qS
	const defaultBcryptHash = "$2a$08$/wEAiCcLkfGcnzxCQprgYeFryP7MCOIbjcpRlWTPY/EQ/ON.gI0qS"

	// ── 1. TENANT (Replica: 20200904070001-create-default-tenant.ts) ───────────
	var defaultTenant tenant.Tenant
	err := DB.Where("name = ?", "Empresa 01").First(&defaultTenant).Error
	if err != nil {
		businessHours := `[{"day": 0, "hr1": "08:00", "hr2": "12:00", "hr3": "14:00", "hr4": "18:00", "type": "O", "label": "Domingo"}, {"day": 1, "hr1": "08:00", "hr2": "12:00", "hr3": "14:00", "hr4": "18:00", "type": "O", "label": "Segunda-Feira"}, {"day": 2, "hr1": "08:00", "hr2": "12:00", "hr3": "14:00", "hr4": "18:00", "type": "O", "label": "Terça-Feira"}, {"day": 3, "hr1": "08:00", "hr2": "12:00", "hr3": "14:00", "hr4": "18:00", "type": "O", "label": "Quarta-Feira"}, {"day": 4, "hr1": "08:00", "hr2": "12:00", "hr3": "14:00", "hr4": "18:00", "type": "O", "label": "Quinta-Feira"}, {"day": 5, "hr1": "08:00", "hr2": "12:00", "hr3": "14:00", "hr4": "18:00", "type": "O", "label": "Sexta-Feira"}, {"day": 6, "hr1": "08:00", "hr2": "12:00", "hr3": "14:00", "hr4": "18:00", "type": "O", "label": "Sábado"}]`
		messageBusinessHours := "Olá! Fantástico receber seu contato! No momento estamos ausentes e não poderemos lhe atender, mas vamos priorizar seu atendimento e retornaremos logo mais. Agradecemos muito o contato."
		maxUsers := 99
		maxConns := 99
		defaultTenant = tenant.Tenant{
			Name:                 "Empresa 01",
			Status:               "active",
			BusinessHours:        businessHours,
			MessageBusinessHours: messageBusinessHours,
			MaxUsers:             &maxUsers,
			MaxConnections:       &maxConns,
		}
		if err := DB.Create(&defaultTenant).Error; err != nil {
			log.Printf("Seed: erro ao criar Tenant padrão: %v", err)
		} else {
			log.Printf("Seed: Tenant 'Empresa 01' (ID %d) criado com sucesso.", defaultTenant.ID)
		}
	}

	// ── 2. USUÁRIO ADMIN (Replica: 20200904070005-create-default-users.ts) ─────
	adminConfigs := `{"filtrosAtendimento":{"searchParam":"","pageNumber":1,"status":["open","pending","closed"],"showAll":true,"count":null,"queuesIds":[],"withUnreadMessages":false,"isNotAssignedUser":false,"includeNotQueueDefined":true},"isDark":false}`
	var adminCount int64
	DB.Model(&auth.User{}).Where("email = ?", "admin@izing.io").Count(&adminCount)
	if adminCount == 0 {
		admin := auth.User{
			Name:         "Administrador",
			Email:        "admin@izing.io",
			PasswordHash: defaultBcryptHash,
			Profile:      "admin",
			TenantID:     defaultTenant.ID,
			Status:       "active",
			Configs:      adminConfigs,
			IsOnline:     false,
		}
		if err := DB.Create(&admin).Error; err != nil {
			log.Printf("Seed: erro ao criar admin@izing.io: %v", err)
		} else {
			log.Printf("Seed: Usuário Administrador (admin@izing.io) criado com sucesso.")
			// Atualiza o OwnerID do tenant
			defaultTenant.OwnerID = &admin.ID
			DB.Save(&defaultTenant)
		}
	}

	// Se houver SEED_ADMIN_EMAIL configurado diferente no .env, garante também a existência dele
	customAdminEmail := os.Getenv("SEED_ADMIN_EMAIL")
	if customAdminEmail != "" && customAdminEmail != "admin@izing.io" {
		var customAdminCount int64
		DB.Model(&auth.User{}).Where("email = ?", customAdminEmail).Count(&customAdminCount)
		if customAdminCount == 0 {
			customPassword := os.Getenv("SEED_ADMIN_PASSWORD")
			var hashToUse string
			if customPassword != "" {
				h, _ := bcrypt.GenerateFromPassword([]byte(customPassword), bcrypt.DefaultCost)
				hashToUse = string(h)
			} else {
				hashToUse = defaultBcryptHash
			}
			customAdmin := auth.User{
				Name:         "Administrador Custom",
				Email:        customAdminEmail,
				PasswordHash: hashToUse,
				Profile:      "admin",
				TenantID:     defaultTenant.ID,
				Status:       "active",
				Configs:      adminConfigs,
				IsOnline:     false,
			}
			DB.Create(&customAdmin)
			log.Printf("Seed: Usuário admin customizado (%s) criado com sucesso.", customAdminEmail)
		}
	}

	// ── 3. USUÁRIO SUPER (Replica: 20240517000001-create-default-super.ts) ─────
	superConfigs := `{"filtrosAtendimento":{"searchParam":"","pageNumber":1,"status":["open","pending"],"showAll":true,"count":null,"queuesIds":[],"withUnreadMessages":false,"isNotAssignedUser":false,"includeNotQueueDefined":true},"isDark":false}`
	var superCount int64
	DB.Model(&auth.User{}).Where("email = ?", "super@izing.io").Count(&superCount)
	if superCount == 0 {
		superUser := auth.User{
			Name:         "Super",
			Email:        "super@izing.io",
			PasswordHash: defaultBcryptHash,
			Profile:      "super",
			TenantID:     defaultTenant.ID,
			Status:       "active",
			Configs:      superConfigs,
			IsOnline:     false,
		}
		if err := DB.Create(&superUser).Error; err != nil {
			log.Printf("Seed: erro ao criar super@izing.io: %v", err)
		} else {
			log.Printf("Seed: Usuário Super (super@izing.io) criado com sucesso.")
		}
	}

	// Se houver SEED_SUPER_EMAIL configurado diferente no .env, garante também a existência dele
	customSuperEmail := os.Getenv("SEED_SUPER_EMAIL")
	if customSuperEmail != "" && customSuperEmail != "super@izing.io" {
		var customSuperCount int64
		DB.Model(&auth.User{}).Where("email = ?", customSuperEmail).Count(&customSuperCount)
		if customSuperCount == 0 {
			customSuperPassword := os.Getenv("SEED_SUPER_PASSWORD")
			var hashToUse string
			if customSuperPassword != "" {
				h, _ := bcrypt.GenerateFromPassword([]byte(customSuperPassword), bcrypt.DefaultCost)
				hashToUse = string(h)
			} else {
				hashToUse = defaultBcryptHash
			}
			customSuper := auth.User{
				Name:         "Super Custom",
				Email:        customSuperEmail,
				PasswordHash: hashToUse,
				Profile:      "super",
				TenantID:     defaultTenant.ID,
				Status:       "active",
				Configs:      superConfigs,
				IsOnline:     false,
			}
			DB.Create(&customSuper)
			log.Printf("Seed: Usuário super customizado (%s) criado com sucesso.", customSuperEmail)
		}
	}

	// ── 4. SETTINGS (Replica: 20200904070004-create-default-settings.ts) ────────
	defaultSettings := []settings.Setting{
		{Key: "userCreation", Value: "disabled", TenantID: defaultTenant.ID},
		{Key: "NotViewTicketsQueueUndefined", Value: "disabled", TenantID: defaultTenant.ID},
		{Key: "NotViewTicketsChatBot", Value: "disabled", TenantID: defaultTenant.ID},
		{Key: "DirectTicketsToWallets", Value: "disabled", TenantID: defaultTenant.ID},
		{Key: "botTicketActive", Value: "3", TenantID: defaultTenant.ID},
		{Key: "NotViewAssignedTickets", Value: "disabled", TenantID: defaultTenant.ID},
		{Key: "ignoreGroupMsg", Value: "enabled", TenantID: defaultTenant.ID},
		{Key: "rejectCalls", Value: "disabled", TenantID: defaultTenant.ID},
		{Key: "callRejectMessage", Value: "As chamadas de voz e vídeo estão desabilitas para esse WhatsApp, favor enviar uma mensagem de texto.", TenantID: defaultTenant.ID},
	}
	for _, s := range defaultSettings {
		var settingCount int64
		DB.Model(&settings.Setting{}).Where("key = ? AND tenant_id = ?", s.Key, defaultTenant.ID).Count(&settingCount)
		if settingCount == 0 {
			DB.Create(&s)
		}
	}

	// ── 5. CANAIS PADRÃO (Replica: 20200904070006-create-default-chanells.ts) ───
	defaultChannels := []channels.Whatsapp{
		{Name: "Whatsapp 01", Status: "DISCONNECTED", Type: "whatsapp", IsDefault: true, TenantID: defaultTenant.ID, Battery: "20"},
		{Name: "Instagram 01", Status: "DISCONNECTED", Type: "instagram", IsDefault: false, TenantID: defaultTenant.ID, Battery: "20"},
		{Name: "Telegram 01", Status: "DISCONNECTED", Type: "telegram", IsDefault: false, TenantID: defaultTenant.ID, Battery: "20"},
	}
	for _, ch := range defaultChannels {
		var channelCount int64
		DB.Model(&channels.Whatsapp{}).Where("name = ? AND tenant_id = ?", ch.Name, defaultTenant.ID).Count(&channelCount)
		if channelCount == 0 {
			DB.Create(&ch)
		}
	}

	log.Println("✅ Seed concluído: Tenants, Usuários (Admin/Super), Settings e Canais verificados e garantidos.")
}
