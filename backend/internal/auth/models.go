package auth

import (
	"time"
)

type User struct {
	ID           uint           `gorm:"primaryKey" json:"id"`
	Name         string         `gorm:"not null" json:"name"`
	Email        string         `gorm:"not null" json:"email"`
	Status       string         `gorm:"not null" json:"status"`
	PasswordHash string         `gorm:"column:passwordHash;not null" json:"-"`
	TokenVersion int            `gorm:"column:tokenVersion;default:0" json:"tokenVersion"`
	Profile      string         `gorm:"default:'admin'" json:"profile"`
	TenantID     uint           `gorm:"column:tenantId;not null" json:"tenantId"`
	LastLogin    *time.Time     `gorm:"column:lastLogin" json:"lastLogin"`
	LastOnline   *time.Time     `gorm:"column:lastOnline" json:"lastOnline"`
	LastLogout   *time.Time     `gorm:"column:lastLogout" json:"lastLogout"`
	IsOnline     bool           `gorm:"column:isOnline" json:"isOnline"`
	Configs      string         `gorm:"type:json" json:"configs"`
	CreatedAt    time.Time      `gorm:"column:createdAt" json:"createdAt"`
	UpdatedAt    time.Time      `gorm:"column:updatedAt" json:"updatedAt"`
}

func (User) TableName() string {
	return "Users"
}
