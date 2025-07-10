package models

import (
	"time"

	"gorm.io/gorm"
)

type Company struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	Name        string         `json:"name" gorm:"not null"`
	Email       string         `json:"email" gorm:"uniqueIndex"`
	Phone       string         `json:"phone"`
	Document    string         `json:"document"`
	Status      bool           `json:"status" gorm:"default:true"`
	Plan        string         `json:"plan" gorm:"default:'free'"`
	DueDate     *time.Time     `json:"due_date"`
	Users       []User         `json:"users,omitempty"`
	Contacts    []Contact      `json:"contacts,omitempty"`
	Messages    []Message      `json:"messages,omitempty"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}

type CompanyCreateRequest struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Phone    string `json:"phone"`
	Document string `json:"document"`
	Plan     string `json:"plan"`
}

type CompanyUpdateRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email" binding:"omitempty,email"`
	Phone    string `json:"phone"`
	Document string `json:"document"`
	Status   *bool  `json:"status"`
	Plan     string `json:"plan"`
}