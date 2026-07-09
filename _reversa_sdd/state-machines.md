# Máquinas de Estado

> 🟡 INFERIDO

## 1. Ticket
A entidade central de atendimento possui um ciclo de vida baseado no seu `status`.

```mermaid
stateDiagram-v2
    [*] --> pending: Criação inicial pelo contato ou chatbot
    pending --> open: Operador assume ou chatbot roteia
    open --> closed: Operador encerra atendimento
    pending --> closed: Encerramento automático via chatbot
    closed --> pending: Cliente envia nova mensagem
```

## 2. Message
Representa o status de entrega do payload textual/mídia para os canais externos.

```mermaid
stateDiagram-v2
    [*] --> pending: Inserida no BD / Fila
    pending --> sended: Disparada pelo Wbot/API
    sended --> received: Entregue ao dispositivo do cliente
    sended --> read: (Opcional) Confirmação de leitura
```

## 3. Campaign
Disparos em massa em background.

```mermaid
stateDiagram-v2
    [*] --> pending: Criada e agendada
    pending --> processing: Entrou na fila do Bull/Redis
    processing --> finished: Entregas confirmadas
    processing --> canceled: Interrompida pelo admin
```

## 4. Whatsapp (Canal/Conexão)
Estado do socket ou integração de rede social.

```mermaid
stateDiagram-v2
    [*] --> DISCONNECTED: Criada
    DISCONNECTED --> CONNECTING: Iniciando processo do Wbot
    CONNECTING --> CONNECTED: QRCode lido / Sessão restaurada
    CONNECTED --> DISCONNECTED: Erro de rede ou logout
```
