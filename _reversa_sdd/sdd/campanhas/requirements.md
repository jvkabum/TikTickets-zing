# Requirements: Módulo de Campanhas (Campaigns)

> Identificador: `009-campanhas`
> Data: `2026-07-09`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA

## 1. Resumo executivo

O módulo permite a criação e disparo de mensagens em massa (Broadcast) para listas de contatos específicas. Suporta envio de mídia, variáveis de personalização, rotação de textos para evitar bloqueios de spam pelo WhatsApp (A/B/C testing rudimentar) e agendamento futuro via processamento em background (Redis/Bull).

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/code-analysis.md#Módulo:campaigns` | Rotas de gerência de lista de contatos e agendamento de disparos. | 🟢 |
| `_reversa_sdd/data-dictionary.md#Módulo:campaigns` | Entidades `Campaign`, `ContactList`, `ContactListItem`, `CampaignShipping` e `CampaignSetting`. | 🟢 |

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Administrador / Marketing | Anunciar promoção | Importa um CSV com 500 contatos em uma `ContactList`, cria uma `Campaign` agendada para amanhã e anexa um flyer (imagem). |
| Sistema (Worker) | Disparar mensagens | Em background (Redis Bull), o sistema acorda no horário agendado, itera pela lista de contatos e invoca a API do WhatsApp com *delay* randomizado para evitar ban. |
| Administrador | Auditoria de Sucesso | Verifica no painel de campanhas o funil de entrega, confirmando quantos disparos deram "sucesso" e quantos falharam na `CampaignShipping`. |

## 4. Regras de negócio novas ou alteradas

1. **RN-01:** Campanhas operam em uma máquina de status estrita: `PROGRAMADA`, `EM_ANDAMENTO`, `FINALIZADA` e `CANCELADA`. 🟢
2. **RN-02:** O sistema suporta até 3 variantes da mensagem inicial e 3 de mensagem de confirmação para rotacionar o conteúdo e mitigar algoritmos antispam da Meta. 🟢
3. **RN-03:** As mensagens são postadas em filas no Redis (`bull`), retirando a carga da API HTTP síncrona. 🟢
4. **RN-04:** Um disparo mal-sucedido marca a linha da tabela associativa `CampaignShipping` com o erro e não aborta o resto da lista. 🟢

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | Gestão de Listas de Contato | Must | Permitir CRUD de agrupamentos de contatos (ContactList). | 🟢 |
| RF-02 | Agendamento de Disparo | Must | A API aceita a data futura e aciona o schedule no serviço de filas (Bull). | 🟢 |
| RF-03 | Disparo com Delay | Must | O job de envio deve respeitar a janela de delay configurada no `CampaignSetting` para espaçar as mensagens. | 🟢 |
| RF-04 | Envio de Mídia | Should | Suporte a upload local (`mediaPath`) e envio do anexo. | 🟢 |
| RF-05 | Rastreamento Individual | Must | Cada contato alcançado gera ou atualiza o log de `CampaignShipping`. | 🟢 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Escalabilidade | Filas (Redis Bull) | Sem filas assíncronas, disparar 1.000 mensagens no Node.js bloquearia a Main Thread e derrubaria a aplicação. | 🟢 |
| Desempenho | Upload Multipart | Midlewares como `multer` devem suportar arquivos grandes. | 🟢 |

## 7. Critérios de Aceitação

```gherkin
Cenário: Processamento de Campanha
  Dado que uma Campanha tem 3 contatos na lista
  E a data de "scheduledAt" foi alcançada
  Quando o Worker do Redis capturar o Job
  Então o sistema envia a mensagem 1 para o Contato A,
  A mensagem 2 para o Contato B,
  E a mensagem 3 para o Contato C, rotacionando os textos.
  E grava o status "FINALIZADA" ao terminar.
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01 (Listas) | Must | Pré-requisito para direcionar o público alvo. |
| RF-02 (Cron/Bull) | Must | O núcleo da engine de marketing. |
| RF-04 (Mídias) | Should | Flyers aumentam a conversão, crucial comercialmente. |

## 9. Esclarecimentos

> Nenhuma sessão de dúvidas registrada ainda. Rode `/reversa-clarify` quando houver `[DÚVIDA]` pendente.

## 10. Lacunas

- Nenhuma lacuna crítica de conhecimento identificada.

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-09 | Versão inicial gerada por `/reversa-writer` | reversa |
