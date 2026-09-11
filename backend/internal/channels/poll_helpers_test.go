package channels

import (
	"encoding/json"
	"testing"

	"go.mau.fi/whatsmeow/proto/waE2E"
	"google.golang.org/protobuf/proto"
)

func TestExtractPollFromMessage(t *testing.T) {
	// Mensagem nula
	q, opts := ExtractPollFromMessage(nil)
	if q != "" || len(opts) != 0 {
		t.Fatalf("esperado vazio para nil message")
	}

	// Mensagem sem enquete
	q, opts = ExtractPollFromMessage(&waE2E.Message{
		Conversation: proto.String("teste"),
	})
	if q != "" || len(opts) != 0 {
		t.Fatalf("esperado vazio para conversa comum")
	}

	// Mensagem com enquete V1
	msgV1 := &waE2E.Message{
		PollCreationMessage: &waE2E.PollCreationMessage{
			Name: proto.String("Qual a melhor cor?"),
			Options: []*waE2E.PollCreationMessage_Option{
				{OptionName: proto.String("Azul")},
				{OptionName: proto.String("Vermelho")},
				{OptionName: proto.String("Verde")},
			},
		},
	}
	q, opts = ExtractPollFromMessage(msgV1)
	if q != "Qual a melhor cor?" {
		t.Fatalf("esperado 'Qual a melhor cor?', obtido '%s'", q)
	}
	if len(opts) != 3 || opts[0] != "Azul" || opts[1] != "Vermelho" || opts[2] != "Verde" {
		t.Fatalf("opções incorretas: %v", opts)
	}

	// Mensagem com enquete V3
	msgV3 := &waE2E.Message{
		PollCreationMessageV3: &waE2E.PollCreationMessage{
			Name: proto.String("Café ou Chá?"),
			Options: []*waE2E.PollCreationMessage_Option{
				{OptionName: proto.String("Café")},
				{OptionName: proto.String("Chá")},
			},
		},
	}
	q, opts = ExtractPollFromMessage(msgV3)
	if q != "Café ou Chá?" || len(opts) != 2 {
		t.Fatalf("falha ao extrair V3: q=%s, opts=%v", q, opts)
	}
}

func TestBuildPollDataJSON(t *testing.T) {
	jsonStr := BuildPollDataJSON("Pergunta teste", []string{"Opção 1", "Opção 2"})
	if jsonStr == "" {
		t.Fatalf("esperado JSON válido, obtido vazio")
	}

	var parsed PollDataStructure
	if err := json.Unmarshal([]byte(jsonStr), &parsed); err != nil {
		t.Fatalf("falha ao desserializar JSON gerado: %v", err)
	}

	if parsed.Name != "Pergunta teste" {
		t.Fatalf("esperado 'Pergunta teste', obtido '%s'", parsed.Name)
	}
	if len(parsed.Options) != 2 || parsed.Options[0].Name != "Opção 1" || parsed.Options[1].Name != "Opção 2" {
		t.Fatalf("opções incorretas: %v", parsed.Options)
	}
	if parsed.Options[0].Votes != 0 || parsed.Options[1].Votes != 0 {
		t.Fatalf("votos iniciais devem ser 0")
	}
}

func TestGenerateOptionHash(t *testing.T) {
	hash1 := GenerateOptionHash("Opção A")
	hash2 := GenerateOptionHash("Opção A")
	hash3 := GenerateOptionHash("Opção B")

	if string(hash1) != string(hash2) {
		t.Fatalf("hashes para a mesma opção devem ser iguais")
	}
	if string(hash1) == string(hash3) {
		t.Fatalf("hashes para opções distintas devem ser diferentes")
	}
}
