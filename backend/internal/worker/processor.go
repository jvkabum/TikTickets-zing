package worker

import (
	"context"
	"encoding/json"
	"fmt"
	"log"

	"github.com/hibiken/asynq"
	"github.com/tiktickets/backend-go/internal/tasks"
)

type WorkerServer struct {
	server *asynq.Server
	mux    *asynq.ServeMux
}

func NewWorkerServer(redisAddr string) *WorkerServer {
	srv := asynq.NewServer(
		asynq.RedisClientOpt{Addr: redisAddr},
		asynq.Config{
			Concurrency: 10,
			Queues: map[string]int{
				"critical": 6,
				"default":  3,
				"low":      1,
			},
		},
	)

	mux := asynq.NewServeMux()
	return &WorkerServer{
		server: srv,
		mux:    mux,
	}
}

func (s *WorkerServer) RegisterHandlers() {
	s.mux.HandleFunc(tasks.TypeFarewellMessage, s.HandleFarewellMessage)
}

func (s *WorkerServer) Start() error {
	s.RegisterHandlers()
	return s.server.Start(s.mux)
}

func (s *WorkerServer) Stop() {
	s.server.Stop()
}

func (s *WorkerServer) HandleFarewellMessage(ctx context.Context, t *asynq.Task) error {
	var p tasks.FarewellPayload
	if err := json.Unmarshal(t.Payload(), &p); err != nil {
		return fmt.Errorf("json.Unmarshal failed: %v: %w", err, asynq.SkipRetry)
	}

	log.Printf("Processando FarewellMessage para TicketID=%d, TenantID=%d", p.TicketID, p.TenantID)

	// Aqui invocaríamos o repositório para pegar o template e disparar via Whatsmeow
	// (Simulando o envio de mensagem de despedida)

	return nil
}
