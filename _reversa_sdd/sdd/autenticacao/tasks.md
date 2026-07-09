# Autenticação (Auth), Tarefas de Implementação

> Foca em uma sequência de tarefas executáveis para reimplementar a unit a partir do legado, com rastreabilidade ao código original.

## Pré-requisitos
- [ ] Conexão com banco de dados PostgreSQL (Sequelize)
- [ ] Integração com framework de filas/sockets (Socket.io) para emissão de eventos.
- [ ] Chaves de criptografia e validação (JWT Secret) configuradas.

## Tarefas

- [ ] T-01, Implementar `SessionController.store` para Login
  - Origem no legado: `backend/src/controllers/SessionController.ts`
  - Critério de pronto: Endpoint `POST /login` validando e-mail/senha, emitindo JWT, criando Refresh Token e gravando cookie `jrt`.
  - Confiança: 🟢

- [ ] T-02, Implementar validação de Tenant e Bcrypt
  - Origem no legado: `backend/src/models/User.ts` (Hooks de hash) e Lógica do Login
  - Critério de pronto: Login negado (401) se a empresa do usuário não estiver com status `active` ou se o Bcrypt hash for incompatível.
  - Confiança: 🟢

- [ ] T-03, Implementar `SessionController.update` para Refresh Token
  - Origem no legado: `backend/src/controllers/SessionController.ts`
  - Critério de pronto: Endpoint `POST /refresh_links` lendo o cookie `jrt`, validando versão do token e devolvendo novo JWT válido.
  - Confiança: 🟢

- [ ] T-04, Implementar `SessionController.logout` para Encerrar Sessão
  - Origem no legado: `backend/src/controllers/SessionController.ts`
  - Critério de pronto: Endpoint `DELETE /logout` mudando `isOnline` para false, limpando cookie `jrt` e atualizando timestamp `lastLogout`.
  - Confiança: 🟢

- [ ] T-05, Integração de Presença Real-time
  - Origem no legado: `backend/src/services/UserServices/...` e controladores
  - Critério de pronto: Transições de Login/Logout emitem Socket.io push para canal `[tenantId]:users`.
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Testar fluxo de sucesso de Login e geração de Cookie seguro.
- [ ] TT-02, Testar tentativa de login com Tenant suspenso (Erro esperado: 401).
- [ ] TT-03, Testar renovação usando refresh token correto vs expirado/inválido.

## Ordem Sugerida
1. T-02: Garantir segurança de hash na persistência de usuário (Model base).
2. T-01: Login, sendo pré-requisito para as demais sessões (Controller).
3. T-03: Renovação via Refresh.
4. T-04 e T-05: Encerramento de ciclo e WebSockets.

## Lacunas Pendentes (🔴)
Nenhuma lacuna crítica detectada que impeça o início da reimplementação deste módulo.
