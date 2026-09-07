package chatflow

import (
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
