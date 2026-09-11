package channels

import (
	"context"
	"log"
	"strings"
	"time"

	"github.com/tiktickets/backend-go/internal/contacts"
	"github.com/tiktickets/backend-go/internal/tickets"
	"go.mau.fi/whatsmeow"
	"go.mau.fi/whatsmeow/types"
	"gorm.io/gorm"
)

// ResolveContactNumber resolve o número de telefone canônico (PN) a partir do JID,
// lidando com conversão de LID (@lid) para número real via whatsmeow store ou whatsmeow_lid_map.
func ResolveContactNumber(client *whatsmeow.Client, db *gorm.DB, jid types.JID) string {
	defer func() {
		if r := recover(); r != nil {
			log.Printf("[LID] Recover em ResolveContactNumber: %v", r)
		}
	}()

	// Se já for JID de telefone padrão (@s.whatsapp.net) ou grupo (@g.us)
	if jid.Server == types.DefaultUserServer || jid.Server == types.GroupServer {
		return jid.User
	}

	// Se for um LID (@lid), tentar encontrar o Phone Number (PN) correspondente
	if jid.Server == types.HiddenUserServer {
		lid := jid.User

		// 1. Tentar resolver via store em memória da whatsmeow (lidmap)
		if client != nil && client.Store != nil {
			altJID, err := client.Store.GetAltJID(context.Background(), jid)
			if err == nil && !altJID.IsEmpty() && altJID.Server == types.DefaultUserServer {
				log.Printf("[LID RESOLVIDO via WhatsMeow Store] LID %s -> PN %s", lid, altJID.User)
				return altJID.User
			}
		}

		// 2. Fallback: consultar diretamente a tabela whatsmeow_lid_map do PostgreSQL
		if db != nil {
			var pn string
			err := db.Raw(`SELECT pn FROM whatsmeow_lid_map WHERE lid = ? OR lid LIKE ? LIMIT 1`,
				lid, lid+"%").Scan(&pn).Error
			if err == nil && pn != "" {
				// Remove sufixo de servidor ou dispositivo se houver
				cleanPN := strings.Split(strings.Split(pn, "@")[0], ":")[0]
				if cleanPN != "" && cleanPN != lid {
					log.Printf("[LID RESOLVIDO via whatsmeow_lid_map] LID %s -> PN %s", lid, cleanPN)
					return cleanPN
				}
			}
		}
	}

	// Fallback padrão: retorna o user original
	return jid.User
}

// NormalizeResolvedPhone limpa caracteres não numéricos e garante que não seja o próprio LID
func NormalizeResolvedPhone(value, lid string) string {
	value = strings.TrimSpace(value)
	if separator := strings.Index(value, "@"); separator >= 0 {
		value = value[:separator]
	}
	value = strings.Split(value, ":")[0]
	if value == "" || value == lid {
		return ""
	}

	var digits strings.Builder
	for _, r := range value {
		if r >= '0' && r <= '9' {
			digits.WriteRune(r)
		}
	}
	res := digits.String()
	if res == lid {
		return ""
	}
	return res
}

