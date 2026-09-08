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
	// 1. Criação segura de tabelas essenciais que podem não existir no banco legado (ex: Node/Sequelize)
	_ = DB.Exec(`
		CREATE TABLE IF NOT EXISTS "ChatFlows" (
			id serial PRIMARY KEY,
			name text,
			flow json,
			"isActive" boolean DEFAULT true,
			"isDeleted" boolean DEFAULT false,
			"celularTeste" text,
			"userId" bigint,
			tenant_id bigint DEFAULT 1,
			"tenantId" bigint DEFAULT 1,
			"createdAt" timestamp with time zone DEFAULT now(),
			"updatedAt" timestamp with time zone DEFAULT now(),
			deleted_at timestamp with time zone
		);

		CREATE TABLE IF NOT EXISTS "AutoReplies" (
			id serial PRIMARY KEY,
			name text,
			"celularTeste" text,
			action integer,
			tenant_id bigint DEFAULT 1,
			"tenantId" bigint DEFAULT 1,
			"createdAt" timestamp with time zone DEFAULT now(),
			"updatedAt" timestamp with time zone DEFAULT now(),
			deleted_at timestamp with time zone
		);

		CREATE TABLE IF NOT EXISTS "StepsReplies" (
			id serial PRIMARY KEY,
			reply text,
			"initialStep" boolean DEFAULT false,
			"autoReplyId" bigint,
			"createdAt" timestamp with time zone DEFAULT now(),
			"updatedAt" timestamp with time zone DEFAULT now(),
			deleted_at timestamp with time zone
		);

		CREATE TABLE IF NOT EXISTS "Campaigns" (
			id serial PRIMARY KEY,
			name text,
			status text,
			message1 text,
			message2 text,
			message3 text,
			"mediaUrl" text,
			delay integer,
			tenant_id bigint DEFAULT 1,
			"tenantId" bigint DEFAULT 1,
			"createdAt" timestamp with time zone DEFAULT now(),
			"updatedAt" timestamp with time zone DEFAULT now(),
			deleted_at timestamp with time zone
		);

		CREATE TABLE IF NOT EXISTS "CampaignContacts" (
			id serial PRIMARY KEY,
			ack integer,
			"messageRandom" text,
			"campaignId" bigint,
			"contactId" bigint,
			"createdAt" timestamp with time zone DEFAULT now(),
			"updatedAt" timestamp with time zone DEFAULT now(),
			deleted_at timestamp with time zone
		);

		CREATE TABLE IF NOT EXISTS "Protocols" (
			id serial PRIMARY KEY,
			"protocolNumber" text,
			status text,
			"ticketId" bigint,
			"createdAt" timestamp with time zone DEFAULT now(),
			"updatedAt" timestamp with time zone DEFAULT now(),
			deleted_at timestamp with time zone
		);

		CREATE TABLE IF NOT EXISTS "LogTickets" (
			id serial PRIMARY KEY,
			type text,
			"ticketId" bigint,
			"createdAt" timestamp with time zone DEFAULT now(),
			"updatedAt" timestamp with time zone DEFAULT now(),
			deleted_at timestamp with time zone
		);

		CREATE TABLE IF NOT EXISTS "ApiConfigs" (
			id text PRIMARY KEY,
			"sessionId" bigint,
			token text,
			tenant_id bigint DEFAULT 1,
			"tenantId" bigint DEFAULT 1,
			"createdAt" timestamp with time zone DEFAULT now(),
			"updatedAt" timestamp with time zone DEFAULT now(),
			deleted_at timestamp with time zone
		);

		CREATE TABLE IF NOT EXISTS "ContactCustomFields" (
			id serial PRIMARY KEY,
			name text,
			value text,
			"contactId" bigint,
			"createdAt" timestamp with time zone DEFAULT now(),
			"updatedAt" timestamp with time zone DEFAULT now(),
			deleted_at timestamp with time zone
		);
	`)

	// 2. AutoMigrate individual e tolerante a falhas por modelo
	models := []interface{}{
		&tenant.Tenant{},
		&settings.Setting{},
		&auth.User{},
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
	}

	for _, m := range models {
		if err := DB.AutoMigrate(m); err != nil {
			log.Printf("Aviso: AutoMigrate parcial no modelo %T (mantendo compatibilidade): %v", m, err)
		}
	}

	// 3. Sincronização e compatibilidade universal entre Sequelize (camelCase) e GORM (snake_case)
	_ = DB.Exec(`
		DO $$ 
		DECLARE
			tbl text;
		BEGIN 
			FOR tbl IN 
				SELECT table_name 
				FROM information_schema.tables 
				WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
			LOOP
				-- 1. Sincronização tenant_id <-> "tenantId"
				IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = tbl AND column_name = 'tenantId') AND
				   NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = tbl AND column_name = 'tenant_id') THEN
					EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS tenant_id integer DEFAULT 1', tbl);
					EXECUTE format('UPDATE %I SET tenant_id = COALESCE("tenantId", 1)', tbl);
				END IF;

				IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = tbl AND column_name = 'tenant_id') AND
				   NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = tbl AND column_name = 'tenantId') THEN
					EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS "tenantId" integer DEFAULT 1', tbl);
					EXECUTE format('UPDATE %I SET "tenantId" = COALESCE(tenant_id, 1)', tbl);
				END IF;

				IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = tbl AND column_name = 'tenant_id') THEN
					EXECUTE format('UPDATE %I SET tenant_id = 1 WHERE tenant_id IS NULL', tbl);
				END IF;
				IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = tbl AND column_name = 'tenantId') THEN
					EXECUTE format('UPDATE %I SET "tenantId" = 1 WHERE "tenantId" IS NULL', tbl);
				END IF;

				-- 2. Sincronização ticket_id <-> "ticketId"
				IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = tbl AND column_name = 'ticketId') AND
				   NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = tbl AND column_name = 'ticket_id') THEN
					EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS ticket_id bigint', tbl);
					EXECUTE format('UPDATE %I SET ticket_id = "ticketId" WHERE ticket_id IS NULL', tbl);
				END IF;
				IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = tbl AND column_name = 'ticket_id') AND
				   NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = tbl AND column_name = 'ticketId') THEN
					EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS "ticketId" bigint', tbl);
					EXECUTE format('UPDATE %I SET "ticketId" = ticket_id WHERE "ticketId" IS NULL', tbl);
				END IF;

				-- 3. Sincronização user_id <-> "userId"
				IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = tbl AND column_name = 'userId') AND
				   NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = tbl AND column_name = 'user_id') THEN
					EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS user_id bigint', tbl);
					EXECUTE format('UPDATE %I SET user_id = "userId" WHERE user_id IS NULL', tbl);
				END IF;
				IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = tbl AND column_name = 'user_id') AND
				   NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = tbl AND column_name = 'userId') THEN
					EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS "userId" bigint', tbl);
					EXECUTE format('UPDATE %I SET "userId" = user_id WHERE "userId" IS NULL', tbl);
				END IF;

				-- 4. Sincronização created_at <-> "createdAt"
				IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = tbl AND column_name = 'createdAt') AND
				   NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = tbl AND column_name = 'created_at') THEN
					EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now()', tbl);
					EXECUTE format('UPDATE %I SET created_at = "createdAt" WHERE created_at IS NULL', tbl);
				END IF;
				IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = tbl AND column_name = 'created_at') AND
				   NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = tbl AND column_name = 'createdAt') THEN
					EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS "createdAt" timestamp with time zone DEFAULT now()', tbl);
					EXECUTE format('UPDATE %I SET "createdAt" = created_at WHERE "createdAt" IS NULL', tbl);
				END IF;

				-- 5. Sincronização updated_at <-> "updatedAt"
				IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = tbl AND column_name = 'updatedAt') AND
				   NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = tbl AND column_name = 'updated_at') THEN
					EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now()', tbl);
					EXECUTE format('UPDATE %I SET updated_at = "updatedAt" WHERE updated_at IS NULL', tbl);
				END IF;
				IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = tbl AND column_name = 'updated_at') AND
				   NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = tbl AND column_name = 'updatedAt') THEN
					EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS "updatedAt" timestamp with time zone DEFAULT now()', tbl);
					EXECUTE format('UPDATE %I SET "updatedAt" = updated_at WHERE "updatedAt" IS NULL', tbl);
				END IF;

				-- 6. Sincronização is_demo <-> "isDemo" (específico para Tenants)
				IF tbl = 'Tenants' THEN
					IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = tbl AND column_name = 'isDemo') AND
					   NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = tbl AND column_name = 'is_demo') THEN
						EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS is_demo boolean DEFAULT false', tbl);
						EXECUTE format('UPDATE %I SET is_demo = COALESCE("isDemo", false)', tbl);
					END IF;
					IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = tbl AND column_name = 'is_demo') AND
					   NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = tbl AND column_name = 'isDemo') THEN
						EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS "isDemo" boolean DEFAULT false', tbl);
						EXECUTE format('UPDATE %I SET "isDemo" = COALESCE(is_demo, false)', tbl);
					END IF;
				END IF;

				-- 7. Garantia universal de deleted_at para soft-delete do GORM
				IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = tbl AND column_name = 'deleted_at') THEN
					EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone', tbl);
				END IF;
			END LOOP;
		END $$;
	`)

	log.Println("✅ AutoMigrate e sincronização de tabelas concluídos com sucesso!")
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
		adminPassword = "123456"
	}
	adminEmail := os.Getenv("SEED_ADMIN_EMAIL")
	if adminEmail == "" {
		adminEmail = "admin@izing.io"
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
		log.Printf("Seed: aviso - falha ao criar usuário admin: %v", err)
	}

	// ── 3. USUÁRIO SUPER ───────────────────────────────────────────────────────
	// Replica: 20240517000001-create-default-super.ts
	superPassword := os.Getenv("SEED_SUPER_PASSWORD")
	if superPassword == "" {
		superPassword = "123456"
	}
	superEmail := os.Getenv("SEED_SUPER_EMAIL")
	if superEmail == "" {
		superEmail = "super@izing.io"
	}
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

	// Atualiza o OwnerID do tenant com o ID do admin
	t.OwnerID = &admin.ID
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
