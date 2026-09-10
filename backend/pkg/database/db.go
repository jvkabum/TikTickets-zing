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

// RunLegacyMigrations garante a compatibilidade e migração suave de bases legadas do Node.js (Sequelize)
// para o backend em Golang (GORM), convertendo tabelas singulares e colunas em camelCase ("tenantId", "userId", etc.)
// para snake_case ("tenant_id", "user_id", etc.) sem perda de dados.
func RunLegacyMigrations(db *gorm.DB) {
	log.Println("Verificando necessidade de migrações de compatibilidade legada (Node -> Go)...")

	// 1. Normalização de nomes de tabelas legadas (Singular -> Plural esperado pelo Go)
	tableRenames := map[string]string{
		"ChatFlow":   "ChatFlows",
		"FastReply":  "FastReplies",
		"AutoReply":  "AutoReplies",
		"StepsReply": "StepsReplies",
	}

	for oldTable, newTable := range tableRenames {
		var existsOld, existsNew bool
		db.Raw("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = ?)", oldTable).Scan(&existsOld)
		db.Raw("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = ?)", newTable).Scan(&existsNew)

		if existsOld && !existsNew {
			renameSQL := fmt.Sprintf(`ALTER TABLE "%s" RENAME TO "%s"`, oldTable, newTable)
			if err := db.Exec(renameSQL).Error; err != nil {
				log.Printf("Aviso: Falha ao renomear tabela legada '%s' para '%s': %v", oldTable, newTable, err)
			} else {
				log.Printf("Migração: Tabela legada '%s' renomeada para '%s' com sucesso.", oldTable, newTable)
			}
		}
	}

	// 2. Tabelas e suas colunas que precisam ser migradas de camelCase para snake_case
	columnMigrations := map[string]map[string]string{
		"Users": {
			"tenantId":     "tenant_id",
			"passwordHash": "password_hash",
			"tokenVersion": "token_version",
			"lastLogin":    "last_login",
			"lastOnline":   "last_online",
			"lastLogout":   "last_logout",
			"isOnline":     "is_online",
		},
		"Tickets": {
			"tenantId":            "tenant_id",
			"contactId":           "contact_id",
			"userId":              "user_id",
			"queueId":             "queue_id",
			"whatsappId":          "whatsapp_id",
			"unreadMessages":      "unread_messages",
			"lastMessage":         "last_message",
			"isGroup":             "is_group",
			"isActiveDemand":      "is_active_demand",
			"isFarewellMessage":   "is_farewell_message",
			"attendanceCount":     "attendance_count",
			"closedAt":            "closed_at",
			"startedAttendanceAt": "started_attendance_at",
		},
		"Contacts": {
			"tenantId":      "tenant_id",
			"profilePicUrl": "profile_pic_url",
			"extraInfo":     "extra_info",
			"telegramId":    "telegram_id",
			"instagramPk":   "instagram_pk",
			"isGroup":       "is_group",
		},
		"Messages": {
			"tenantId":    "tenant_id",
			"ticketId":    "ticket_id",
			"messageId":   "message_id",
			"fromMe":      "from_me",
			"sendType":    "send_type",
			"pollData":    "poll_data",
			"mediaUrl":    "media_url",
			"mediaName":   "media_name",
			"mediaType":   "media_type",
			"quotedMsgId": "quoted_msg_id",
		},
		"Queues": {
			"tenantId": "tenant_id",
		},
		"Settings": {
			"tenantId": "tenant_id",
		},
		"Whatsapps": {
			"tenantId": "tenant_id",
		},
		"Campaigns": {
			"tenantId": "tenant_id",
			"mediaUrl": "media_url",
		},
		"CampaignContacts": {
			"messageRandom": "message_random",
			"campaignId":    "campaign_id",
			"contactId":     "contact_id",
		},
		"ApiConfigs": {
			"tenantId":          "tenant_id",
			"sessionId":         "session_id",
			"userId":            "user_id",
			"isActive":          "is_active",
			"authToken":         "auth_token",
			"urlServiceStatus":  "url_service_status",
			"urlMessageStatus":  "url_message_status",
		},
		"ChatFlows": {
			"tenantId": "tenant_id",
			"userId":   "user_id",
			"isActive": "is_active",
		},
		"FastReplies": {
			"tenantId": "tenant_id",
			"userId":   "user_id",
		},
		"Tags": {
			"tenantId": "tenant_id",
		},
		"Protocols": {
			"tenantId":       "tenant_id",
			"ticketId":       "ticket_id",
			"protocolNumber": "protocol_number",
		},
		"LogTickets": {
			"ticketId": "ticket_id",
		},
		"UsersQueues": {
			"userId":  "user_id",
			"queueId": "queue_id",
		},
		"ContactCustomFields": {
			"contactId": "contact_id",
		},
	}

	for table, columns := range columnMigrations {
		var tableExists bool
		db.Raw("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = ?)", table).Scan(&tableExists)
		if !tableExists {
			continue
		}

		for oldCol, newCol := range columns {
			var hasOldCol, hasNewCol bool
			db.Raw("SELECT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = ? AND column_name = ?)", table, oldCol).Scan(&hasOldCol)
			db.Raw("SELECT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = ? AND column_name = ?)", table, newCol).Scan(&hasNewCol)

			if hasOldCol && !hasNewCol {
				// Coluna antiga existe e a nova ainda não: renomeia diretamente
				renameColSQL := fmt.Sprintf(`ALTER TABLE "%s" RENAME COLUMN "%s" TO "%s"`, table, oldCol, newCol)
				if err := db.Exec(renameColSQL).Error; err != nil {
					log.Printf("Aviso: Falha ao renomear coluna '%s.%s' para '%s': %v", table, oldCol, newCol, err)
				} else {
					log.Printf("Migração: Coluna '%s.%s' renomeada para '%s'.", table, oldCol, newCol)
				}
			} else if hasOldCol && hasNewCol {
				// Ambas as colunas existem (AutoMigrate já criou a nova como nula/zerada): copia dados antigos para a nova
				syncSQL := fmt.Sprintf(`UPDATE "%s" SET "%s" = "%s" WHERE ("%s" IS NULL OR "%s" = 0) AND "%s" IS NOT NULL`, table, newCol, oldCol, newCol, newCol, oldCol)
				if err := db.Exec(syncSQL).Error; err != nil {
					log.Printf("Aviso: Falha ao sincronizar dados de '%s.%s' para '%s.%s': %v", table, oldCol, table, newCol, err)
				} else {
					log.Printf("Migração: Dados sincronizados de '%s.%s' para '%s.%s'.", table, oldCol, table, newCol)
				}
			}
		}
	}

	// 3. Garantir índices essenciais de integridade multi-tenant em snake_case
	var contactsTableExists bool
	db.Raw("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Contacts')").Scan(&contactsTableExists)
	if contactsTableExists {
		_ = db.Exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_contacts_number_tenant_id ON "Contacts" (number, tenant_id)`).Error
	}

	var tagsTableExists bool
	db.Raw("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Tags')").Scan(&tagsTableExists)
	if tagsTableExists {
		_ = db.Exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_tags_tag_tenant_id ON "Tags" (tag, tenant_id)`).Error
	}
}

func AutoMigrate() {
	// Executa migrações de compatibilidade antes do AutoMigrate do GORM
	RunLegacyMigrations(DB)

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
