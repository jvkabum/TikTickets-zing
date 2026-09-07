package auth

import (
	"time"
	"gorm.io/gorm"
)

type User struct {
	ID           uint           `gorm:"primaryKey" json:"id"`
	Name         string         `gorm:"not null" json:"name"`
	Email        string         `gorm:"not null" json:"email"`
	Status       string         `gorm:"not null" json:"status"`
	PasswordHash string         `gorm:"not null" json:"-"`
	TokenVersion int            `gorm:"default:0" json:"tokenVersion"`
	Profile      string         `gorm:"default:'admin'" json:"profile"`
	TenantID     uint           `gorm:"not null" json:"tenantId"`
	LastLogin    *time.Time     `json:"lastLogin"`
	LastOnline   *time.Time     `json:"lastOnline"`
	LastLogout   *time.Time     `json:"lastLogout"`
	IsOnline     bool           `json:"isOnline"`
	Configs      string         `gorm:"type:json" json:"configs"`
	CreatedAt    time.Time      `json:"createdAt"`
	UpdatedAt    time.Time      `json:"updatedAt"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"deletedAt,omitempty"`
}

func (User) TableName() string {
	return "Users"
}
