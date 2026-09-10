package auth

import (
	"time"

	"github.com/tiktickets/backend-go/internal/queues"
	"gorm.io/gorm"
)

type User struct {
	ID           uint           `gorm:"primaryKey" json:"id"`
	Name         string         `gorm:"not null" json:"name"`
	Email        string         `gorm:"not null" json:"email"`
	Status       string         `gorm:"not null" json:"status"`
	PasswordHash string         `gorm:"column:password_hash;not null" json:"-"`
	TokenVersion int            `gorm:"column:token_version;default:0" json:"tokenVersion"`
	Profile      string         `gorm:"default:'admin'" json:"profile"`
	TenantID     uint           `gorm:"column:tenant_id;not null" json:"tenantId"`
	LastLogin    *time.Time     `gorm:"column:last_login" json:"lastLogin"`
	LastOnline   *time.Time     `gorm:"column:last_online" json:"lastOnline"`
	LastLogout   *time.Time     `gorm:"column:last_logout" json:"lastLogout"`
	IsOnline     bool           `gorm:"column:is_online" json:"isOnline"`
	Configs      string         `gorm:"type:json" json:"configs"`
	Queues       []queues.Queue `gorm:"-" json:"queues"`
	CreatedAt    time.Time      `gorm:"column:created_at" json:"createdAt"`
	UpdatedAt    time.Time      `gorm:"column:updated_at" json:"updatedAt"`
	DeletedAt    gorm.DeletedAt `gorm:"index;column:deleted_at" json:"deletedAt,omitempty"`
}

func (User) TableName() string {
	return "Users"
}

type UserQueue struct {
	ID      uint `gorm:"primaryKey" json:"id"`
	UserID  uint `gorm:"column:user_id;not null" json:"userId"`
	QueueID uint `gorm:"column:queue_id;not null" json:"queueId"`
}

func (UserQueue) TableName() string {
	return "UsersQueues"
}
