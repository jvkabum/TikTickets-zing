# Autenticação, Tarefas de Implementação

> Template do arquivo `tasks.md`. Foca em uma sequência de tarefas executáveis para reimplementar a unit a partir do legado, com rastreabilidade ao código original.

## Pré-requisitos
- [ ] Entidades `User` e `Tenant` devidamente criadas no banco.
- [ ] Servidor de WebSocket rodando e acoplado à aplicação.
- [ ] Variáveis de ambiente configuradas para o segredo do JWT e tempos de expiração.

## Tarefas

> Cada tarefa referencia o arquivo do legado de onde o comportamento foi extraído.

- [ ] T-01, Implementar Hash de Senhas no Model de Usuário
  - Origem no legado: `backend/src/models/User.ts` (Hooks BeforeCreate/BeforeUpdate)
  - Critério de pronto: A senha deve ser sempre armazenada de forma encriptada (Bcrypt) e a comparação de senhas do controller funcionar.
  - Confiança: 🟢

- [ ] T-02, Endpoint de Login
  - Origem no legado: `backend/src/controllers/SessionController.ts` (store)
  - Critério de pronto: A API deve receber email/senha, validar o status `active` do Tenant, gerar e retornar Access e Refresh Tokens. Em caso de senha incorreta ou tenant bloqueado, retornar 401.
  - Confiança: 🟢

- [ ] T-03, Notificação de Presença Online (WebSocket)
  - Origem no legado: `backend/src/controllers/SessionController.ts`
  - Critério de pronto: Ao efetuar login ou logout, a API deve disparar um evento na sala `[tenantId]:users` com a carga de `isOnline = true/false` para o Frontend.
  - Confiança: 🟢

- [ ] T-04, Endpoint de Renovação de Sessão (Refresh)
  - Origem no legado: `backend/src/controllers/SessionController.ts` (update)
  - Critério de pronto: A API deve ler o cookie HTTP-only `jrt`, validar o token JWT de refresh contra a DB e gerar um novo Access Token.
  - Confiança: 🟢

- [ ] T-05, Endpoint de Logout
  - Origem no legado: `backend/src/controllers/SessionController.ts` (logout)
  - Critério de pronto: O endpoint deve atualizar no usuário os campos `isOnline = false` e a data de `lastLogout`, revogando sua sessão no Front.
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Teste do happy path do fluxo principal de Login e retorno de JWT.
- [ ] TT-02, Teste do caso de erro ao tentar logar com credenciais inválidas.
- [ ] TT-03, Teste do caso de erro ao tentar logar em um Tenant inativo.
- [ ] TT-04, Teste da emissão correta do evento de WebSocket para a sala do Tenant específico.

## Tarefas de Migração de Dados (se aplicável)

- Não há tarefas de migração de dados pendentes associadas diretamente às lógicas de sessão (SessionController). A migração envolverá apenas a tabela `Users`.

## Ordem Sugerida
1. T-01, para garantir que não será possível persistir novos usuários com senhas em plain-text.
2. T-02 e T-04, para viabilizar as chamadas de API autenticadas do sistema inteiro.
3. T-05 e T-03, para fechar o controle de sessão e o status presencial dos operadores.

## Lacunas Pendentes (🔴)
- Avaliar se será necessária alguma rotina de revogação passiva para quando o token estiver comprometido e a sessão tiver que ser forçada a expirar pelo Admin.
