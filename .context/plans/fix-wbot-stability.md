---
type: plan
name: Correção de Estabilidade Wbot
description: Plano para resolver TypeErrors na inicialização do WhatsApp e melhorar o Watchdog
planSlug: fix-wbot-stability
phase: E
status: in_progress
generated: 2026-01-23
---

# Plano: Correção de TypeError e Estabilidade Wbot v2

## Problema
O sistema apresenta erros ocasionais de `TypeError: Cannot read properties of undefined (reading 'number')` ou `(reading '_serialized')` ao tentar acessar propriedades de `wbot.info` durante o processo de inicialização ou reconexão. Isso ocorre porque o objeto `info` nem sempre está totalmente populado no momento em que o evento `authenticated` ou o `Watchdog` é disparado.

## Objetivos
1. Impedir quedas do processo por acesso a propriedades nulas.
2. Garantir que a inicialização do WhatsApp (`handleReady`) seja resiliente a dados incompletos.
3. Melhorar a verificação de conexão real para ser 100% segura.

## Passos de Implementação

### 1. Refatoração de `verifyRealConnection` em `backend/src/libs/wbot.ts`
- Alterar todos os acessos a `wbot.info` para usar optional chaining (`wbot?.info?.wid?._serialized`).
- Adicionar logs informativos quando os dados essenciais (`wid`) ainda não estiverem disponíveis, em vez de falhar silenciosamente ou quebrar.

### 2. Proteção em `handleReady`
- Garantir que a atualização do banco de dados (colunas `number` e `phone`) use valores padrão (null/empty string) se o `wbot.info` estiver ausente.
- Adicionar uma verificação: se `wid` não estiver disponível, tentar buscar via `wbot.getWWebVersion()` ou outros metadados antes de desistir.

### 3. Sincronização com `wbotMonitor.ts`
- Garantir que o monitor também use as verificações seguras de conexão.

## Verificação
- [x] Reiniciar o backend e simular uma conexão lenta de rede.
- [x] Verificar se o Watchdog recupera a sessão sem disparar `TypeError`.
- [x] Validar logs para confirmar se a "Falsa Conexão" está sendo detectada corretamente sem quebras.

## Decisões Técnicas
- **Optional Chaining Everywhere**: Adotar o uso estrito de `?.` em qualquer interação com objetos providos por bibliotecas externas (wwebjs/puppeteer).
- **Log de Diagnóstico**: Incluir o estado do objeto `info` no log de erro para facilitar depuração futura.
