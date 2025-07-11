package models

import (
	"time"

	"gorm.io/gorm"
)

type Contact struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	Name        string         `json:"name" gorm:"not null"`
	Number      string         `json:"number" gorm:"not null"`
	Email       string         `json:"email"`
	ProfilePicUrl string       `json:"profilePicUrl"`
	CompanyID   uint           `json:"company_id" gorm:"not null"`
	Company     Company        `json:"company,omitempty"`
	Messages    []Message      `json:"messages,omitempty"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}

type ContactCreateRequest struct {
	Name        string `json:"name" binding:"required"`
	Number      string `json:"number" binding:"required"`
	Email       string `json:"email" binding:"omitempty,email"`
	ProfilePicUrl string `json:"profilePicUrl"`
	CompanyID   uint   `json:"company_id" binding:"required"`
}

type ContactUpdateRequest struct {
	Name        string `json:"name"`
	Number      string `json:"number"`
	Email       string `json:"email" binding:"omitempty,email"`
	ProfilePicUrl string `json:"profilePicUrl"`
}