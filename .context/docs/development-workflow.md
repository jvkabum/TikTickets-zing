# Fluxo de Desenvolvimento (PREVC)

Adotamos o fluxo **PREVC** para garantir que cada mudança seja pensada antes de ser codificada.

## As 5 Fases
1. **[P]lan (Planejamento)**: Criamos um arquivo de plano em `.context/plans/` detalhando o que será feito.
2. **[R]eview (Revisão)**: Validamos a arquitetura do plano e possíveis impactos.
3. **[E]xecute (Execução)**: Codificamos seguindo rigorosamente o plano.
4. **[V]alidate (Validação)**: Testamos se os objetivos foram alcançados.
5. **[C]onfirm (Confirmação)**: Conferimos documentação e fazemos o commit final.

## Estrutura de Pastas
- `backend/`: Código TypeScript do servidor.
- `frontend-vue-3/`: Interface Quasar/Vue 3.
- `.context/`: Gestão de conhecimento da IA.

## Comandos Úteis
- `npm run dev` (Backend/Frontend): Inicia ambiente de desenvolvimento.
- `context.init`: Recarrega o contexto da IA.
