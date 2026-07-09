# Configurações (Settings), Design Técnico

## Interface

Para endpoints HTTP:

| Método | Caminho | Entrada | Saída | Status codes |
|--------|---------|---------|-------|--------------|
| GET | `/settings` | `QueryParams` | `[Setting]` | 200, 401 |
| GET | `/settings/:settingKey` | `settingKey` | `Setting` | 200, 404, 401 |
| PUT | `/settings/:settingKey` | `{ value }` | `Setting` | 200, 404, 401 |

## Fluxo Principal
1. **Listagem Inicial:** O painel (Vue) faz GET em `/settings` após o login. Recebe um array associado àquele `tenantId`. As toggles da UI são desenhadas.
2. **Atualização:** O Admin clica num botão de rádio. O Vue dispara `PUT /settings/callReject` enviando `value: "enabled"`.
3. O `UpdateSettingService` checa no BD se o registro `key="callReject" AND tenantId=ID` existe. Faz Update.
4. O backend emite `[tenantId]:settings` via Socket informando a alteração para todos os outros operadores online atualizarem seus caches locais.

## Fluxos Alternativos
- **Fallback Read (Runtime):** O backend consome as configurações usando um utilitário (ex: `GetPublicSettingService` ou funções in-line). Sempre que requisitado, procura na chave e se não encontrar, devolve uma fallback string estipulada em código, inserindo de forma idempotente para aquele Tenant se necessário.

## Dependências
- Nenhuma dependência externa relevante além do BD.

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Arquitetura Key-Value | `Setting` table possui apenas `key` e `value` genéricos, permitindo criar novas configs sem precisar rodar migrations estruturais complexas no Postgres. | 🟢 |

## Estado Interno
- **Memória / Cache:** Frequentemente, a ausência de um Cache em Redis para essa tabela no legado leva o Node a fazer dezenas de `SELECT * FROM Settings` a cada webhook do WWebJS. Em uma arquitetura saneada, deve haver cache.

## Observabilidade
- Emissão de sockets fragmentados: `[tenantId]:settings` (Action: update).

## Riscos e Lacunas
- 🔴 **Vulnerabilidade de Multilocação:** Identificado previamente que o serviço original buscava configurações públicas baseadas apenas na chave. A migração deve fechar a brecha inserindo `tenantId` em toda chamada sem exceção, refatorando a assinatura de todos os serviços que requisitam `Settings`.
