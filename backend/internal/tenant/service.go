package tenant

import (
	"context"
	"errors"
	
	"github.com/tiktickets/backend-go/internal/settings"
)

type TenantService struct {
	repo Repository
}

func NewTenantService(repo Repository) *TenantService {
	return &TenantService{repo: repo}
}

// CheckQuota - Regra BR-MIGRAR-003: Respeito a limites e cotas (Ex: MaxUsers)
func (s *TenantService) CheckQuota(ctx context.Context, tenantID uint, currentUsers int, currentConnections int) error {
	tenant, err := s.repo.GetByID(ctx, tenantID)
	if err != nil {
		return err
	}

	if tenant.Status != "active" {
		return errors.New("tenant inactive")
	}

	if tenant.MaxUsers != nil && currentUsers >= *tenant.MaxUsers {
		return errors.New("user limit reached")
	}

	if tenant.MaxConnections != nil && currentConnections >= *tenant.MaxConnections {
		return errors.New("connections limit reached")
	}

	return nil
}

func (s *TenantService) GetTenant(ctx context.Context, tenantID uint) (*Tenant, error) {
	return s.repo.GetByID(ctx, tenantID)
}

func (s *TenantService) UpdateBusinessHours(ctx context.Context, tenantID uint, businessHours string) (*Tenant, error) {
	tenant, err := s.repo.GetByID(ctx, tenantID)
	if err != nil {
		return nil, err
	}
	tenant.BusinessHours = businessHours
	if err := s.repo.Update(ctx, tenant); err != nil {
		return nil, err
	}
	return tenant, nil
}

func (s *TenantService) UpdateMessageBusinessHours(ctx context.Context, tenantID uint, message string) (*Tenant, error) {
	tenant, err := s.repo.GetByID(ctx, tenantID)
	if err != nil {
		return nil, err
	}
	tenant.MessageBusinessHours = message
	if err := s.repo.Update(ctx, tenant); err != nil {
		return nil, err
	}
	return tenant, nil
}

func (s *TenantService) CreateTenant(ctx context.Context, req Tenant) (*Tenant, error) {
	businessHours := `[{"day":0,"hr1":"08:00","hr2":"12:00","hr3":"14:00","hr4":"18:00","type":"O","label":"Domingo"},{"day":1,"hr1":"08:00","hr2":"12:00","hr3":"14:00","hr4":"18:00","type":"O","label":"Segunda-Feira"},{"day":2,"hr1":"08:00","hr2":"12:00","hr3":"14:00","hr4":"18:00","type":"O","label":"Terça-Feira"},{"day":3,"hr1":"08:00","hr2":"12:00","hr3":"14:00","hr4":"18:00","type":"O","label":"Quarta-Feira"},{"day":4,"hr1":"08:00","hr2":"12:00","hr3":"14:00","hr4":"18:00","type":"O","label":"Quinta-Feira"},{"day":5,"hr1":"08:00","hr2":"12:00","hr3":"14:00","hr4":"18:00","type":"O","label":"Sexta-Feira"},{"day":6,"hr1":"08:00","hr2":"12:00","hr3":"14:00","hr4":"18:00","type":"O","label":"Sábado"}]`
	messageBusinessHours := "Olá! Fantástico receber seu contato! No momento estamos ausentes e não poderemos lhe atender, mas vamos priorizar seu atendimento e retornaremos logo mais. Agradecemos muito o contato."

	tenant := Tenant{
		Status:               req.Status,
		Name:                 req.Name,
		MaxUsers:             req.MaxUsers,
		MaxConnections:       req.MaxConnections,
		IsDemo:               req.IsDemo,
		BusinessHours:        businessHours,
		MessageBusinessHours: messageBusinessHours,
	}

	if err := s.repo.Create(ctx, &tenant); err != nil {
		return nil, err
	}

	defaultSettings := []settings.Setting{
		{Key: "userCreation", Value: "disabled"},
		{Key: "NotViewTicketsQueueUndefined", Value: "disabled"},
		{Key: "NotViewTicketsChatBot", Value: "disabled"},
		{Key: "DirectTicketsToWallets", Value: "disabled"},
		{Key: "NotViewAssignedTickets", Value: "disabled"},
		{Key: "botTicketActive", Value: "3"},
		{Key: "ignoreGroupMsg", Value: "enabled"},
		{Key: "rejectCalls", Value: "disabled"},
		{Key: "callRejectMessage", Value: "As chamadas de voz e vídeo estão desabilitas para esse WhatsApp, favor enviar uma mensagem de texto."},
	}

	for _, setting := range defaultSettings {
		setting.TenantID = tenant.ID
		if err := s.repo.CreateSetting(ctx, &setting); err != nil {
			// Log error but continue
		}
	}

	return &tenant, nil
}

func (s *TenantService) UpdateTenant(ctx context.Context, id uint, req Tenant) (*Tenant, error) {
	tenant, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	tenant.Status = req.Status
	tenant.Name = req.Name
	tenant.MaxUsers = req.MaxUsers
	tenant.MaxConnections = req.MaxConnections
	tenant.IsDemo = req.IsDemo

	if err := s.repo.Update(ctx, tenant); err != nil {
		return nil, err
	}
	return tenant, nil
}

func (s *TenantService) ListTenants(ctx context.Context) ([]Tenant, error) {
	return s.repo.List(ctx)
}

func (s *TenantService) DeleteTenant(ctx context.Context, id uint) error {
	return s.repo.Delete(ctx, id)
}
