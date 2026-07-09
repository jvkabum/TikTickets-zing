# Configurações (Settings)

> Template do arquivo `requirements.md`. Foca no QUE a unit faz, não no como.

## Visão Geral
Gerencia os Key-Value pairs globais de cada empresa. Responsável por abrigar regras paramétricas e configurações vitais (ex: fechar ticket automático após inatividade).

## Responsabilidades
- Criar e listar propriedades em formato Dicionário.
- Manter o painel React/Vue do frontend sincronizado via Real-Time WebSockets assim que um parâmetro for alterado.
- Hospedar a regra de "Fechamento de Tickets Zumbis" (`daysToClose`).

## Regras de Negócio
- Modificações alteram a interface de todos os operadores da empresa em tempo real sem F5 🟢
- **ALERTA DE SEGURANÇA/DOMÍNIO**: A propriedade `daysToClose` sofre de vazamento global onde os tickets do Tenant B podem ser fechados pelas configurações do Tenant A 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Key Value Editor | Must | Editar `value` informando a `key`. |
| RF-02 | Eventos Bidirecionais | Must | Mudanças nos Settings pingam Sockets. |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `backend/src/controllers/SettingController.ts` | Painel de controle base | 🟢 |
| `backend/src/services/TicketServices/ConfiguraFechamentoTicketService.ts` | Regra anômala de fechamento por Settings | 🟢 |
