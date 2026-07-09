# Requirements: Módulo de Integração (API Externa)

> Identificador: `013-integracao-api`
> Data: `2026-07-09`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA

## 1. Resumo executivo

O módulo permite que sistemas externos (ERPs, e-commerces, CRMs terceiros) conversem com a máquina do WhatsApp gerenciada pelo TikTickets. O módulo gera um Token de Autorização estático e fornece uma rota pública POST pela qual o ERP pode enviar alertas transacionais diretamente para o cliente final.

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/code-analysis.md#Módulo:api-integration` | Rotas de envio de mensagens expostas para terceiros usando `ApiConfig.token`. | 🟢 |
| `_reversa_sdd/data-dictionary.md#Módulo:api-integration`| Entidades `ApiConfig` e `ApiMessage`. | 🟢 |

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Sistema Terceiro (ERP) | Enviar notificação | O sistema de Delivery de um restaurante bate na API do TikTickets com payload `{"number":"551199...", "body":"Seu pedido saiu!"}`. O TikTickets repassa a mensagem pro celular. |
| Administrador | Gerenciar Chaves | No painel, cria uma nova chave de API chamada "Integração iFood", associa a qual número de WhatsApp ela usará para disparar as msgs e cadastra a Webhook de retorno. |

## 4. Regras de negócio novas ou alteradas

1. **RN-01:** O disparo de API exige a presença do header `Authorization: Bearer <ApiConfig.token>`. 🟢
2. **RN-02:** A mensagem disparada via API não deve interromper obrigatoriamente um ChatFlow em andamento, mas gera registro na tabela de mensagens daquele Contato. 🟢
3. **RN-03:** Se a propriedade `urlServiceStatus` estiver configurada, o backend do TikTickets atua como webhook sender, fazendo um POST de volta para o ERP quando o cliente final ler a mensagem (Read Receipt). 🟢

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | CRUD de Credenciais (ApiConfig) | Must | Permitir criar conexões, gerar tokens aleatórios e definir o webhook de callback. | 🟢 |
| RF-02 | Endpoint Público de Disparo | Must | Receber payload JSON validado e delegar o envio ao serviço interno do WhatsApp. | 🟢 |
| RF-03 | Log de Disparos | Should | Gravar sucessos e falhas na tabela `ApiMessage` para auditoria do que o ERP pediu pra enviar. | 🟢 |
| RF-04 | Forwarding de Status (Webhook) | Should | Notificar o ERP externo sobre a mudança de status da mensagem (Enviada, Recebida, Lida). | 🟢 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Segurança | Autenticação por Token Fixo | API Pública protegida por JWT de longa duração atrelado à tabela `ApiConfig`. | 🟢 |

## 7. Critérios de Aceitação

```gherkin
Cenário: Disparo via API externa validado
  Dado que o ERP envie um POST para /api/messages/send
  E o header Authorization contenha um token válido no banco
  Quando o sistema processar
  Então localiza o tenantId a partir do Token
  E instrui o Baileys a despachar a mensagem para o "number" informado
  E retorna HTTP 200 com o ID da mensagem.
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01 (Chaves) | Must | Base de segurança. |
| RF-02 (Endpoint de envio) | Must | O objetivo principal da integração. |
| RF-04 (Webhooks) | Should | Sistemas modernos de ERP exigem feedback assíncrono. |

## 9. Esclarecimentos

> Nenhuma sessão de dúvidas registrada ainda. Rode `/reversa-clarify` quando houver `[DÚVIDA]` pendente.

## 10. Lacunas

- Nenhuma lacuna crítica de conhecimento identificada.

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-09 | Versão inicial gerada por `/reversa-writer` | reversa |
