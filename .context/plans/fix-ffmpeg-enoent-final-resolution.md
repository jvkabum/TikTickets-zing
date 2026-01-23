---
title: Resolução Final FFmpeg e Organização de Git
planSlug: fix-ffmpeg-enoent-final-resolution
generated: 2026-01-23
status: in_progress
progress: 100
agents:
  - type: "backend-specialist"
    role: "Configurar FFmpeg e garantir estabilidade de download de mídias"
  - type: "architect-specialist"
    role: "Unificar histórico de commits e garantir integridade do workflow"
lastUpdated: "2026-01-23T17:27:01.755Z"
---

# 🎯 Plano: Resolução Final FFmpeg e Organização de Git

Este plano detalha a correção definitiva do erro `spawn ffmpeg ENOENT` no ambiente Windows e a limpeza do histórico de commits para manter um repositório profissional.

## 📋 Escopo e Objetivos
- **Correção Técnica**: Eliminar o erro de "FFmpeg não encontrado" no Windows e Linux.
- **Portabilidade**: Usar `ffmpeg-static` para que o binário seja distribuído via npm.
- **Estética do Git**: Remover commits de merge desnecessários e consolidar mudanças lógicas.
- **Workflow**: Aplicar o padrão PREVC (Plan-Review-Execute-Verify-Complete).

## 🗂️ Fases de Implementação

### Fase 1: Padronização do Backend (E)
**Objetivo**: Garantir que o FFmpeg seja carregado de forma consistente em todo o sistema.
- **Passos**:
  1. Instalar `@types/ffmpeg-static` para melhor tipagem (Opcional).
  2. Ajustar `backend/src/app/index.ts` para configuração global do path.
  3. Validar `backend/src/services/WbotServices/helpers/VerifyMediaMessage.ts` para remover caminhos hardcoded do Linux.
- **Agente**: `backend-specialist`
- **Checkpoint**: `fix(backend): configuração global e estática do FFmpeg`

### Fase 2: Consolidação de Histórico (C)
**Objetivo**: Juntar os commits picados e remover o marcador de merge automático.
- **Passos**:
  1. Executar `git reset --soft` até o ponto de estabilidade.
  2. Criar um commit único com descrição sênior detalhando todas as mudanças de estabilização.
  3. Realizar `git push --force` para limpar o histórico no GitHub.
- **Agente**: `architect-specialist`
- **Checkpoint**: `docs(context): estabilização geral v4 e fix de infraestrutura`

### Fase 3: Verificação e Validação (V)
**Objetivo**: Confirmar que o download de áudio/imagem está funcionando no WhatsApp.
- **Passos**:
  1. Reiniciar o backend (`npm run dev`).
  2. Validar o log: Não deve mais aparecer `ERR_WAPP_DOWNLOAD_MEDIA`.
  3. Testar a conversão de um arquivo `.ogg` no chat do WhatsApp.
- **Agente**: `backend-specialist`
- **Checkpoint**: `test(backend): validação de download de mídias com FFmpeg estático`

## 📑 Sucesso e Critérios
- **Build**: `npm run build` no backend deve passar sem erros.
- **Mídia**: Áudios de WhatsApp devem ser processados (convertidos para MP3) sem erros de spawn.
- **Git Log**: O log deve mostrar uma linha de desenvolvimento limpa, sem mensagens de merge de branch 'master' repetitivas.

## 🔄 Plano de Rollback
- Se o `ffmpeg-static` falhar em algum SO, reverter para a configuração de path manuel via `.env`.
- Caso o `git push --force` cause perda de código alheio, restaurar via `git reflog`.

## Execution History

> Last updated: 2026-01-23T17:27:01.755Z | Progress: 100%

### E [DONE]
- Started: 2026-01-23T17:13:47.276Z
- Completed: 2026-01-23T17:27:01.755Z

- [x] Step 1: Step 1 *(2026-01-23T17:27:01.755Z)*
  - Output: backend/src/libs/ffmpegConfig.ts (NOVO), backend/src/services/WbotServices/helpers/VerifyMediaMessage.ts, backend/src/services/InstagramBotServices/InstagramSendMessagesSystem.ts, backend/src/services/MessengerChannelServices/MessengerSendMessagesSystem.ts, backend/src/app/index.ts
  - Notes: Implementado módulo centralizado ffmpegConfig.ts e refatorados todos os 4 arquivos que usavam fluent-ffmpeg.
