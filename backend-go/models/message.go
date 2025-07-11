package models

import (
	"time"

	"gorm.io/gorm"
)

type Message struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	Body        string         `json:"body" gorm:"not null"`
	FromMe      bool           `json:"fromMe" gorm:"default:false"`
	Read        bool           `json:"read" gorm:"default:false"`
	MediaUrl    string         `json:"mediaUrl"`
	MediaType   string         `json:"mediaType"`
	ContactID   uint           `json:"contact_id" gorm:"not null"`
	Contact     Contact        `json:"contact,omitempty"`
	CompanyID   uint           `json:"company_id" gorm:"not null"`
	Company     Company        `json:"company,omitempty"`
	UserId      *uint          `json:"user_id"`
	User        *User          `json:"user,omitempty"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}

type MessageCreateRequest struct {
	Body      string `json:"body" binding:"required"`
	FromMe    bool   `json:"fromMe"`
	ContactID uint   `json:"contact_id" binding:"required"`
	CompanyID uint   `json:"company_id" binding:"required"`
	MediaUrl  string `json:"mediaUrl"`
	MediaType string `json:"mediaType"`
}

type MessageUpdateRequest struct {
	Body      string `json:"body"`
	Read      *bool  `json:"read"`
	MediaUrl  string `json:"mediaUrl"`
	MediaType string `json:"mediaType"`
}