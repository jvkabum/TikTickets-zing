package controllers

import (
	"net/http"
	"strconv"

	"flowdeskpro-backend/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ContactController struct {
	db *gorm.DB
}

func NewContactController(db *gorm.DB) *ContactController {
	return &ContactController{db: db}
}

func (cc *ContactController) List(c *gin.Context) {
	var contacts []models.Contact
	
	query := cc.db.Preload("Company")
	
	// Filtros opcionais
	if companyID := c.Query("company_id"); companyID != "" {
		if id, err := strconv.ParseUint(companyID, 10, 32); err == nil {
			query = query.Where("company_id = ?", id)
		}
	}
	
	if number := c.Query("number"); number != "" {
		query = query.Where("number LIKE ?", "%"+number+"%")
	}

	if err := query.Find(&contacts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar contatos"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"contacts": contacts})
}

func (cc *ContactController) Create(c *gin.Context) {
	var req models.ContactCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos", "details": err.Error()})
		return
	}

	// Verificar se número já existe na empresa
	var existingContact models.Contact
	if err := cc.db.Where("number = ? AND company_id = ?", req.Number, req.CompanyID).First(&existingContact).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Número já cadastrado nesta empresa"})
		return
	}

	contact := models.Contact{
		Name:         req.Name,
		Number:       req.Number,
		Email:        req.Email,
		ProfilePicUrl: req.ProfilePicUrl,
		CompanyID:    req.CompanyID,
	}

	if err := cc.db.Create(&contact).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar contato"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Contato criado com sucesso",
		"contact": contact,
	})
}

func (cc *ContactController) Get(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var contact models.Contact
	if err := cc.db.Preload("Company").Preload("Messages").First(&contact, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Contato não encontrado"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"contact": contact})
}

func (cc *ContactController) Update(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var req models.ContactUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos", "details": err.Error()})
		return
	}

	var contact models.Contact
	if err := cc.db.First(&contact, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Contato não encontrado"})
		return
	}

	// Atualizar campos
	if req.Name != "" {
		contact.Name = req.Name
	}
	if req.Number != "" {
		contact.Number = req.Number
	}
	if req.Email != "" {
		contact.Email = req.Email
	}
	if req.ProfilePicUrl != "" {
		contact.ProfilePicUrl = req.ProfilePicUrl
	}

	if err := cc.db.Save(&contact).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar contato"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Contato atualizado com sucesso",
		"contact": contact,
	})
}

func (cc *ContactController) Delete(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var contact models.Contact
	if err := cc.db.First(&contact, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Contato não encontrado"})
		return
	}

	if err := cc.db.Delete(&contact).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao deletar contato"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Contato deletado com sucesso"})
}