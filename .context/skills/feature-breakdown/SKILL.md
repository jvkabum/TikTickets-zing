# Habilidade: Detalhamento de Funcionalidades (Feature Breakdown)

Processo para transformar requisitos de alto nível em tarefas técnicas implementáveis no TikTickets-zing.

## Fluxo de Trabalho
1. **Identificação de Impacto**: Determinar se a feature afeta o Backend, Frontend Vue 3 (ou ambos) e se exige mudanças no Banco de Dados.
2. **Camadas de Desenvolvimento**:
   - **Banco de Dados**: Criar migration e atualizar os modelos Sequelize.
   - **Backend Core**: Implementar o Service, Controller e definir as Rotas.
   - **Mensageria**: Se envolver WhatsApp, atualizar o `libs/wbot.ts` ou criar novos services em `WbotServices`.
   - **Frontend Vue 3**: Criar o componente Quasar, store Pinia e hooks do Tanstack Query.
3. **Escala de Complexidade**: Usar as sugestões de escala do PREVC (QUICK, SMALL, MEDIUM, LARGE).

## Checklist de Quebra (Breakdown)
- [ ] Existe migration de banco necessária?
- [ ] O novo endpoint segue o padrão de `Design de API`?
- [ ] O componente Vue 3 respeita a regra "Wowed Aesthetics"?
- [ ] Como o Multi-Tenancy (isolamento de dados) será garantido?

## Exemplo de Tarefa
- **Feature**: "Adicionar botão de transcrição de áudio no chat".
- **Backend**: Service para integrar com API de transcrição + Rota para o frontend.
- **Frontend**: Botão no `ChatMessage.vue` + Loading State + Exibição do texto.
- **Segurança**: Validar que apenas o dono do ticket pode transcrever o áudio.
