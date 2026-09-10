package tasks

import (
	"encoding/json"
	"testing"
)

func TestFarewellPayload_Compatibility(t *testing.T) {
	t.Run("Deserializa payload camelCase (Node legado)", func(t *testing.T) {
		jsonData := []byte(`{"ticketId": 123, "tenantId": 45}`)
		var payload FarewellPayload
		if err := json.Unmarshal(jsonData, &payload); err != nil {
			t.Fatalf("Erro ao deserializar camelCase: %v", err)
		}
		if payload.TicketID != 123 || payload.TenantID != 45 {
			t.Errorf("Esperado TicketID=123 e TenantID=45, obtido TicketID=%d, TenantID=%d", payload.TicketID, payload.TenantID)
		}
	})

	t.Run("Deserializa payload snake_case (Go)", func(t *testing.T) {
		jsonData := []byte(`{"ticket_id": 999, "tenant_id": 88}`)
		var payload FarewellPayload
		if err := json.Unmarshal(jsonData, &payload); err != nil {
			t.Fatalf("Erro ao deserializar snake_case: %v", err)
		}
		if payload.TicketID != 999 || payload.TenantID != 88 {
			t.Errorf("Esperado TicketID=999 e TenantID=88, obtido TicketID=%d, TenantID=%d", payload.TicketID, payload.TenantID)
		}
	})
}
