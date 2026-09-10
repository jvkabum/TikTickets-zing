package chatflow

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"
	"gorm.io/gorm"
)

// JSONField gerencia JSON raw no PostgreSQL e serialização/deserialização HTTP
type JSONField json.RawMessage

func (j JSONField) Value() (driver.Value, error) {
	if len(j) == 0 {
		return nil, nil
	}
	return string(j), nil
}

func (j *JSONField) Scan(value interface{}) error {
	if value == nil {
		*j = nil
		return nil
	}
	var bytes []byte
	switch v := value.(type) {
	case []byte:
		bytes = v
	case string:
		bytes = []byte(v)
	default:
		return errors.New("cannot scan type into JSONField")
	}

	// Se for uma string JSON duplamente codificada (ex: "\"{\\\"nodeList\\\":...}\"")
	if len(bytes) > 1 && bytes[0] == '"' && bytes[len(bytes)-1] == '"' {
		var unquoted string
		if err := json.Unmarshal(bytes, &unquoted); err == nil {
			bytes = []byte(unquoted)
		}
	}

	*j = append((*j)[0:0], bytes...)
	return nil
}

func (j JSONField) MarshalJSON() ([]byte, error) {
	if len(j) == 0 {
		return []byte("null"), nil
	}
	return j, nil
}

func (j *JSONField) UnmarshalJSON(data []byte) error {
	if j == nil {
		return errors.New("JSONField: UnmarshalJSON on nil pointer")
	}
	// Se recebido como string escapada, desescapa para o JSON raw
	if len(data) > 1 && data[0] == '"' && data[len(data)-1] == '"' {
		var unquoted string
		if err := json.Unmarshal(data, &unquoted); err == nil {
			*j = append((*j)[0:0], []byte(unquoted)...)
			return nil
		}
	}
	*j = append((*j)[0:0], data...)
	return nil
}

const DefaultFlowJSON = `{
  "name": "Fluxo Inicial",
  "nodeList": [
    {
      "id": "start",
      "name": "Início",
      "type": "start",
      "left": "26px",
      "top": "100px",
      "ico": "mdi-play",
      "viewOnly": true,
      "status": "success",
      "style": {}
    },
    {
      "id": "configurations",
      "name": "Configurações",
      "type": "configurations",
      "left": "340px",
      "top": "100px",
      "viewOnly": true,
      "ico": "mdi-alert-circle-outline",
      "configurations": {
        "notOptionsSelectMessage": {
          "message": "",
          "stepReturn": "A"
        },
        "notResponseMessage": {
          "time": 10,
          "type": 1,
          "destiny": ""
        },
        "welcomeMessage": {
          "message": ""
        },
        "maxRetryBotMessage": {
          "number": 3,
          "type": 1,
          "destiny": ""
        }
      }
    },
    {
      "id": "nodeC",
      "name": "Boas vindas!",
      "type": "node",
      "left": "26px",
      "top": "301px",
      "interactions": [],
      "conditions": [],
      "actions": []
    }
  ],
  "lineList": [
    {
      "from": "start",
      "to": "nodeC",
      "paintStyle": { "strokeWidth": 3, "stroke": "#8db1dd" }
    }
  ]
}`

type ChatFlow struct {
	ID           uint           `gorm:"primaryKey" json:"id"`
	Name         string         `gorm:"column:name" json:"name"`
	Flow         JSONField      `gorm:"type:jsonb;column:flow" json:"flow"`
	IsActive     bool           `gorm:"column:is_active" json:"isActive"`
	IsDeleted    bool           `gorm:"column:is_deleted" json:"isDeleted"`
	CelularTeste string         `gorm:"column:celular_teste" json:"celularTeste"`
	UserID       uint           `gorm:"column:user_id" json:"userId"`
	TenantID     uint           `gorm:"not null;column:tenant_id" json:"tenantId"`
	CreatedAt    time.Time      `gorm:"column:created_at" json:"createdAt"`
	UpdatedAt    time.Time      `gorm:"column:updated_at" json:"updatedAt"`
	DeletedAt    gorm.DeletedAt `gorm:"index;column:deleted_at" json:"deletedAt,omitempty"`
}

func (ChatFlow) TableName() string {
	return "ChatFlows"
}

type AutoReply struct {
	ID           uint           `gorm:"primaryKey"`
	Name         string
	CelularTeste string
	Action       int
	TenantID     uint           `gorm:"not null"`
	CreatedAt    time.Time
	UpdatedAt    time.Time
	DeletedAt    gorm.DeletedAt `gorm:"index"`
}

func (AutoReply) TableName() string {
	return "AutoReplies"
}

type StepsReply struct {
	ID          uint           `gorm:"primaryKey"`
	Reply       string
	InitialStep bool
	AutoReplyID uint
	CreatedAt   time.Time
	UpdatedAt   time.Time
	DeletedAt   gorm.DeletedAt `gorm:"index"`
}

func (StepsReply) TableName() string {
	return "StepsReplies"
}
