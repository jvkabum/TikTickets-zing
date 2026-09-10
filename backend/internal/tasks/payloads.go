package tasks

import (
	"encoding/json"

	"github.com/hibiken/asynq"
)

const (
	TypeFarewellMessage = "ticket:farewell"
)

// FarewellPayload contains data for farewell message task.
type FarewellPayload struct {
	TicketID uint `json:"ticket_id"`
	TenantID uint `json:"tenant_id"`
}

// NewFarewellMessageTask creates a new Asynq task for farewell message.
func NewFarewellMessageTask(ticketID, tenantID uint) (*asynq.Task, error) {
	payload, err := json.Marshal(FarewellPayload{TicketID: ticketID, TenantID: tenantID})
	if err != nil {
		return nil, err
	}
	// Asynq task with options
	return asynq.NewTask(TypeFarewellMessage, payload), nil
}
