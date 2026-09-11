package channels

import (
	"context"
	"encoding/base64"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"

	"github.com/tiktickets/backend-go/internal/contacts"
	"github.com/tiktickets/backend-go/internal/tickets"
	"go.mau.fi/whatsmeow"
	"go.mau.fi/whatsmeow/types"
	"gorm.io/gorm"
)

// DownloadImageAsBase64 faz o download de uma imagem de uma URL e retorna em formato base64 Data URI
func DownloadImageAsBase64(url string) (string, error) {
	client := http.Client{
		Timeout: 15 * time.Second,
	}

	resp, err := client.Get(url)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("bad status: %s", resp.Status)
	}

	bytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	contentType := resp.Header.Get("Content-Type")
	if contentType == "" {
		contentType = "image/jpeg"
	}

	base64Str := base64.StdEncoding.EncodeToString(bytes)
	return fmt.Sprintf("data:%s;base64,%s", contentType, base64Str), nil
}

// FetchAndSaveProfilePic busca a foto de perfil no WhatsApp, converte para base64 ou URL e salva no contato
func FetchAndSaveProfilePic(
	client *whatsmeow.Client,
	db *gorm.DB,
	wsHub *WsHub,
	contactID uint,
	jid types.JID,
	tenantID uint,
) {
	if client == nil || db == nil || contactID == 0 {
		return
	}

	go func() {
		defer func() {
			if r := recover(); r != nil {
				log.Printf("[ProfilePic] Recuperado de pânico ao buscar foto para contato %d: %v", contactID, r)
			}
		}()

		ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
		defer cancel()

		picInfo, err := client.GetProfilePictureInfo(ctx, jid.ToNonAD(), &whatsmeow.GetProfilePictureParams{
			Preview: false,
		})
		if err != nil || picInfo == nil || picInfo.URL == "" {
			return
		}

		finalPic := picInfo.URL
		// Tenta baixar como base64 data URI para evitar bloqueios de CORS / expiração de CDN do WhatsApp
		base64Img, bErr := DownloadImageAsBase64(picInfo.URL)
		if bErr == nil && base64Img != "" {
			finalPic = base64Img
		}

		// Atualiza no banco
		if errUpdate := db.Model(&contacts.Contact{}).
			Where("id = ? AND tenant_id = ?", contactID, tenantID).
			Update("profile_pic_url", finalPic).Error; errUpdate != nil {
			log.Printf("[ProfilePic] Erro ao salvar profile_pic_url para contato %d: %v", contactID, errUpdate)
			return
		}

		log.Printf("[ProfilePic] Foto de perfil salva com sucesso para o contato %d (JID: %s)", contactID, jid.String())

		// Emite atualização no WebSocket para o frontend
		if wsHub != nil {
			var updatedContact contacts.Contact
			_ = db.First(&updatedContact, contactID)

			// Atualiza ticketFocado e lista de tickets
			var relatedTickets []tickets.Ticket
			db.Where("contact_id = ? AND tenant_id = ?", contactID, tenantID).Find(&relatedTickets)
			for _, t := range relatedTickets {
				t.Contact = &updatedContact
				wsHub.Broadcast(fmt.Sprintf("%d:ticketList", tenantID), map[string]interface{}{
					"type":    "ticket:update",
					"payload": t,
				})
			}
		}
	}()
}
