package chatflow

import (
	"encoding/json"
	"errors"
	"fmt"
)

type FlowEngine struct {
	repo Repository
}

func NewFlowEngine(repo Repository) *FlowEngine {
	return &FlowEngine{repo: repo}
}

// Representação de um Nó do FlowBuilder (BR-MIGRAR-010)
type FlowNode struct {
	ID        string                 `json:"id"`
	Type      string                 `json:"type"` // ex: "message", "condition", "transfer_queue"
	Data      map[string]interface{} `json:"data"`
	NextNode  string                 `json:"nextNode,omitempty"`
	TrueNode  string                 `json:"trueNode,omitempty"`
	FalseNode string                 `json:"falseNode,omitempty"`
}

type FlowDefinition struct {
	Nodes map[string]FlowNode `json:"nodes"`
	Start string              `json:"startNode"`
}

// ProcessMessage Processa a mensagem do usuário a partir do nó atual e retorna o próximo nó
func (e *FlowEngine) ProcessMessage(flowJSON []byte, currentNodeID string, userMessage string) (nextNodeID string, action string, err error) {
	var flow FlowDefinition
	if err := json.Unmarshal(flowJSON, &flow); err != nil {
		return "", "", fmt.Errorf("invalid flow JSON: %w", err)
	}

	// Se não tem nó atual, começa do início
	if currentNodeID == "" {
		currentNodeID = flow.Start
	}

	node, exists := flow.Nodes[currentNodeID]
	if !exists {
		return "", "", errors.New("node not found in flow")
	}

	// Avalia a ação do nó atual com base na mensagem
	switch node.Type {
	case "message":
		// Simplesmente avança para o próximo
		return node.NextNode, "send_message", nil

	case "condition":
		// Avalia a condição (ex: usuário digitou '1' ou '2')
		expectedMsg, ok := node.Data["expectedMessage"].(string)
		if ok && userMessage == expectedMsg {
			return node.TrueNode, "send_message", nil
		}
		return node.FalseNode, "send_message", nil

	case "transfer_queue":
		// Envia para a fila humana e encerra o fluxo do bot
		return "", "transfer", nil

	default:
		return "", "", fmt.Errorf("unknown node type: %s", node.Type)
	}
}
