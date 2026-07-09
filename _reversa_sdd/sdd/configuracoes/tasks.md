# Configurações (Settings), Tarefas de Implementação

> Foca em uma sequência de tarefas executáveis para reimplementar a unit a partir do legado, com rastreabilidade ao código original.

## Pré-requisitos
- [ ] Entidade `Tenant` operando.
- [ ] Identificação da camada de Cache a ser usada (Ex: Redis ou Maps in-memory) para alta performance.

## Tarefas

- [ ] T-01, Implementar Entidade `Setting`
  - Origem no legado: `backend/src/models/Setting.ts`
  - Critério de pronto: Tabela criada com `key` e `value`. Índice composto obrigatório e Unique para `(tenantId, key)` assegurando a impossibilidade de duplicação por cliente.
  - Confiança: 🟢

- [ ] T-02, Serviços Base de Update/Read
  - Origem no legado: `backend/src/services/SettingServices/...`
  - Critério de pronto: Serviços expostos recebendo sempre o `tenantId`. Proteção interna assegurando que Update de configurações vitais (ex: userCreation) logue quem alterou.
  - Confiança: 🟢

- [ ] T-03, Refatorar Helpers de Configuração com Cache
  - Origem no legado: Diversos controllers e Listeners lendo no disco/DB de forma repetitiva.
  - Critério de pronto: Criar uma classe utilitária "SettingsProvider" que armazena as chaves de um tenant em memória/Redis e apenas as invalida quando houver um UPDATE.
  - Confiança: 🟢

- [ ] T-04, Exposição da API (Controllers)
  - Origem no legado: `backend/src/controllers/SettingController.ts`
  - Critério de pronto: Endpoints HTTP para GET e PUT funcionando. Rotas bloqueadas apenas para nível Admin (Operador base não deveria manipular painel global, a menos que as regras do PO determinem).
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Garantia Multi-tenant: Tentar atualizar a `key` "chatBotType" sem enviar `tenantId` na autorização/banco deve falhar, prevenindo contaminação cruzada acidental de clientes distintos.
- [ ] TT-02, Verificar velocidade e consumo do Helper de Cache: Fazer 1.000 requisições simuladas e garantir que apenas 1 query real chegou ao PostgreSQL.

## Ordem Sugerida
1. T-01: Migrations (Muito fácil).
2. T-03: Implementar o Cache de cara antes que outras *Units* comecem a chamar os Settings de forma burra no banco.
3. T-02: Serviços de BD integrados ao invalidamento de Cache.
4. T-04: API.

## Lacunas Pendentes (🔴)
Nenhuma lacuna crítica pendente. Foco apenas no isolamento de Tenant.