// ResolveContactIdentity gerencia a criação, vínculo e unificação de contatos
// resolvendo ambiguidades entre LID (@lid) e Phone Number (@s.whatsapp.net).
func ResolveContactIdentity(
	db *gorm.DB,
	client *whatsmeow.Client,
	jid types.JID,
	defaultName string,
	pushName string,
	isGroup bool,
	tenantID uint,
) (*contacts.Contact, error) {
	now := time.Now()

	// 1. Tratar Grupos
	if isGroup || jid.Server == types.GroupServer {
		var groupContact contacts.Contact
		err := db.Where("number = ? AND tenant_id = ?", jid.User, tenantID).First(&groupContact).Error
		if err != nil {
			groupContact = contacts.Contact{
				Name:      defaultName,
				Number:    jid.User,
				Pushname:  pushName,
				IsGroup:   true,
				TenantID:  tenantID,
				CreatedAt: now,
				UpdatedAt: now,
			}
			if errCreate := db.Create(&groupContact).Error; errCreate != nil {
				return nil, errCreate
			}
		}
		return &groupContact, nil
	}

	// 2. Tratar contatos normais (@s.whatsapp.net)
	if jid.Server != types.HiddenUserServer {
		phone := jid.User
		var contact contacts.Contact
		err := db.Where("number = ? AND tenant_id = ?", phone, tenantID).First(&contact).Error
		if err != nil {
			contact = contacts.Contact{
				Name:      defaultName,
				Number:    phone,
				Pushname:  pushName,
				IsGroup:   false,
				TenantID:  tenantID,
				CreatedAt: now,
				UpdatedAt: now,
			}
			if errCreate := db.Create(&contact).Error; errCreate != nil {
				return nil, errCreate
			}
		} else {
			// Atualiza pushname se aplicável
			if pushName != "" && contact.Pushname != pushName {
				db.Model(&contact).Update("pushname", pushName)
			}
		}
		return &contact, nil
	}

	// 3. Tratar LIDs (@lid)
	lid := jid.User
	resolvedNumber := ResolveContactNumber(client, db, jid)
	phone := NormalizeResolvedPhone(resolvedNumber, lid)

	var lidContact *contacts.Contact
	var foundLid contacts.Contact
	if err := db.Where("lid = ? AND tenant_id = ?", lid, tenantID).First(&foundLid).Error; err == nil {
		lidContact = &foundLid
	}

	// Se não conseguimos resolver o número real para este LID
	if phone == "" {
		if lidContact != nil {
			return lidContact, nil
		}
		// Cria contato provisório por LID sem poluir o campo Number com dígitos do LID
		leadName := defaultName
		if leadName == "" || leadName == lid {
			if pushName != "" {
				leadName = pushName
			} else if len(lid) >= 8 {
				leadName = "Lead " + lid[:8]
			} else {
				leadName = "Lead " + lid
			}
		}
		newContact := contacts.Contact{
			Name:      leadName,
			Number:    "", // Deixa vazio para não poluir
			LID:       lid,
			Pushname:  pushName,
			IsGroup:   false,
			TenantID:  tenantID,
			CreatedAt: now,
			UpdatedAt: now,
		}
		if errCreate := db.Create(&newContact).Error; errCreate != nil {
			return nil, errCreate
		}
		return &newContact, nil
	}

	// Conseguimos resolver o número de telefone real (ex: 5511996700608)
	var phoneContact contacts.Contact
	errPhone := db.Where("number = ? AND tenant_id = ?", phone, tenantID).First(&phoneContact).Error

	if errPhone != nil {
		// Contato por telefone real ainda não existia
		if lidContact != nil {
			// Promove o contato existente de LID para contato com telefone real!
			lidContact.Number = phone
			if lidContact.Name == "" || lidContact.Name == lid || strings.HasPrefix(lidContact.Name, "Lead ") {
				if pushName != "" {
					lidContact.Name = pushName
				} else {
					lidContact.Name = phone
				}
			}
			lidContact.UpdatedAt = now
			_ = db.Save(lidContact)
			return lidContact, nil
		}

		// Cria contato já com Phone e LID vinculados
		newContact := contacts.Contact{
			Name:      defaultName,
			Number:    phone,
			LID:       lid,
			Pushname:  pushName,
			IsGroup:   false,
			TenantID:  tenantID,
			CreatedAt: now,
			UpdatedAt: now,
		}
		if errCreate := db.Create(&newContact).Error; errCreate != nil {
			return nil, errCreate
		}
		return &newContact, nil
	}

	// Contato por telefone real já existe!
	if lidContact != nil && lidContact.ID != phoneContact.ID {
		// Unifica o contato provisório de LID no contato real canônico
		if errMerge := MergeContactIdentity(db, &phoneContact, lidContact, tenantID); errMerge != nil {
			log.Printf("[LID] Erro ao unificar contato LID %d no contato canônico %d: %v",
				lidContact.ID, phoneContact.ID, errMerge)
		} else {
			phoneContact.LID = lid
		}
	} else if phoneContact.LID == "" {
		phoneContact.LID = lid
		db.Model(&phoneContact).Update("lid", lid)
	}

	return &phoneContact, nil
}

