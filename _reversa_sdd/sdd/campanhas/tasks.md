# Campanhas (Campaigns), Tarefas de Implementação

> Foca em uma sequência de tarefas executáveis para reimplementar a unit a partir do legado, com rastreabilidade ao código original.

## Pré-requisitos
- [ ] Redis e pacote BullMQ instalados.
- [ ] Entidades `Contact` operando para popular as listas.

## Tarefas

- [ ] T-01, Estrutura de Listas e Configurações
  - Origem no legado: `backend/src/models/ContactList.ts`, `CampaignSetting.ts`
  - Critério de pronto: Tabelas/CRUD para agrupar contatos estáticos ou dinâmicos que serão o público alvo.
  - Confiança: 🟢

- [ ] T-02, Implementar Entidades Base da Campanha
  - Origem no legado: `backend/src/models/Campaign.ts`, `CampaignShipping.ts`
  - Critério de pronto: Tabela criada com status Enum, colunas de Spintax (`message1,2,3`), mediaPath e controle de data. Tabela associativa Shipping criada para guardar log de sucesso/falha individual.
  - Confiança: 🟢

- [ ] T-03, Upload de Mídia via Express
  - Origem no legado: Rotas de campanha.
  - Critério de pronto: Middleware configurado (Multer) para aceitar arquivos estáticos e guardar URL referenciada no disco.
  - Confiança: 🟢

- [ ] T-04, Background Worker e Job Scheduling
  - Origem no legado: Configurações do `lib/bull.ts` e services.
  - Critério de pronto: Rota `/start` deve calcular os MS até `scheduledAt` e criar job atrasado. O Worker deve varrer a ContactList e despachar chamadas de API simulando disparo.
  - Confiança: 🟢

- [ ] T-05, Helper de Rotação de Spintax
  - Origem no legado: Utilizado internamente no envio.
  - Critério de pronto: Função pura que recebe as 3 mensagens da Campanha e sorteia uma com balanceamento (pseudo-randômico) na hora de formatar a variável {name}.
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Submeter uma campanha vazia. O validador não deve agendar job se a `ContactList` associada tiver 0 membros.
- [ ] TT-02, Forçar expiração de Job do Redis via Mock e garantir que a Campanha atualize o status para "CANCELADA/FALHA" ao invés de presa "EM_ANDAMENTO".

## Ordem Sugerida
1. T-01: Listas são pré-requisito funcional.
2. T-02: Dados e Migrations centrais.
3. T-03: Roteamento REST e upload.
4. T-04: (Crítica) Implementação dos Workers em Redis. Exigirá testes unitários focados.

## Lacunas Pendentes (🔴)
- 🟡 Caso o volume seja monstruoso (Ex: 100 mil contatos na lista), o T-04 pode estourar memória se não trabalhar em *batches* (paginação no banco durante a varredura). Refatoração recomendada durante a modernização.
