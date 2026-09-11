package channels

import (
	"crypto/sha256"
	"encoding/json"
	"strings"
	"unicode/utf8"

	"go.mau.fi/whatsmeow/proto/waE2E"
)

const (
	PollQuestionMaxLen = 255
	PollOptionMaxLen   = 40
)

// PollOptionItem representa a opção formatada para o frontend Vue 3
type PollOptionItem struct {
	Name  string `json:"name"`
	Votes int    `json:"votes"`
}

// PollDataStructure representa a estrutura consumida pelo MessageMediaDisplay.vue
type PollDataStructure struct {
	Name    string           `json:"name"`
	Options []PollOptionItem `json:"options"`
}

// ExtractPollFromMessage extrai pergunta e opções de mensagens de enquete WhatsApp (V1 a V6).
func ExtractPollFromMessage(msg *waE2E.Message) (question string, options []string) {
	if msg == nil {
		return "", nil
	}

	var poll *waE2E.PollCreationMessage
	switch {
	case msg.GetPollCreationMessage() != nil:
		poll = msg.GetPollCreationMessage()
	case msg.GetPollCreationMessageV2() != nil:
		poll = msg.GetPollCreationMessageV2()
	case msg.GetPollCreationMessageV3() != nil:
		poll = msg.GetPollCreationMessageV3()
	case msg.GetPollCreationMessageV5() != nil:
		poll = msg.GetPollCreationMessageV5()
	case msg.GetPollCreationMessageV6() != nil:
		poll = msg.GetPollCreationMessageV6()
	default:
		return "", nil
	}

	if poll == nil {
		return "", nil
	}

	question = strings.TrimSpace(poll.GetName())
	for _, opt := range poll.GetOptions() {
		if opt == nil {
			continue
		}
		name := strings.TrimSpace(opt.GetOptionName())
		if name != "" {
			options = append(options, name)
		}
	}
	return question, options
}

// BuildPollDataJSON monta o JSON formatado no padrão esperado pelo frontend do TikTickets
func BuildPollDataJSON(question string, options []string) string {
	if question == "" && len(options) == 0 {
		return ""
	}

	pollItems := make([]PollOptionItem, 0, len(options))
	for _, opt := range options {
		pollItems = append(pollItems, PollOptionItem{
			Name:  opt,
			Votes: 0,
		})
	}

	data := PollDataStructure{
		Name:    question,
		Options: pollItems,
	}

	bytes, err := json.Marshal(data)
	if err != nil {
		return ""
	}
	return string(bytes)
}

// GenerateOptionHash gera o hash SHA-256 da opção para matching com os votos do WhatsApp
func GenerateOptionHash(option string) []byte {
	opt := strings.TrimSpace(option)
	if utf8.RuneCountInString(opt) > PollOptionMaxLen {
		opt = string([]rune(opt)[:PollOptionMaxLen])
	}
	hash := sha256.Sum256([]byte(opt))
	return hash[:]
}
