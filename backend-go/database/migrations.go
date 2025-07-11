package database

import (
	"log"

	"flowdeskpro-backend/models"

	"gorm.io/gorm"
)

// RunMigrations executa as migrações do banco de dados
func RunMigrations(db *gorm.DB) error {
	log.Println("Executando migrações do banco de dados...")

	// Lista de modelos para migração
	modelsToMigrate := []interface{}{
		&models.User{},
		&models.Company{},
		&models.Contact{},
		&models.Message{},
	}

	// Executar AutoMigrate para cada modelo
	for _, model := range modelsToMigrate {
		if err := db.AutoMigrate(model); err != nil {
			log.Printf("Erro ao migrar modelo %T: %v", model, err)
			return err
		}
		log.Printf("Modelo %T migrado com sucesso", model)
	}

	log.Println("Todas as migrações foram executadas com sucesso!")
	return nil
}

// SeedDatabase popula o banco com dados iniciais
func SeedDatabase(db *gorm.DB) error {
	log.Println("Populando banco de dados com dados iniciais...")

	// Verificar se já existem dados
	var count int64
	db.Model(&models.Company{}).Count(&count)
	if count > 0 {
		log.Println("Banco já possui dados, pulando seed...")
		return nil
	}

	// Criar empresa padrão
	defaultCompany := models.Company{
		Name:     "Empresa Padrão",
		Email:    "admin@empresa.com",
		Phone:    "(11) 99999-9999",
		Document: "00.000.000/0001-00",
		Status:   true,
		Plan:     "free",
	}

	if err := db.Create(&defaultCompany).Error; err != nil {
		log.Printf("Erro ao criar empresa padrão: %v", err)
		return err
	}

	// Criar usuário admin padrão
	adminUser := models.User{
		Email:     "admin@flowdeskpro.com",
		Password:  "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // "password"
		Name:      "Administrador",
		Profile:   "admin",
		CompanyID: &defaultCompany.ID,
	}

	if err := db.Create(&adminUser).Error; err != nil {
		log.Printf("Erro ao criar usuário admin: %v", err)
		return err
	}

	log.Println("Dados iniciais criados com sucesso!")
	return nil
}