package channels

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/labstack/echo/v4"
	"go.mau.fi/whatsmeow"
	"go.mau.fi/whatsmeow/proto/waE2E"
	"google.golang.org/protobuf/proto"
)

func TestHandleConnection_UnauthorizedWithoutTenant(t *testing.T) {
	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/ws", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	// Sem tenantId no contexto
	hub := NewWsHub()
	err := hub.HandleConnection(c)

	if err == nil {
		t.Fatalf("esperava erro 401 Unauthorized para conexão sem tenantId autenticado")
	}

	he, ok := err.(*echo.HTTPError)
	if !ok || he.Code != http.StatusUnauthorized {
		t.Fatalf("esperava código HTTP 401, obtido: %v", err)
	}
}

func TestExtractMessageBody_NoSilentDiscards(t *testing.T) {
	// 1. Mensagem de texto simples
	textMsg := &waE2E.Message{
		Conversation: proto.String("Olá Mundo"),
	}
	body, mediaType := extractMessageBody(textMsg)
	if body != "Olá Mundo" || mediaType != "chat" {
		t.Errorf("esperava 'Olá Mundo' / 'chat', obtido: %s / %s", body, mediaType)
	}

	// 2. Mensagem de localização
	locMsg := &waE2E.Message{
		LocationMessage: &waE2E.LocationMessage{
			DegreesLatitude:  proto.Float64(-23.5505),
			DegreesLongitude: proto.Float64(-46.6333),
		},
	}
	bodyLoc, mediaTypeLoc := extractMessageBody(locMsg)
	if bodyLoc == "" || mediaTypeLoc != "location" {
		t.Errorf("localização não deveria ser descartada, obtido: %s / %s", bodyLoc, mediaTypeLoc)
	}

	// 3. Mensagem revogada / apagada
	revokeType := waE2E.ProtocolMessage_REVOKE
	protoMsg := &waE2E.Message{
		ProtocolMessage: &waE2E.ProtocolMessage{
			Type: &revokeType,
		},
	}
	bodyRevoke, mediaTypeRevoke := extractMessageBody(protoMsg)
	if bodyRevoke == "" || mediaTypeRevoke != "revoked" {
		t.Errorf("mensagem apagada não deveria ser descartada, obtido: %s / %s", bodyRevoke, mediaTypeRevoke)
	}

	// 4. Tipo não suportado não deve sumir silenciosamente
	unknownMsg := &waE2E.Message{}
	bodyUnk, mediaTypeUnk := extractMessageBody(unknownMsg)
	if bodyUnk == "" || mediaTypeUnk != "unsupported" {
		t.Errorf("tipo não mapeado deve retornar placeholder, obtido: %s / %s", bodyUnk, mediaTypeUnk)
	}
}

func TestGetOrConnectClient_NoTenantReturnsError(t *testing.T) {
	worker := &WhatsmeowWorker{
		clients: make(map[uint]*whatsmeow.Client),
	}

	// Solicitação sem canal e sem tenant deve falhar imediatamente sem emprestar canal de ninguém
	_, err := worker.getOrConnectClient(context.Background(), 0)
	if err == nil {
		t.Fatalf("esperava erro ao chamar getOrConnectClient sem tenant identificado")
	}
}
