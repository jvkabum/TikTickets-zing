---
name: Investigação de Erros (Bug Investigation)
description: Metodologia sistemática para identificação e resolução de bugs no TikTickets-zing
phases: [E, V]
---

# 🐛 Investigação de Erros (Bug Investigation)

Esta skill define o processo científico para debugar falhas, especialmente problemas complexos de sincronização e conexão.

## 🧬 Metodologia de Investigação

### 1. Reprodução e Isolamento
- [ ] Conseguimos reproduzir o erro em ambiente de desenvolvimento?
- [ ] O erro é intermitente ou constante?
- [ ] Ocorre apenas em um tenant específico ou em todos?

### 2. Análise de Logs e Estado
- **Backend**: Verificar `logs/error.log` ou stdout para stack traces.
- **WhatsApp**: Analisar eventos do Puppeteer (`authenticated`, `ready`, `auth_failure`).
- **Redis**: Verificar chaves de controle (ex: `manualDisconnect`) via `redis-cli`.
- **Database**: Consultar o estado real das tabelas afetadas.

### 3. Hipótese e Teste
- Formular uma explicação para o erro e testar a solução mais simples primeiro.
- Adicionar logs temporários de depuração (`console.log` com prefixo `[DEBUG-TEMP]`) para rastrear variáveis em tempo real.

## 📝 Checklists de Correção
- [ ] A causa raiz foi identificada (Root Cause)?
- [ ] A correção resolve o sintoma mas também previne a causa original?
- [ ] Foram adicionados testes de regressão para garantir que o bug não volte?

## 🛠️ Ferramentas
- Chrome DevTools (para o Frontend).
- VS Code Debugger (anexar ao processo Node).
- Redis Insights / DBeaver (monitoramento de dados).