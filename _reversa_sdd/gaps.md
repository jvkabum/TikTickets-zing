# Lacunas Residuais e Gaps

Este documento consolida as lacunas (🔴) e riscos arquiteturais identificados pelo Time de Descoberta que **não** eram perguntas de negócio, mas sim pontos de fragilidade ou avisos técnicos que devem ser tratados com cautela durante a migração.

## Gaps e Avisos Críticos

### 1. Chatflow (Schema JSON Frágil)
- **Severidade:** Crítico / Alto
- **Contexto:** O schema JSON interno (`nodeList`, `lineList`) do construtor de fluxos e como o Frontend o gerencia demandam cautela pesada. Qualquer alteração não retrocompatível neste layout destrói o bot dos clientes.
- **Ação Recomendada:** O novo sistema deve manter estrita compatibilidade com esse schema ou rodar uma migração de dados perfeita na base legada.

### 2. Canais (Cache Stateful)
- **Severidade:** Crítico / Alto
- **Contexto:** O legado é estritamente *stateful*. Se a API quebrar ou reiniciar, as pastas de cache das sessões do WhatsApp devem estar num volume persistente. Caso contrário, todas as conexões cairão e exigirão leitura manual de QR Code novamente.
- **Ação Recomendada:** Garantir persistência de volume para sessões (ex: mapeamento correto no Docker/Kubernetes) no novo ambiente.

> **Nota:** Todas as dúvidas de negócio listadas em `questions.md` já foram respondidas pelo usuário e estão resolvidas para o handoff de migração.
