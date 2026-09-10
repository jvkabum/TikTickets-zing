package database

import (
	"fmt"
	"log"
	"strings"

	"gorm.io/gorm"
)

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
		} else if existsOld && existsNew {
			var newCount, oldCount int64
			db.Raw(fmt.Sprintf(`SELECT COUNT(*) FROM "%s"`, newTable)).Scan(&newCount)
			db.Raw(fmt.Sprintf(`SELECT COUNT(*) FROM "%s"`, oldTable)).Scan(&oldCount)
			if newCount == 0 && oldCount > 0 {
				log.Printf("Migração: Tabela '%s' está vazia mas '%s' legada possui %d registros. Migrando dados...", newTable, oldTable, oldCount)
				if err := db.Exec(fmt.Sprintf(`DROP TABLE "%s"`, newTable)).Error; err == nil {
					if err := db.Exec(fmt.Sprintf(`ALTER TABLE "%s" RENAME TO "%s"`, oldTable, newTable)).Error; err == nil {
						log.Printf("Migração: Tabela '%s' substituída pelos dados legados de '%s'.", newTable, oldTable)
					}
				}
			}
		}
	}

	// 2. Tabelas e suas colunas que precisam ser migradas de camelCase para snake_case
	columnMigrations := map[string]map[string]string{
		"Tenants": {
			"ownerId":              "owner_id",
			"businessHours":        "business_hours",
			"messageBusinessHours": "message_business_hours",
			"maxUsers":             "max_users",
			"maxConnections":       "max_connections",
			"isDemo":               "is_demo",
			"createdAt":            "created_at",
			"updatedAt":            "updated_at",
			"deletedAt":            "deleted_at",
		},
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
			"tenantId":     "tenant_id",
			"userId":       "user_id",
			"isActive":     "is_active",
			"isDeleted":    "is_deleted",
			"celularTeste": "celular_teste",
			"createdAt":    "created_at",
			"updatedAt":    "updated_at",
			"deletedAt":    "deleted_at",
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
				// Ambas as colunas existem (AutoMigrate já criou a nova como nula/zerada): copia dados antigos para a nova respeitando tipo
				var dataType string
				db.Raw("SELECT data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = ? AND column_name = ?", table, newCol).Scan(&dataType)

				var syncSQL string
				if strings.Contains(strings.ToLower(dataType), "int") {
					syncSQL = fmt.Sprintf(`UPDATE "%s" SET "%s" = "%s" WHERE ("%s" IS NULL OR "%s" = 0) AND "%s" IS NOT NULL`, table, newCol, oldCol, newCol, newCol, oldCol)
				} else {
					syncSQL = fmt.Sprintf(`UPDATE "%s" SET "%s" = "%s" WHERE "%s" IS NULL AND "%s" IS NOT NULL`, table, newCol, oldCol, newCol, oldCol)
				}

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

	// 4. Garantir integridade de colunas na tabela Tenants (bancos legados do Sequelize)
	var tenantsTableExists bool
	db.Raw("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Tenants')").Scan(&tenantsTableExists)
	if tenantsTableExists {
		_ = db.Exec(`ALTER TABLE "Tenants" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp with time zone`).Error
		_ = db.Exec(`ALTER TABLE "Tenants" ADD COLUMN IF NOT EXISTS "is_demo" boolean DEFAULT false`).Error
	}
}
