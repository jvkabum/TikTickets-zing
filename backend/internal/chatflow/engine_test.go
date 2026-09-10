package chatflow

import (
	"encoding/json"
	"testing"
)

func TestProcessMessage_StartNode(t *testing.T) {
	engine := NewFlowEngine(nil)

	flowJSON := []byte(`{
		"startNode": "node1",
		"nodes": {
			"node1": {
				"id": "node1",
				"type": "message",
				"nextNode": "node2"
			}
		}
	}`)

	nextNodeID, action, err := engine.ProcessMessage(flowJSON, "", "oi")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if nextNodeID != "node2" {
		t.Fatalf("expected next node to be node2, got %s", nextNodeID)
	}
	if action != "send_message" {
		t.Fatalf("expected action to be send_message, got %s", action)
	}
}

func TestProcessMessage_ConditionNode(t *testing.T) {
	engine := NewFlowEngine(nil)

	flowJSON := []byte(`{
		"startNode": "node1",
		"nodes": {
			"node1": {
				"id": "node1",
				"type": "condition",
				"data": {
					"expectedMessage": "1"
				},
				"trueNode": "nodeVendas",
				"falseNode": "nodeSuporte"
			}
		}
	}`)

	// Testa caminho true
	nextNodeID, action, err := engine.ProcessMessage(flowJSON, "node1", "1")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if nextNodeID != "nodeVendas" || action != "send_message" {
		t.Fatalf("expected next node nodeVendas and action send_message")
	}

	// Testa caminho false
	nextNodeID, _, _ = engine.ProcessMessage(flowJSON, "node1", "2")
	if nextNodeID != "nodeSuporte" {
		t.Fatalf("expected next node nodeSuporte, got %s", nextNodeID)
	}
}

func TestProcessMessage_TransferQueue(t *testing.T) {
	engine := NewFlowEngine(nil)

	flowJSON := []byte(`{
		"startNode": "node1",
		"nodes": {
			"node1": {
				"id": "node1",
				"type": "transfer_queue"
			}
		}
	}`)

	nextNodeID, action, err := engine.ProcessMessage(flowJSON, "node1", "")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if nextNodeID != "" {
		t.Fatalf("expected empty next node, got %s", nextNodeID)
	}
	if action != "transfer" {
		t.Fatalf("expected action transfer, got %s", action)
	}
}

func TestChatFlow_JSONField(t *testing.T) {
	// 1. Unmarshal com payload do frontend com flow aninhado como objeto
	payloadNested := []byte(`{
		"id": 1,
		"name": "Fluxo Teste",
		"flow": {
			"nodeList": [{"id": "start", "name": "Início"}],
			"lineList": []
		}
	}`)

	var cf ChatFlow
	if err := json.Unmarshal(payloadNested, &cf); err != nil {
		t.Fatalf("expected unmarshal to succeed with nested object flow, got %v", err)
	}

	if len(cf.Flow) == 0 {
		t.Fatalf("expected flow to not be empty")
	}

	// 2. Marshal deve serializar flow como objeto e não como string com escape
	marshaled, err := json.Marshal(cf)
	if err != nil {
		t.Fatalf("failed to marshal ChatFlow: %v", err)
	}

	var parsed map[string]interface{}
	if err := json.Unmarshal(marshaled, &parsed); err != nil {
		t.Fatalf("failed to unmarshal marshaled ChatFlow: %v", err)
	}

	flowMap, ok := parsed["flow"].(map[string]interface{})
	if !ok {
		t.Fatalf("expected parsed['flow'] to be a map[string]interface{}, got %T", parsed["flow"])
	}

	nodeList, ok := flowMap["nodeList"].([]interface{})
	if !ok || len(nodeList) != 1 {
		t.Fatalf("expected nodeList to have 1 item, got %v", flowMap["nodeList"])
	}

	// 3. Scan com string escapada (compatibilidade legado)
	var jf JSONField
	escapedStr := `"{\"name\":\"Fluxo Legado\"}"`
	if err := jf.Scan(escapedStr); err != nil {
		t.Fatalf("scan failed: %v", err)
	}
	if string(jf) != `{"name":"Fluxo Legado"}` {
		t.Fatalf("expected unquoted string, got %s", string(jf))
	}
}
