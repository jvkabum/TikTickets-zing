# Habilidade: Design de API (API Design)

Padrões de criação e manutenção de endpoints REST para o TikTickets-zing.

## Princípios de Design
- **RESTful**: Usar métodos HTTP (`GET`, `POST`, `PUT`, `DELETE`) de forma semântica.
- **Versioning**: Embora não seja explícito, manter compatibilidade com o frontend atual.
- **JSON**: Padronizar respostas sempre em formato JSON.

## Estrutura de Resposta
- **Sucesso**: Status 200/201 com os dados no corpo.
- **Erro**: Status 4xx/5xx com objeto `{ error: "Mensagem amigável" }`.

## Segurança
- **Middleware de Autenticação**: Todos os endpoints protegidos devem usar o middleware `isAuth`.
- **Tenant Scope**: O `tenantId` deve ser extraído do token JWT e nunca passado via query string pelo frontend (segurança).

## Exemplos de Endpoints
- `POST /whatsapp`: Inicializa uma nova sessão.
- `GET /tickets`: Lista tickets do tenant logado.
- `PUT /tickets/:id`: Atualiza status de um ticket.
