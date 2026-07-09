# Respostas Rápidas (Fast Replies), Tarefas de Implementação

> Foca em uma sequência de tarefas executáveis para reimplementar a unit a partir do legado, com rastreabilidade ao código original.

## Pré-requisitos
- [ ] Entidades de Tenants e Users.

## Tarefas

- [ ] T-01, Implementar Entidade `QuickMessage`
  - Origem no legado: `backend/src/models/QuickMessage.ts`
  - Critério de pronto: Tabela contendo `shortcode`, `message`, `tenantId` (not null) e `userId` (nullable).
  - Confiança: 🟢

- [ ] T-02, Serviços de Escrita e Validação (Create/Update)
  - Origem no legado: `backend/src/services/QuickMessageService/CreateQuickMessageService.ts`
  - Critério de pronto: O serviço deve bloquear a inserção se o shortcode já existir para as "Globais" ou para o "Usuário X", levantando AppError apropriado.
  - Confiança: 🟢

- [ ] T-03, Serviço Híbrido de Listagem (GET)
  - Origem no legado: `backend/src/services/QuickMessageService/ListQuickMessageService.ts`
  - Critério de pronto: Adicionar condicional `Where` do Sequelize garantindo o filtro de escopo `[Op.or]: [{ userId: loggedUserId }, { userId: null }]`. Paginação padrão.
  - Confiança: 🟢

- [ ] T-04, Exposição e Integração de Sockets
  - Origem no legado: `backend/src/controllers/QuickMessageController.ts`
  - Critério de pronto: Rotas HTTP protegidas. Emissão de evento Socket na atualização/deleção.
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Testar Conflito de Shortcodes: Criar shortcode global "/pix". Depois, tentar criar um shortcode privado do Operador A com o mesmo nome "/pix". O backend deve rejeitar para evitar choque visual na U.I.
- [ ] TT-02, Buscar Respostas Logado como Operador B: Garantir que o payload de resposta não traga mensagens particulares do Operador A.

## Ordem Sugerida
1. T-01: Model.
2. T-02: Garantir que a trava de duplicidade funciona antes de salvar sujeira.
3. T-03: Consulta.
4. T-04: API de saída.

## Lacunas Pendentes (🔴)
Nenhuma lacuna crítica pendente. Implementação isolada e bem mapeada.
