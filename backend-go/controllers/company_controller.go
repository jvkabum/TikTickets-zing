package controllers

import (
	"net/http"
	"strconv"

	"flowdeskpro-backend/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type CompanyController struct {
	db *gorm.DB
}

func NewCompanyController(db *gorm.DB) *CompanyController {
	return &CompanyController{db: db}
}

func (cc *CompanyController) List(c *gin.Context) {
	var companies []models.Company
	
	query := cc.db.Preload("Users")
	
	// Filtros opcionais
	if status := c.Query("status"); status != "" {
		if status == "true" {
			query = query.Where("status = ?", true)
		} else if status == "false" {
			query = query.Where("status = ?", false)
		}
	}
	
	if plan := c.Query("plan"); plan != "" {
		query = query.Where("plan = ?", plan)
	}

	if err := query.Find(&companies).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar empresas"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"companies": companies})
}

func (cc *CompanyController) Create(c *gin.Context) {
	var req models.CompanyCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos", "details": err.Error()})
		return
	}

	// Verificar se email já existe
	var existingCompany models.Company
	if err := cc.db.Where("email = ?", req.Email).First(&existingCompany).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Email já cadastrado"})
		return
	}

	company := models.Company{
		Name:     req.Name,
		Email:    req.Email,
		Phone:    req.Phone,
		Document: req.Document,
		Plan:     req.Plan,
		Status:   true,
	}

	if err := cc.db.Create(&company).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar empresa"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Empresa criada com sucesso",
		"company": company,
	})
}

func (cc *CompanyController) Get(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var company models.Company
	if err := cc.db.Preload("Users").Preload("Contacts").First(&company, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Empresa não encontrada"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"company": company})
}

func (cc *CompanyController) Update(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var req models.CompanyUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos", "details": err.Error()})
		return
	}

	var company models.Company
	if err := cc.db.First(&company, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Empresa não encontrada"})
		return
	}

	// Atualizar campos
	if req.Name != "" {
		company.Name = req.Name
	}
	if req.Email != "" {
		company.Email = req.Email
	}
	if req.Phone != "" {
		company.Phone = req.Phone
	}
	if req.Document != "" {
		company.Document = req.Document
	}
	if req.Status != nil {
		company.Status = *req.Status
	}
	if req.Plan != "" {
		company.Plan = req.Plan
	}

	if err := cc.db.Save(&company).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar empresa"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Empresa atualizada com sucesso",
		"company": company,
	})
}

func (cc *CompanyController) Delete(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var company models.Company
	if err := cc.db.First(&company, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Empresa não encontrada"})
		return
	}

	if err := cc.db.Delete(&company).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao deletar empresa"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Empresa deletada com sucesso"})
}