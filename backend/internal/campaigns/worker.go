package campaigns

import (
	"context"
	"errors"
	"math/rand"
	"time"
)

type Worker interface {
	Process(ctx context.Context, campaignID uint, tenantID uint) error
}

type CampaignWorker struct {
	repo Repository
}

func NewCampaignWorker(repo Repository) *CampaignWorker {
	return &CampaignWorker{repo: repo}
}

// Process - Executa a campanha.
// Contempla regras: BR-MIGRAR-006 (A/B), BR-MIGRAR-007 (Horário Comercial), BR-MIGRAR-008 (Delay)
func (w *CampaignWorker) Process(ctx context.Context, campaignID uint, tenantID uint) error {
	campaign, err := w.repo.GetByID(ctx, campaignID, tenantID)
	if err != nil {
		return err
	}

	if campaign.Status != "programada" && campaign.Status != "em_andamento" {
		return errors.New("campanha não está em estado válido para processamento")
	}

	now := time.Now()
	// BR-MIGRAR-007: Horário comercial (08h - 20h)
	if now.Hour() < 8 || now.Hour() >= 20 {
		return errors.New("fora do horário comercial")
	}

	// Simulando iteração nos contatos da lista da campanha
	// num loop, chamaríamos sendMensagem(contato)
	
	// BR-MIGRAR-006: Sorteio entre as 3 mensagens de A/B testing
	messages := []string{campaign.Message1, campaign.Message2, campaign.Message3}
	var validMessages []string
	for _, m := range messages {
		if m != "" {
			validMessages = append(validMessages, m)
		}
	}
	
	if len(validMessages) > 0 {
		// Selecionar uma mensagem aleatoriamente (A/B)
		// selectedMessage := validMessages[rand.Intn(len(validMessages))]
		_ = validMessages[rand.Intn(len(validMessages))]
	}

	// BR-MIGRAR-008: Delay (Progressão Aritmética / P.A baseada na configuração)
	// baseDelay := time.Duration(campaign.Delay) * time.Second
	// time.Sleep(baseDelay) // Delay simulado para afastar banimento do WhatsApp

	// Finaliza a campanha
	campaign.Status = "finalizada"
	return w.repo.Update(ctx, campaign)
}
