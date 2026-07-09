# Contatos (Contacts), Design Técnico

## Interface

Para endpoints HTTP:

| Método | Caminho | Entrada | Saída | Status codes |
|--------|---------|---------|-------|--------------|
| GET | `/contacts` | `QueryParams (search, page)` | `{ contacts, count, hasMore }` | 200, 401 |
| GET | `/contacts/:contactId` | `contactId` | `Contact (com extraInfo)` | 200, 404, 401 |
| POST | `/contacts` | `ContactCreate { name, number, email, extraInfo: [] }` | `Contact` | 200, 400, 401 |
| PUT | `/contacts/:contactId` | `ContactUpdate` | `Contact` | 200, 400, 404 |
| DELETE | `/contacts/:contactId` | `contactId` | `200 OK` | 200, 404, 401 |

## Fluxo Principal
1. **Criação/Atualização via Bot:** Quando um chat entra (`wwebjs`), o sistema invoca `CheckContactNumber`. Ele higieniza o número (retirando o `@c.us`). Em seguida chama o `CreateOrUpdateContactService`.
2. **Criação Manual (Painel):** Payload entra no `CreateContactService`. O serviço testa se `number` já existe para o `tenantId`.
3. Se existir, levanta um AppError (400).
4. O `Contact` é inserido no banco de dados.
5. Se houver `extraInfo`, o sistema percorre o array, higieniza os dados e insere na tabela dependente `ContactCustomField` associada a este novo `contactId`.
6. Dispara evento Socket `[tenantId]:contact` repassando o objeto recém-criado.

## Fluxos Alternativos
- **Exclusão de Contato com Tickets:** Deletar um contato remove *cascade* os campos customizados, mas e os Tickets? Geralmente o BD do legado usa `SET NULL` na FK de tickets ou proíbe a exclusão (Restrict). A lógica do `DeleteContactService` apenas chama `.destroy()`. Se houver tickets, a integridade do Sequelize dita a regra (assumindo *Restrict* ou *Cascade*).
- **Importação de Lote:** Não abordada como endpoint principal aqui, mas rotinas de planilha (CSV) disparam loops sobre o `CreateContactService`.

## Dependências
- `Socket.io`: Como sempre, orquestrando atualizações reativas no frontend.
- Banco Relacional: Para integridade e buscas ilike (`searchParam`).

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Campos Customizados Normalizados | Existência do Model `ContactCustomField` e não um JSONB | 🟢 |
| Higienização de Números do WhatsApp | Regex e recortes de `@c.us` nas chamadas aos serviços | 🟢 |

## Estado Interno
- **Fotos de Perfil:** `profilePicUrl` é apenas uma string guardando a URL pública da foto de perfil fornecida pelo webhook do WhatsApp. É dinâmica e atualizada sob demanda pelo bot.

## Observabilidade
- Emissão de sockets fragmentados: `[tenantId]:contact` com ações "create", "update" ou "delete".

## Riscos e Lacunas
- 🟡 Qual é a constraint do PostgreSQL para `Tickets` quando um `Contact` é deletado? Se for CASCADE, deletar um contato deletaria o histórico de atendimento inteiro da empresa. Isso deve ser evitado a todo custo (preferível Soft Delete ou Restrict).
