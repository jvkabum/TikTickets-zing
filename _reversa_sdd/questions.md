# Lacunas de Engenharia Reversa (Questions)

Por favor, responda as questões abaixo preenchendo o campo **Resposta** para cada item. Quando terminar, avise-me enviando a mensagem `/reversa`.

## Q1. Múltiplos Logins
- **Unit**: `autenticacao`
- **Contexto**: O código extraído não menciona limitação de concorrência de sessão ou invalidação por device.
- **Pergunta**: É permitido que um usuário faça múltiplos logins na mesma conta simultaneamente em dispositivos diferentes?
- **Resposta**: (e possivel)

## Q2. Duração do JWT
- **Unit**: `autenticacao`
- **Contexto**: O tempo de vida dos tokens depende do ambiente e as políticas de segurança.
- **Pergunta**: Qual deve ser a duração de expiração exata do Access Token e do Refresh Token?
- **Resposta**: (24 horas)

## Q3. Fallback de Criação de Contatos
- **Unit**: `contatos`
- **Contexto**: Atualmente, a criação de contato depende do WhatsApp ativo para validação. Se o provedor Meta cair ou não houver conexão, a operação fica bloqueada.
- **Pergunta**: Devemos permitir um fallback (bypass de verificação) para criar contatos mesmo se o WhatsApp estiver desconectado?
- **Resposta**: (manter como esta)

## Q4. Exclusão de Empresa (Tenant)
- **Unit**: `empresas / tenants`
- **Contexto**: Não está claro no código se `deleteTenant` deve implementar um *Soft Delete* (arquiva os dados) ou *Hard Delete* (apaga definitivamente do banco).
- **Pergunta**: A exclusão de um Tenant deve ser lógica (soft) ou física (hard)?
- **Resposta**: (manter como esta)

## Q5. Cálculo de Estatísticas de Tempo
- **Unit**: `estatisticas`
- **Contexto**: O fuso-horário (UTC vs America/Sao_Paulo) tem causado falhas nas estatísticas (TME/TMA) dependendo de onde o cálculo ocorre.
- **Pergunta**: Devemos forçar um Timezone explícito na querystring e usar operações de banco (ex: `EXTRACT(EPOCH)`) para garantir cálculos precisos de TMA e TME?
- **Resposta**: (faça)

## Q6. Exclusão de Filas vs Atendimentos
- **Unit**: `filas`
- **Contexto**: Há uma lacuna sobre a constraint na exclusão da Fila em relação aos Atendimentos (`Tickets`) em andamento.
- **Pergunta**: Se uma fila for excluída, o que deve acontecer com os atendimentos que estão nela? O sistema impede a exclusão (Restrict) ou remove a fila do atendimento (Set Null)?
- **Resposta**: (passa para outra fila do tenent)

## Q7. Atalhos de Respostas Rápidas
- **Unit**: `respostas-rapidas`
- **Contexto**: É necessário conferir se a constraint Unique do Banco cobre a combinação `(tenantId, userId, shortcode)`.
- **Pergunta**: Os atalhos (`shortcode`) das respostas rápidas podem ser iguais para usuários diferentes na mesma empresa, ou devem ser globais (únicos) para a empresa toda?
- **Resposta**: (manter como esta)

## Q8. Concorrência no Aceite de Tickets
- **Unit**: `tickets`
- **Contexto**: Não identificamos um *Pessimistic Lock* na leitura caso dois atendentes tentem aceitar o mesmo Ticket no exato mesmo momento.
- **Pergunta**: Como deve funcionar o lock de concorrência se dois atendentes clicarem em "Aceitar" no mesmo instante? O primeiro leva e o segundo recebe erro?
- **Resposta**: (para quem tem menos atendimento em andamento)

## Q9. Configurações Públicas do Tenant
- **Unit**: `configuracoes`
- **Contexto**: O bypass do Tenant (usar `Settings` sem checar `tenantId`) expõe configurações vitais em ambiente Multi-tenant.
- **Pergunta**: Podemos refatorar a assinatura de todos os serviços que buscam `Settings` para exigir o `tenantId` obrigatoriamente (fechando o bypass)?
- **Resposta**: (faça a correçao)
