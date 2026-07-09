# Contatos (Contacts), Tarefas de Implementação

> Foca em uma sequência de tarefas executáveis para reimplementar a unit a partir do legado, com rastreabilidade ao código original.

## Pré-requisitos
- [ ] Entidades `Tenant` ativas.
- [ ] Configuração de BD apta para foreign keys.

## Tarefas

- [ ] T-01, Implementar Models `Contact` e `ContactCustomField`
  - Origem no legado: `backend/src/models/Contact.ts`, `backend/src/models/ContactCustomField.ts`
  - Critério de pronto: Tabelas geradas. Coluna `number` combinada com `tenantId` num índice unique no banco. Relacionamento One-to-Many entre Contato e CustomFields.
  - Confiança: 🟢

- [ ] T-02, Serviço de Verificação Rápida (`CheckContactNumber`)
  - Origem no legado: Listeners de WhatsApp/WWebJS
  - Critério de pronto: Função utilitária que dado um número e tenant, busca rápido (find) se o contato já existe para evitar queries complexas no meio de uma enxurrada de webhooks.
  - Confiança: 🟢

- [ ] T-03, Serviço de Criação com Aninhamento (`CreateContactService`)
  - Origem no legado: `backend/src/services/ContactServices/CreateContactService.ts`
  - Critério de pronto: Recebe payload. Lança erro de duplicate. Grava Master Record. Em seguida, mapeia e insere os `extraInfo` (Custom Fields) associados no banco de dados.
  - Confiança: 🟢

- [ ] T-04, Serviço de Atualização (`UpdateContactService`)
  - Origem no legado: `backend/src/services/ContactServices/UpdateContactService.ts`
  - Critério de pronto: Atualiza dados base. Para `extraInfo`, remove os custom fields antigos ou realiza UPSERT massivo garantindo estado limpo das variáveis.
  - Confiança: 🟢

- [ ] T-05, Exposição REST e Paginação
  - Origem no legado: `backend/src/controllers/ContactController.ts` e `ListContactsService`
  - Critério de pronto: Implementar as rotas GET (com busca ILIKE no nome e numero e com paginação via LIMIT/OFFSET), POST, PUT e DELETE. Emitir eventos WebSocket.
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Testar constraint Unique: Criar Contato "A" (55119999). Mudar de Tenant, criar Contato "B" (55119999). Ambos devem criar com sucesso. Voltar para o Tenant 1 e tentar criar Contato "C" (55119999): deve falhar e retornar AppError.
- [ ] TT-02, Enviar payload de PUT em um contato já com 3 `extraInfo`, enviando array com 1 campo novo e 1 campo editado. O resultado no BD deve ter exatos 2 campos customizados para esse Contato, limpando o terceiro descartado.

## Ordem Sugerida
1. T-01: Migrations e Relacionamentos são premissas.
2. T-03 e T-04: Os serviços de escrita são complexos por conta da inserção múltipla do `extraInfo`.
3. T-05: Expor na API as interfaces desenvolvidas.
4. T-02: Pode ficar para a Unit de integração com WWebJS.

## Lacunas Pendentes (🔴)
- 🔴 Decidir comportamento da FK `contactId` em `Tickets` ao tentar deletar via `DELETE /contacts/:id`. Sugerimos forçar erro caso existam atendimentos passados para manter auditoria inviolável.
