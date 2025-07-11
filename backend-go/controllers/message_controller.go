package controllers

import (
	"net/http"
	"strconv"

	"flowdeskpro-backend/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type MessageController struct {
	db *gorm.DB
}

func NewMessageController(db *gorm.DB) *MessageController {
	return &MessageController{db: db}
}

func (mc *MessageController) List(c *gin.Context) {
	var messages []models.Message
	
	query := mc.db.Preload("Contact").Preload("Company").Preload("User")
	
	// Filtros opcionais
	if contactID := c.Query("contact_id"); contactID != "" {
		if id, err := strconv.ParseUint(contactID, 10, 32); err == nil {
			query = query.Where("contact_id = ?", id)
		}
	}
	
	if companyID := c.Query("company_id"); companyID != "" {
		if id, err := strconv.ParseUint(companyID, 10, 32); err == nil {
			query = query.Where("company_id = ?", id)
		}
	}
	
	if fromMe := c.Query("from_me"); fromMe != "" {
		if fromMe == "true" {
			query = query.Where("from_me = ?", true)
		} else if fromMe == "false" {
			query = query.Where("from_me = ?", false)
		}
	}
	
	if read := c.Query("read"); read != "" {
		if read == "true" {
			query = query.Where("read = ?", true)
		} else if read == "false" {
			query = query.Where("read = ?", false)
		}
	}

	// Ordenar por data de criação (mais recentes primeiro)
	query = query.Order("created_at DESC")

	if err := query.Find(&messages).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar mensagens"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"messages": messages})
}

func (mc *MessageController) Create(c *gin.Context) {
	var req models.MessageCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos", "details": err.Error()})
		return
	}

	// Obter user_id do contexto (se autenticado)
	var userID *uint
	if userIDInterface, exists := c.Get("user_id"); exists {
		if userIDUint, ok := userIDInterface.(uint); ok {
			userID = &userIDUint
		}
	}

	message := models.Message{
		Body:      req.Body,
		FromMe:    req.FromMe,
		ContactID: req.ContactID,
		CompanyID: req.CompanyID,
		UserId:    userID,
		MediaUrl:  req.MediaUrl,
		MediaType: req.MediaType,
		Read:      false,
	}

	if err := mc.db.Create(&message).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar mensagem"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Mensagem criada com sucesso",
		"message_data": message,
	})
}

func (mc *MessageController) Get(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var message models.Message
	if err := mc.db.Preload("Contact").Preload("Company").Preload("User").First(&message, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Mensagem não encontrada"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": message})
}

func (mc *MessageController) Update(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var req models.MessageUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos", "details": err.Error()})
		return
	}

	var message models.Message
	if err := mc.db.First(&message, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Mensagem não encontrada"})
		return
	}

	// Atualizar campos
	if req.Body != "" {
		message.Body = req.Body
	}
	if req.Read != nil {
		message.Read = *req.Read
	}
	if req.MediaUrl != "" {
		message.MediaUrl = req.MediaUrl
	}
	if req.MediaType != "" {
		message.MediaType = req.MediaType
	}

	if err := mc.db.Save(&message).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar mensagem"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Mensagem atualizada com sucesso",
		"message_data": message,
	})
}

func (mc *MessageController) Delete(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var message models.Message
	if err := mc.db.First(&message, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Mensagem não encontrada"})
		return
	}

	if err := mc.db.Delete(&message).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao deletar mensagem"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Mensagem deletada com sucesso"})
}