// MergeContactIdentity unifica um contato provisório/duplicado no contato canônico real,
// migrando tickets e mensagens para o contato correto e removendo a duplicata.
func MergeContactIdentity(db *gorm.DB, canonical, duplicate *contacts.Contact, tenantID uint) error {
	if db == nil || canonical == nil || duplicate == nil || canonical.ID == duplicate.ID {
		return nil
	}

	return db.Transaction(func(tx *gorm.DB) error {
		// 1. Migrar Tickets do contato duplicado para o canônico
		if err := tx.Model(&tickets.Ticket{}).
			Where("contact_id = ? AND tenant_id = ?", duplicate.ID, tenantID).
			Update("contact_id", canonical.ID).Error; err != nil {
			return err
		}

		// 2. Atualizar metadados no canônico se estiverem vazios
		updates := map[string]interface{}{}
		if canonical.LID == "" && duplicate.LID != "" {
			updates["lid"] = duplicate.LID
		}
		if canonical.ProfilePicUrl == "" && duplicate.ProfilePicUrl != "" {
			updates["profile_pic_url"] = duplicate.ProfilePicUrl
		}
		if canonical.Pushname == "" && duplicate.Pushname != "" {
			updates["pushname"] = duplicate.Pushname
		}
		if len(updates) > 0 {
			if err := tx.Model(&contacts.Contact{}).
				Where("id = ? AND tenant_id = ?", canonical.ID, tenantID).
				Updates(updates).Error; err != nil {
				return err
			}
		}

		// 3. Deletar contato provisório duplicado
		if err := tx.Unscoped().Delete(&contacts.Contact{}, duplicate.ID).Error; err != nil {
			return err
		}

		log.Printf("[LID MERGE] Contato provisório ID %d unificado com sucesso no ID canônico %d (Phone: %s, LID: %s)",
			duplicate.ID, canonical.ID, canonical.Number, canonical.LID)
		return nil
	})
}

// RepairLIDContacts localiza contatos existentes que foram salvos incorretamente com LID
// na coluna number e os unifica com seus números reais via whatsmeow_lid_map.
func RepairLIDContacts(db *gorm.DB, tenantID uint) (int, error) {
	if db == nil {
		return 0, nil
	}

	type LidMapping struct {
		ContactID uint   `gorm:"column:contact_id"`
		OldNumber string `gorm:"column:old_number"`
		RealPN    string `gorm:"column:real_pn"`
	}

	var mappings []LidMapping
	// Busca contatos cujo 'number' é exatamente um LID presente na tabela whatsmeow_lid_map
	err := db.Raw(`
		SELECT c.id AS contact_id, c.number AS old_number, m.pn AS real_pn
		FROM "Contacts" c
		JOIN whatsmeow_lid_map m ON m.lid = c.number OR m.lid LIKE (c.number || '%')
		WHERE c.tenant_id = ? AND c.number != '' AND c.deleted_at IS NULL
	`, tenantID).Scan(&mappings).Error

	if err != nil {
		return 0, err
	}

	repairedCount := 0
	for _, item := range mappings {
		cleanPN := NormalizeResolvedPhone(item.RealPN, item.OldNumber)
		if cleanPN == "" {
			continue
		}

		var canonical contacts.Contact
		errFind := db.Where("number = ? AND tenant_id = ?", cleanPN, tenantID).First(&canonical).Error

		if errFind == nil && canonical.ID != item.ContactID {
			// Já existe o contato com o número real: migrar e excluir o provisório
			var dup contacts.Contact
			if errGetDup := db.First(&dup, item.ContactID).Error; errGetDup == nil {
				if errMerge := MergeContactIdentity(db, &canonical, &dup, tenantID); errMerge == nil {
					repairedCount++
				}
			}
		} else {
			// Não existe outro: apenas atualizar o contato existente com o telefone real e guardar o LID
			updates := map[string]interface{}{
				"number": cleanPN,
				"lid":    item.OldNumber,
			}
			// Se o nome era o LID, substitui pelo número limpo
			var c contacts.Contact
			if db.First(&c, item.ContactID).Error == nil {
				if c.Name == item.OldNumber || c.Name == "" {
					updates["name"] = cleanPN
				}
			}
			if errUp := db.Model(&contacts.Contact{}).Where("id = ?", item.ContactID).Updates(updates).Error; errUp == nil {
				repairedCount++
				log.Printf("[LID REPAIR] Contato %d corrigido: Number %s -> %s (LID: %s)",
					item.ContactID, item.OldNumber, cleanPN, item.OldNumber)
			}
		}
	}

	return repairedCount, nil
}
