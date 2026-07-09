# Requirements: Módulo de Canais (WhatsApp / Channels)

> Identificador: `008-canais`
> Data: `2026-07-09`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA

## 1. Resumo executivo

O módulo de Canais gerencia as conexões ativas com provedores de mensageria (principalmente WhatsApp via Baileys/Puppeteer). Ele administra o ciclo de vida das sessões (geração de QR Code, status de conexão, injeção de sessão salva), bem como mensagens automáticas genéricas de boas-vindas e despedida atreladas a cada número individual de atendimento.

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/code-analysis.md#Módulo:channels` | Conexões de WhatsApp (`WhatsAppController`) e ciclo de vida (`WhatsAppSessionController`). | 🟢 |
| `_reversa_sdd/data-dictionary.md#Módulo:channels` | Entidade `Whatsapp` contendo configurações, status (QRCODE, CONNECTED) e limitadores. | 🟢 |

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Administrador | Plugar novo número | Entra no painel, adiciona uma conexão chamada "Suporte SP" e escaneia o QR Code com o aparelho celular da empresa. |
| Sistema (Worker) | Reconexão automática | Ao iniciar o servidor, o sistema lê os arquivos de sessão `.wwebjs_auth` ou tokens salvos e tenta re-estabelecer o túnel com o WhatsApp. |
| Operador | Status Visual | Ao acessar o painel, a bolinha da conexão deve mostrar verde (Online) ou vermelho (Desconectado), avisando sobre falhas do celular. |

## 4. Regras de negócio novas ou alteradas

1. **RN-01:** A criação de uma nova Conexão sofre restrição pesada se a contagem atual de canais (`count`) for maior ou igual ao limite estipulado no Tenant (`maxConnections`). 🟢
2. **RN-02:** Um Tenant pode ter múltiplas conexões. Pode-se eleger uma como Padrão (`isDefault: true`). Quando um operador envia uma mensagem ativa, o sistema tenta usar a padrão se outra não for especificada. 🟢
3. **RN-03:** Canais possuem mensagens "globais" daquele número (Saudação, Despedida, NPS/Avaliação) que sobrepõem os comportamentos da Fila quando o atendimento cai direto no nível de conexão. 🟢

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | CRUD de Conexões | Must | Listar, Criar, Atualizar e Deletar números de WhatsApp. | 🟢 |
| RF-02 | Geração e Exibição de QRCode | Must | Emitir a string ou imagem do QR Code para o front-end via Socket quando o celular não estiver conectado. | 🟢 |
| RF-03 | Controle de Sessão | Must | Permitir desconectar ativamente um aparelho ou forçar reiniciar o túnel (`WhatsAppSessionController.remove / update`). | 🟢 |
| RF-04 | Restrição de Cotas | Must | Validar o teto do `maxConnections` antes da inserção no BD. | 🟢 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Resiliência | Arquivos Locais | As chaves de criptografia do WhatsApp (Baileys/WWebJS) ficam salvas em `.wwebjs_auth`. Se a pasta sumir, as sessões morrem. | 🟢 |
| Desempenho | Paralelismo de Sessões | Múltiplas sessões ativas demandam uso intensivo de RAM (Puppeteer/Baileys). Exige workers. | 🟡 |

## 7. Critérios de Aceitação

```gherkin
Cenário: Emparelhamento de novo canal
  Dado que um Admin cria um canal "Central de Vendas"
  Quando o status mudar para "qrcode"
  Então o sistema emite o evento Socket com o hash do QRCode
  E o frontend renderiza a imagem para o usuário escanear
  E após escaneado, o status muda automaticamente para "CONNECTED".
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01 (Gestão de Conexões) | Must | O núcleo do software é o mensageiro. |
| RF-02 (QR Code via API) | Must | Única forma de injetar o chip do cliente na nuvem. |
| RF-04 (Restrição Cota) | Must | Evita abuso do servidor e garante faturamento. |

## 9. Esclarecimentos

> Nenhuma sessão de dúvidas registrada ainda. Rode `/reversa-clarify` quando houver `[DÚVIDA]` pendente.

## 10. Lacunas

- Nenhuma lacuna crítica de conhecimento identificada.

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-09 | Versão inicial gerada por `/reversa-writer` | reversa |
