# Habilidade: Revisão de Pull Request (PR Review)

Padrão de excelência para revisão de código no TikTickets-zing, focado em manter a integridade do sistema v4 Enterprise.

## Foco da Revisão
- **Multi-Tenancy (Crítico)**: O código permite que um usuário veja dados de outra empresa? Verifique se o `tenantId` está em todas as queries.
- **Performance**: Existem chamadas excessivas ao banco ou loops síncronos pesados?
- **Estética Vue 3**: O novo frontend está usando componentes Quasar corretamente ou está criando CSS ad-hoc (não recomendado)?
- **Resiliência do WhatsApp**: A lógica de reconexão ou limpeza de arquivos foi alterada? Verifique se há risco de erro `EBUSY`.

## Etiquetas de Comentário
- `[PERF]`: Sugestão de otimização.
- `[SEC]`: Risco de segurança detectado.
- `[STYLE]`: Sugestão de melhoria visual ou de código.
- `[BLOCK]`: Erro crítico que impede o merge.

## Melhores Práticas
- Valorize a legibilidade e o uso de TypeScript.
- Rejeite commits que não seguem a convenção `commit-message`.
- Exija testes para rotas ou lógicas de negócio complexas.
