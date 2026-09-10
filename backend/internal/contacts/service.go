package contacts

import (
	"context"
	"encoding/json"
	"errors"
	"regexp"
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

	cleanNumber := regexp.MustCompile(`\D`).ReplaceAllString(contact.Number, "")
	if cleanNumber != "" {
		contact.Number = cleanNumber
	}

	existing, err := s.repo.GetByNumber(ctx, contact.Number, contact.TenantID)
	if err == nil && existing != nil {
		// Atualiza dados
		existing.Name = contact.Name
		if contact.ProfilePicUrl != "" {
			existing.ProfilePicUrl = contact.ProfilePicUrl
		}
		if contact.Pushname != "" {
			existing.Pushname = contact.Pushname
		}
		return s.repo.Update(ctx, existing)
	}

	return s.repo.Create(ctx, contact)
}

func (s *ContactService) List(ctx context.Context, tenantID uint) ([]Contact, error) {
	return s.repo.ListByTenant(ctx, tenantID)
}

func (s *ContactService) GetByID(ctx context.Context, tenantID uint, id uint) (*Contact, error) {
	return s.repo.GetByID(ctx, id, tenantID)
}

type ContactDTO struct {
	Name          string      `json:"name"`
	Number        string      `json:"number"`
	Email         string      `json:"email"`
	ProfilePicUrl string      `json:"profilePicUrl"`
	ExtraInfo     interface{} `json:"extraInfo"`
	Wallets       interface{} `json:"wallets"`
}

func parseExtraInfo(val interface{}) string {
	if val == nil {
		return ""
	}
	switch v := val.(type) {
	case string:
		return v
	default:
		bytes, err := json.Marshal(v)
		if err != nil {
			return ""
		}
		return string(bytes)
	}
}

func (s *ContactService) Create(ctx context.Context, tenantID uint, dto ContactDTO) (*Contact, error) {
	cleanNumber := regexp.MustCompile(`\D`).ReplaceAllString(dto.Number, "")
	if cleanNumber == "" {
		return nil, errors.New("número de telefone é obrigatório")
	}

	existing, _ := s.repo.GetByNumber(ctx, cleanNumber, tenantID)
	if existing != nil {
		return nil, errors.New("contato com este número já existe")
	}

	contact := &Contact{
		Name:          dto.Name,
		Number:        cleanNumber,
		Email:         dto.Email,
		ProfilePicUrl: dto.ProfilePicUrl,
		ExtraInfo:     parseExtraInfo(dto.ExtraInfo),
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
	if dto.Number != "" {
		cleanNumber := regexp.MustCompile(`\D`).ReplaceAllString(dto.Number, "")
		if cleanNumber != "" {
			contact.Number = cleanNumber
		}
	}
	if dto.Email != "" {
		contact.Email = dto.Email
	}
	if dto.ProfilePicUrl != "" {
		contact.ProfilePicUrl = dto.ProfilePicUrl
	}
	if dto.ExtraInfo != nil {
		contact.ExtraInfo = parseExtraInfo(dto.ExtraInfo)
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
