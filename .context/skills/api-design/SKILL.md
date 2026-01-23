---
type: skill
name: Design de API (API Design)
description: Criação de endpoints RESTful eficientes e seguros para o TikTickets-zing
skillSlug: api-design
phases: [P, R]
generated: 2026-01-23
status: filled
scaffoldVersion: "2.0.0"
---

# 📡 Design de API (API Design)

Esta skill define o padrão para interfaces de comunicação backend/frontend, garantindo consistência e previsibilidade.

## 📐 Padrões de Design

### 1. Endpoints Semânticos
- Usar substantivos no plural para recursos: `/tickets`, `/contacts`, `/users`.
- Seguir os verbos HTTP corretamente:
    - `GET`: Recuperar dados.
    - `POST`: Criar novos recursos ou executar ações complexas.
    - `PUT/PATCH`: Atualizar dados existentes.
    - `DELETE`: Remover recursos.

### 2. Contrato de Resposta
Toda resposta de erro deve seguir um padrão claro:
```json
{
  "error": "NOME_DO_ERRO",
  "message": "Descrição detalhada para humanos",
  "details": {}
}
```

### 3. Filtros e Paginação
- Sempre implementar paginação em listagens longas usando `page` e `limit`.
- Filtragem deve ser feita via Query Parameters (ex: `?status=pending&tenantId=1`).

## 🛡️ Segurança e Multi-tenancy
- [ ] **Middlewares de Autenticação**: Todas as rotas (exceto login/public) devem passar pelo `isAuth`.
- [ ] **Validação de Payload**: Usar bibliotecas de validação no backend antes de processar qualquer dado.
- [ ] **Isolamento**: O `tenantId` deve ser injetado na requisição e usado em todas as queries.

## 📝 Checklist de Revisão de API
- [ ] O endpoint é necessário ou um já existente pode ser estendido?
- [ ] O nome do recurso é intuitivo?
- [ ] Os status codes HTTP estão corretos (200, 201, 400, 401, 404, 500)?
