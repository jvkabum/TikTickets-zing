package fastreplies

import (
	"context"
	"errors"
	"testing"
)

type mockFastReplyRepo struct {
	reply *FastReply
	list  []FastReply
	err   error
}

func (m *mockFastReplyRepo) Create(ctx context.Context, r *FastReply) error {
	m.reply = r
	return m.err
}

func (m *mockFastReplyRepo) GetByID(ctx context.Context, id uint, tenantID uint) (*FastReply, error) {
	if m.err != nil {
		return nil, m.err
	}
	if m.reply != nil && m.reply.ID == id {
		return m.reply, nil
	}
	return nil, errors.New("record not found")
}

func (m *mockFastReplyRepo) List(ctx context.Context, tenantID uint) ([]FastReply, error) {
	return m.list, m.err
}

func (m *mockFastReplyRepo) Update(ctx context.Context, r *FastReply) error {
	m.reply = r
	return m.err
}

func (m *mockFastReplyRepo) Delete(ctx context.Context, id uint, tenantID uint) error {
	return m.err
}

func TestCreateFastReply_Success(t *testing.T) {
	repo := &mockFastReplyRepo{}
	service := NewFastReplyService(repo)

	reply := &FastReply{
		Key:      "ola",
		Message:  "Olá! Como posso ajudar?",
		TenantID: 1,
	}

	err := service.Create(context.Background(), reply)
	if err != nil {
		t.Fatalf("esperava sucesso, obteve: %v", err)
	}

	if repo.reply.Key != "ola" {
		t.Errorf("esperava Key='ola', obteve '%s'", repo.reply.Key)
	}
}

func TestCreateFastReply_WithDefaultTenantID(t *testing.T) {
	repo := &mockFastReplyRepo{}
	service := NewFastReplyService(repo)

	reply := &FastReply{
		Key:      "cardapio",
		Message:  "Segue o cardápio.",
		TenantID: 0,
	}

	err := service.Create(context.Background(), reply)
	if err != nil {
		t.Fatalf("esperava sucesso, obteve: %v", err)
	}

	if reply.TenantID != 1 {
		t.Errorf("esperava TenantID=1 como default, obteve %d", reply.TenantID)
	}
}

func TestCreateFastReply_EmptyMessage(t *testing.T) {
	repo := &mockFastReplyRepo{}
	service := NewFastReplyService(repo)

	reply := &FastReply{
		Key:      "foto",
		Message:  "",
		TenantID: 1,
	}

	err := service.Create(context.Background(), reply)
	if err != nil {
		t.Fatalf("esperava permitir criação com mensagem vazia (para mídias), obteve erro: %v", err)
	}
}

func TestCreateFastReply_MissingKey(t *testing.T) {
	repo := &mockFastReplyRepo{}
	service := NewFastReplyService(repo)

	reply := &FastReply{
		Key:      "",
		Message:  "Alguma mensagem",
		TenantID: 1,
	}

	err := service.Create(context.Background(), reply)
	if err == nil || err.Error() != "key is required" {
		t.Fatalf("esperava erro 'key is required', obteve: %v", err)
	}
}

func TestUpdateFastReply_Success(t *testing.T) {
	existing := &FastReply{
		ID:       5,
		Key:      "antigo",
		Message:  "Texto antigo",
		TenantID: 1,
	}
	repo := &mockFastReplyRepo{reply: existing}
	service := NewFastReplyService(repo)

	updates := &FastReply{
		Key:     "novo",
		Message: "Texto novo",
	}

	err := service.Update(context.Background(), 5, 1, updates)
	if err != nil {
		t.Fatalf("esperava sucesso no Update, obteve: %v", err)
	}

	if existing.Key != "novo" || existing.Message != "Texto novo" {
		t.Errorf("esperava Key='novo' e Message='Texto novo', obteve Key='%s' Message='%s'", existing.Key, existing.Message)
	}
}
