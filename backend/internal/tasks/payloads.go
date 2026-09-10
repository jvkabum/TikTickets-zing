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

// UnmarshalJSON aceita tanto camelCase (legado Node/Bull) quanto snake_case (Go/Asynq)
func (p *FarewellPayload) UnmarshalJSON(data []byte) error {
	type Alias FarewellPayload
	aux := struct {
		TicketIdCamel uint `json:"ticketId"`
		TenantIdCamel uint `json:"tenantId"`
		*Alias
	}{
		Alias: (*Alias)(p),
	}
	if err := json.Unmarshal(data, &aux); err != nil {
		return err
	}
	if p.TicketID == 0 && aux.TicketIdCamel != 0 {
		p.TicketID = aux.TicketIdCamel
	}
	if p.TenantID == 0 && aux.TenantIdCamel != 0 {
		p.TenantID = aux.TenantIdCamel
	}
	return nil
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
