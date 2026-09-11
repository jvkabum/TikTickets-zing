package channels_test

import (
	"testing"

	"github.com/tiktickets/backend-go/internal/channels"
	"go.mau.fi/whatsmeow/types"
)

func TestNormalizeResolvedPhone(t *testing.T) {
	tests := []struct {
		input    string
		lid      string
		expected string
	}{
		{"5511996700608:11@s.whatsapp.net", "119649383501981", "5511996700608"},
		{"5511996700608", "119649383501981", "5511996700608"},
		{"119649383501981", "119649383501981", ""},
		{"", "119649383501981", ""},
		{"55 11 99670-0608", "119649383501981", "5511996700608"},
	}

	for _, tt := range tests {
		got := channels.NormalizeResolvedPhone(tt.input, tt.lid)
		if got != tt.expected {
			t.Errorf("NormalizeResolvedPhone(%q, %q) = %q; want %q", tt.input, tt.lid, got, tt.expected)
		}
	}
}

func TestResolveContactNumber_DefaultServers(t *testing.T) {
	// Para usuário padrão telefônico, retorna jid.User
	phoneJID := types.NewJID("5511999998888", types.DefaultUserServer)
	if num := channels.ResolveContactNumber(nil, nil, phoneJID); num != "5511999998888" {
		t.Errorf("Esperado 5511999998888, obteve %s", num)
	}

	// Para grupo, retorna jid.User
	groupJID := types.NewJID("120363000000000000", types.GroupServer)
	if num := channels.ResolveContactNumber(nil, nil, groupJID); num != "120363000000000000" {
		t.Errorf("Esperado 120363000000000000, obteve %s", num)
	}
}
