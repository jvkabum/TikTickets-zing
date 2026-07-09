# Respostas Rápidas (Fast Replies), Design Técnico

## Interface

Para endpoints HTTP:

| Método | Caminho | Entrada | Saída | Status codes |
|--------|---------|---------|-------|--------------|
| GET | `/quick-messages` | `QueryParams (search, page, userId)` | `{ quickMessages, count, hasMore }` | 200, 401 |
| GET | `/quick-messages/:id` | `id` | `QuickMessage` | 200, 404, 401 |
| POST | `/quick-messages` | `{ shortcode, message, userId? }` | `QuickMessage` | 201, 400, 401 |
| PUT | `/quick-messages/:id` | `{ shortcode, message, userId? }` | `QuickMessage` | 200, 400, 404 |
| DELETE | `/quick-messages/:id` | `id` | `200 OK` | 200, 404, 401 |

## Fluxo Principal
1. **Listagem com Contexto:** Na rota `GET`, o Controller intercepta o `userId` logado. A query no banco usa operadores Lógicos (OR) do Sequelize para buscar: `tenantId === currentTenant AND (userId IS NULL OR userId === currentUser)`.
2. **Uso no Inbox:** A API REST apenas cadastra e lista. O evento de "digitar o atalho" e "expandir o texto" é feito inteiramente Client-side no navegador (UI do Chat).

## Fluxos Alternativos
- **Media Support:** O legado às vezes permite atrelar `mediaPath` à Resposta Rápida (para enviar o PDF do cardápio num atalho `/cardapio`). Se implementado, requer upload via Multer na rota `POST`.

## Dependências
- Banco Relacional (Sequelize)
- Frontend Javascript para interpretação em tempo real.

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Centralização de Regras no BD | Validação Unique e Escopos no Sequelize. | 🟢 |

## Estado Interno
- Sem estados complexos, comporta-se apenas como um cadastro estático (Dicionário).

## Observabilidade
- Emissão padrão `[tenantId]:quickmessage` para Sockets.

## Riscos e Lacunas
- 🔴 É necessário conferir se a constraint Unique do Banco cobre a combinação composta `(tenantId, userId, shortcode)` para não gerar erros falsos quando um usuário tenta criar o mesmo atalho que outro já criou privadamente.
