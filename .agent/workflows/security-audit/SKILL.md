---
name: Auditoria de Segurança (Security Audit)
description: Checklist de revisão de segurança para código e infraestrutura do TikTickets-zing
phases: [R, V]
---

# 🛡️ Auditoria de Segurança (Security Audit)

Esta skill guia o processo de revisão para garantir a integridade dos dados e prevenir vulnerabilidades em um ambiente multi-tenant.

## 🔍 Pontos Críticos de Auditoria

### 1. Isolamento de Tenant (CRÍTICO)
- [ ] **Queries Filtradas**: Toda query ao banco deve obrigatoriamente incluir o filtro por `tenantId`.
- [ ] **Tokens JWT**: Validar se o `tenantId` está presente e criptografado no payload do token.
- [ ] **Cross-Tenant Access**: Tentar acessar um recurso de um tenant usando o token de outro durante a revisão.

### 2. Comunicação WhatsApp
- [ ] **Limpeza de Sessão**: Garantir que as credenciais do WhatsApp (.wwebjs_auth) sejam removidas completamente após o desvínculo da conta.
- [ ] **Sanitização de Input**: Validar e limpar qualquer mensagem recebida antes de processar ou exibir no frontend.

### 3. Infraestrutura & APIs
- [ ] **CORS**: Verificar se as origens permitidas estão estritamente configuradas.
- [ ] **Rate Limiting**: Confirmar se as rotas de envio de mensagens e login possuem limites para evitar ataques de força bruta ou spam.
- [ ] **Secrets**: Garantir que nenhuma chave de API ou credencial esteja "hardcoded" (usar sempre `.env`).

## 🛠️ Ferramentas Recomendadas
- `npm audit`: Executar periodicamente para detectar dependências vulneráveis.
- `Snyk` ou `CodeQL`: Para análise estática de segurança.