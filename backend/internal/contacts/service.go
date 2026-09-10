package contacts

import (
	"context"
	"errors"
)

type ContactService struct {
	repo Repository
}

func NewContactService(repo Repository) *ContactService {
	return &ContactService{repo: repo}
}

// CreateOrUpdate Lógica de Upsert: se o telefone já existe para esse tenant, apenas atualiza.
func (s *ContactService) CreateOrUpdate(ctx context.Context, contact *Contact) error {
	if contact.Number == "" || contact.TenantID == 0 {
		return errors.New("número de telefone e TenantID são obrigatórios")
	}

	// BR-MIGRAR-009: Validação Ativa (Apenas pseudocódigo ou stub, já que precisa do client whatsmeow injetado)
	// if !whatsmeowClient.IsOnWhatsApp(contact.Number) {
	// 	 return errors.New("número não possui WhatsApp ativo")
	// }

	existing, err := s.repo.GetByNumber(ctx, contact.Number, contact.TenantID)
	if err == nil && existing != nil {
		// Update
		existing.Name = contact.Name
		existing.Pushname = contact.Pushname
		existing.ProfilePicUrl = contact.ProfilePicUrl
		return s.repo.Update(ctx, existing)
	}

	// Create
	return s.repo.Create(ctx, contact)
}

func (s *ContactService) List(ctx context.Context, tenantID uint) ([]Contact, error) {
	return s.repo.ListByTenant(ctx, tenantID)
}

func (s *ContactService) GetByID(ctx context.Context, tenantID uint, id uint) (*Contact, error) {
	return s.repo.GetByID(ctx, id, tenantID)
}

type ContactDTO struct {
	Name          string `json:"name"`
	Number        string `json:"number"`
	Email         string `json:"email"`
	ProfilePicUrl string `json:"profilePicUrl"`
	ExtraInfo     string `json:"extraInfo"`
}

func (s *ContactService) Create(ctx context.Context, tenantID uint, dto ContactDTO) (*Contact, error) {
	if dto.Number == "" {
		return nil, errors.New("número de telefone é obrigatório")
	}

	existing, _ := s.repo.GetByNumber(ctx, dto.Number, tenantID)
	if existing != nil {
		return nil, errors.New("contato com este número já existe")
	}

	contact := &Contact{
		Name:          dto.Name,
		Number:        dto.Number,
		Email:         dto.Email,
		ProfilePicUrl: dto.ProfilePicUrl,
		ExtraInfo:     dto.ExtraInfo,
		TenantID:      tenantID,
	}

	if err := s.repo.Create(ctx, contact); err != nil {
		return nil, err
	}
	return contact, nil
}

func (s *ContactService) Update(ctx context.Context, tenantID uint, id uint, dto ContactDTO) (*Contact, error) {
	contact, err := s.repo.GetByID(ctx, id, tenantID)
	if err != nil {
		return nil, errors.New("contato não encontrado")
	}

	if dto.Name != "" {
		contact.Name = dto.Name
	}
	if dto.Email != "" {
		contact.Email = dto.Email
	}
	if dto.ProfilePicUrl != "" {
		contact.ProfilePicUrl = dto.ProfilePicUrl
	}
	if dto.ExtraInfo != "" {
		contact.ExtraInfo = dto.ExtraInfo
	}

	if err := s.repo.Update(ctx, contact); err != nil {
		return nil, err
	}
	return contact, nil
}

func (s *ContactService) Delete(ctx context.Context, tenantID uint, id uint) error {
	_, err := s.repo.GetByID(ctx, id, tenantID)
	if err != nil {
		return errors.New("contato não encontrado")
	}

	return s.repo.Delete(ctx, id, tenantID)
}
