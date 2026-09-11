package database

import (
	"log"

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
)

// AutoMigrate executa as migrações automáticas de esquemas no banco de dados via GORM.
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

	// Índices essenciais de unicidade e desempenho multi-tenant
	_ = DB.Exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_contacts_number_tenant_id ON "Contacts" (number, tenant_id)`).Error
	_ = DB.Exec(`CREATE INDEX IF NOT EXISTS idx_contacts_lid_tenant ON "Contacts" (lid, tenant_id)`).Error
	_ = DB.Exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_tags_tag_tenant_id ON "Tags" (tag, tenant_id)`).Error
}
