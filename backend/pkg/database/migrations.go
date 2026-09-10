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
	// Executa migrações de compatibilidade legada antes do AutoMigrate do GORM
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
