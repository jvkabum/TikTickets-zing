package queues

import (
	"context"
	"errors"
	"testing"
)

type mockQueueRepo struct {
	queue *Queue
	list  []Queue
	err   error
}

func (m *mockQueueRepo) Create(ctx context.Context, q *Queue) error {
	m.queue = q
	return m.err
}

func (m *mockQueueRepo) GetByID(ctx context.Context, id uint, tenantID uint) (*Queue, error) {
	if m.err != nil {
		return nil, m.err
	}
	if m.queue != nil && m.queue.ID == id {
		return m.queue, nil
	}
	return nil, errors.New("record not found")
}

func (m *mockQueueRepo) List(ctx context.Context, tenantID uint) ([]Queue, error) {
	return m.list, m.err
}

func (m *mockQueueRepo) Update(ctx context.Context, q *Queue) error {
	m.queue = q
	return m.err
}

func (m *mockQueueRepo) Delete(ctx context.Context, id uint, tenantID uint) error {
	return m.err
}

func TestCreateQueue_WithQueueFieldOnly(t *testing.T) {
	repo := &mockQueueRepo{}
	service := NewQueueService(repo)

	q := &Queue{
		Queue:    "Atendimento Geral",
		TenantID: 1,
	}

	err := service.Create(context.Background(), q)
	if err != nil {
		t.Fatalf("esperava sucesso ao criar fila com campo Queue, obteve: %v", err)
	}

	if q.Name != "Atendimento Geral" {
		t.Errorf("esperava Name='Atendimento Geral', obteve '%s'", q.Name)
	}
	if q.Color != "#2576d2" {
		t.Errorf("esperava Color='#2576d2', obteve '%s'", q.Color)
	}
}

func TestCreateQueue_WithNameFieldOnly(t *testing.T) {
	repo := &mockQueueRepo{}
	service := NewQueueService(repo)

	q := &Queue{
		Name:     "Comercial",
		TenantID: 2,
	}

	err := service.Create(context.Background(), q)
	if err != nil {
		t.Fatalf("esperava sucesso ao criar fila com campo Name, obteve: %v", err)
	}

	if q.Queue != "Comercial" {
		t.Errorf("esperava Queue='Comercial', obteve '%s'", q.Queue)
	}
	if q.Color != "#2576d2" {
		t.Errorf("esperava Color='#2576d2', obteve '%s'", q.Color)
	}
}

func TestCreateQueue_MissingNameAndQueue(t *testing.T) {
	repo := &mockQueueRepo{}
	service := NewQueueService(repo)

	q := &Queue{
		TenantID: 1,
	}

	err := service.Create(context.Background(), q)
	if err == nil || err.Error() != "name and tenant_id are required" {
		t.Fatalf("esperava erro 'name and tenant_id are required', obteve: %v", err)
	}
}

func TestCreateQueue_MissingTenantID(t *testing.T) {
	repo := &mockQueueRepo{}
	service := NewQueueService(repo)

	q := &Queue{
		Name: "Suporte",
	}

	err := service.Create(context.Background(), q)
	if err == nil || err.Error() != "name and tenant_id are required" {
		t.Fatalf("esperava erro 'name and tenant_id are required', obteve: %v", err)
	}
}

func TestUpdateQueue_WithQueueField(t *testing.T) {
	existing := &Queue{
		ID:       10,
		Name:     "Antigo",
		Queue:    "Antigo",
		Color:    "#000000",
		TenantID: 1,
		IsActive: true,
	}
	repo := &mockQueueRepo{queue: existing}
	service := NewQueueService(repo)

	updates := &Queue{
		Queue:    "Novo Nome",
		IsActive: false,
	}

	err := service.Update(context.Background(), 10, 1, updates)
	if err != nil {
		t.Fatalf("esperava sucesso no Update, obteve: %v", err)
	}

	if existing.Name != "Novo Nome" || existing.Queue != "Novo Nome" {
		t.Errorf("esperava Name='Novo Nome' e Queue='Novo Nome', obteve Name='%s' Queue='%s'", existing.Name, existing.Queue)
	}
	if existing.IsActive != false {
		t.Errorf("esperava IsActive=false, obteve %v", existing.IsActive)
	}
}
