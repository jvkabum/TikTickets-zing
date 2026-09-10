package database

import (
	"fmt"
	"log"
	"os"

	"golang.org/x/crypto/bcrypt"

	"github.com/tiktickets/backend-go/internal/auth"
	"github.com/tiktickets/backend-go/internal/channels"
	"github.com/tiktickets/backend-go/internal/chatflow"
	"github.com/tiktickets/backend-go/internal/queues"
	"github.com/tiktickets/backend-go/internal/settings"
	"github.com/tiktickets/backend-go/internal/tenant"
	"github.com/tiktickets/backend-go/pkg/config"
)

// Seed garante a integridade dos dados padrão essenciais do sistema na inicialização,
// espelhando fielmente o padrão de Tenant, Filas, ChatBot, Settings e Canais testados na Empresa 2.
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

	// ── 4. FILA PADRÃO (Queues - Padrão Empresa 2) ───────────────────────────
	var defaultQueue queues.Queue
	err = DB.Where("name = ? AND tenant_id = ?", "Principal", defaultTenant.ID).First(&defaultQueue).Error
	if err != nil {
		defaultQueue = queues.Queue{
			Name:     "Principal",
			Color:    "#000000",
			IsActive: true,
			TenantID: defaultTenant.ID,
		}
		if err := DB.Create(&defaultQueue).Error; err != nil {
			log.Printf("Seed: aviso ao criar Fila Principal: %v", err)
		} else {
			log.Printf("Seed: Fila Principal (ID %d) criada com sucesso.", defaultQueue.ID)
		}
	}

	// ── 5. CHATFLOW PADRÃO (ChatFlows - Padrão Empresa 2) ─────────────────────
	var defaultFlow chatflow.ChatFlow
	err = DB.Where("name = ? AND tenant_id = ?", "Principal", defaultTenant.ID).First(&defaultFlow).Error
	if err != nil {
		queueIDToUse := uint(1)
		if defaultQueue.ID > 0 {
			queueIDToUse = defaultQueue.ID
		}
		flowJSON := fmt.Sprintf(`{"lineList":[{"from":"start","label":"","paintStyle":{"stroke":"#8db1dd","strokeWidth":3},"to":"nodeC"}],"nodeList":[{"conditions":[{"action":0,"condition":["bot"],"description":"Rotear para Boas vindas!","id":"c6f178e8-77de-4ff6-93b4-42b19dd030a4","nextNode":"nodeC","nextStepId":"nodeC","nodeId":"nodeC","target":"nodeC","type":"Equals"}],"configurations":{"answerCloseTicket":[],"autoDistributeTickets":"N","maxRetryBotMessage":{"destiny":null,"number":null,"type":1},"notOptionsSelectMessage":{"message":""},"notResponseMessage":{"destiny":null,"time":null,"type":1},"welcomeMessage":{"message":""}},"ico":"mdi-play","id":"start","interactions":[],"left":"590px","name":"Início","nodeId":"start","status":"success","style":{},"top":"131px","type":"start","viewOnly":true},{"conditions":[],"configurations":{"answerCloseTicket":[],"autoDistributeTickets":"R","maxRetryBotMessage":{"destiny":%d,"number":1,"type":1},"notOptionsSelectMessage":{"message":"","stepReturn":"A"},"notResponseMessage":{"destiny":%d,"time":10,"type":1},"welcomeMessage":{"message":"Ola somos a empresa ()"}},"ico":"mdi-alert-circle-outline","id":"configurations","interactions":[],"left":"0px","name":"Configurações","nodeId":"configurations","top":"0px","type":"configurations","viewOnly":true},{"actions":[],"conditions":[{"action":1,"condition":["bot"],"description":"","id":"f1d5a75a-1ce3-471b-ba6f-870a0b87252a","nextNode":null,"nodeId":null,"queueId":%d,"type":"US","userIdDestination":null}],"configurations":{"answerCloseTicket":[],"autoDistributeTickets":"N","maxRetryBotMessage":{"destiny":null,"number":null,"type":1},"notOptionsSelectMessage":{"message":""},"notResponseMessage":{"destiny":null,"time":null,"type":1},"welcomeMessage":{"message":""}},"id":"nodeC","interactions":[],"left":"26px","name":"Boas vindas!","nodeId":"nodeC","top":"301px","type":"node"}]}`, queueIDToUse, queueIDToUse, queueIDToUse)

		defaultFlow = chatflow.ChatFlow{
			Name:     "Principal",
			IsActive: true,
			Flow:     chatflow.JSONField(flowJSON),
			TenantID: defaultTenant.ID,
		}
		if err := DB.Create(&defaultFlow).Error; err != nil {
			log.Printf("Seed: aviso ao criar ChatFlow Principal: %v", err)
		} else {
			log.Printf("Seed: ChatFlow Principal (ID %d) criado com sucesso.", defaultFlow.ID)
		}
	}

	// ── 6. SETTINGS (Configurações Idênticas à Empresa 2) ─────────────────────
	botTicketVal := "1"
	if defaultFlow.ID > 0 {
		botTicketVal = fmt.Sprintf("%d", defaultFlow.ID)
	}
	defaultSettings := []settings.Setting{
		{Key: "userCreation", Value: "disabled", TenantID: defaultTenant.ID},
		{Key: "NotViewTicketsQueueUndefined", Value: "disabled", TenantID: defaultTenant.ID},
		{Key: "NotViewTicketsChatBot", Value: "disabled", TenantID: defaultTenant.ID},
		{Key: "DirectTicketsToWallets", Value: "disabled", TenantID: defaultTenant.ID},
		{Key: "botTicketActive", Value: botTicketVal, TenantID: defaultTenant.ID},
		{Key: "NotViewAssignedTickets", Value: "disabled", TenantID: defaultTenant.ID},
		{Key: "ignoreGroupMsg", Value: "enabled", TenantID: defaultTenant.ID},
		{Key: "rejectCalls", Value: "disabled", TenantID: defaultTenant.ID},
		{Key: "callRejectMessage", Value: "As chamadas de voz e vídeo estão desabilitas para esse WhatsApp, favor enviar uma mensagem de texto.", TenantID: defaultTenant.ID},
	}
	for _, s := range defaultSettings {
		var existing settings.Setting
		err := DB.Where("key = ? AND tenant_id = ?", s.Key, defaultTenant.ID).First(&existing).Error
		if err != nil {
			DB.Create(&s)
		} else if s.Key == "botTicketActive" && (existing.Value == "" || existing.Value == "3") && defaultFlow.ID > 0 {
			existing.Value = botTicketVal
			DB.Save(&existing)
		}
	}

	// ── 7. CANAIS PADRÃO (Padrão Empresa 2: Canal Principal com Bot vinculado) ─
	var defaultWhatsapp channels.Whatsapp
	err = DB.Where("name = ? AND tenant_id = ?", "Principal", defaultTenant.ID).First(&defaultWhatsapp).Error
	if err != nil {
		var chatFlowIDPtr *uint
		if defaultFlow.ID > 0 {
			chatFlowIDPtr = &defaultFlow.ID
		}
		defaultWhatsapp = channels.Whatsapp{
			Name:       "Principal",
			Status:     "DISCONNECTED",
			Type:       "whatsapp",
			IsDefault:  true,
			TenantID:   defaultTenant.ID,
			ChatFlowID: chatFlowIDPtr,
			Battery:    "20",
		}
		if err := DB.Create(&defaultWhatsapp).Error; err != nil {
			log.Printf("Seed: aviso ao criar canal Principal: %v", err)
		} else {
			log.Printf("Seed: Canal WhatsApp 'Principal' criado com sucesso com ChatFlow vinculado.")
		}
	} else if defaultWhatsapp.ChatFlowID == nil && defaultFlow.ID > 0 {
		defaultWhatsapp.ChatFlowID = &defaultFlow.ID
		DB.Save(&defaultWhatsapp)
	}

	log.Println("✅ Seed concluído: Tenants, Usuários (Admin/Super), Filas, ChatFlows (Bot), Settings e Canais verificados e garantidos.")
}
