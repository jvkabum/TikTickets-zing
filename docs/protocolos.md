# Sistema de Protocolos - Documentação

## Visão Geral
O sistema de protocolos foi implementado para gerenciar e rastrear atendimentos em tickets, fornecendo uma maneira organizada de visualizar o histórico de interações com os clientes.

## Estrutura do Backend

### Modelo de Dados (Protocol)
```typescript
interface Protocol {
  id: number;
  protocolNumber: string;     // Formato: "(contador)-ticketId"
  contactId: number;
  tenantId: number;
  ticketId: number;
  userId: number;
  userName: string;
  status: "ABER" | "FECH";    // ABER = Aberto, FECH = Fechado
  createdAt: Date;
  updatedAt: Date;
}
```

### Migrações
1. `20240224001_create_protocols.ts`
   - Cria a tabela principal de protocolos

2. `20240225001_add_attendanceCount_to_tickets.ts`
   - Adiciona contador de atendimentos aos tickets

3. `20250226144500-add_protocolNumber_to_messages.js`
   - Vincula mensagens a protocolos específicos

4. `20250226144600-add_userName_to_protocols.js`
   - Adiciona nome do usuário responsável pelo protocolo

### Rotas da API
```typescript
GET    /protocols/:ticketId     // Lista protocolos de um ticket
POST   /protocols              // Cria novo protocolo
PUT    /protocols/:id         // Atualiza protocolo existente
DELETE /protocols/:id        // Remove protocolo
```

## Lógica de Negócio

### Geração de Protocolos
- Novo protocolo é criado quando:
  1. Ticket é reaberto (status: closed -> open)
  2. Primeira abertura do ticket (pending -> open)
  3. Fechamento do ticket (qualquer status -> closed)

### Numeração de Protocolos
- Formato: `(attendanceCount)-ticketId`
- Exemplo: `(1)-123` (primeiro atendimento do ticket 123)
- O contador incrementa a cada novo atendimento

### Estados do Protocolo
- **ABER**: Protocolo aberto (início do atendimento)
- **FECH**: Protocolo fechado (fim do atendimento)

## Frontend

### Componentes Visuais

#### Divisor de Protocolo
```vue
<hr
  v-if="mostrarDivisorProtocolo(mensagem, index)"
  class="hr-text"
  :class="getProtocoloMensagem(date)?.status === 'ABER' ? 'protocolo-aberto' : 'protocolo-fechado'"
  :data-content="obterTextoProtocolo(protocolo)"
>
```

### Estilos
- **Protocolo Aberto**:
  - Cor: Verde (#4CAF50)
  - Ícone: 🟢
  - Fundo: #E8F5E9

- **Protocolo Fechado**:
  - Cor: Vermelho (#F44336)
  - Ícone: 🔴
  - Fundo: #FFEBEE

### Efeitos Visuais
- Hover com elevação
- Sombras suaves
- Gradientes nas linhas
- Transições suaves
- Adaptação para modo escuro

## Funções Principais

### mostrarDivisorProtocolo()
```javascript
mostrarDivisorProtocolo(mensagem, index) {
  // Mostra divisor quando:
  // 1. É a primeira mensagem
  // 2. Há novo protocolo entre mensagens
  // 3. Houve mudança de status do protocolo
}
```

### getProtocoloMensagem()
```javascript
getProtocoloMensagem(msgDate) {
  // Encontra o protocolo mais próximo da data da mensagem
  // Usa reduce para calcular a menor diferença de tempo
}
```

### obterTextoProtocolo()
```javascript
obterTextoProtocolo(protocolo) {
  // Formata texto do protocolo:
  // "(Protocolo 1-123) - (abertura 01/02/24 as 14:30 Por João)"
}
```

## Integração com UpdateTicketService

O serviço gerencia:
1. Criação de novos protocolos
2. Atualização do contador de atendimentos
3. Vinculação de mensagens aos protocolos
4. Fechamento de protocolos existentes

## Boas Práticas

1. **Validações**
   - Verificar existência do ticket
   - Validar datas
   - Confirmar permissões do usuário

2. **Performance**
   - Cache de protocolos carregados
   - Ordenação eficiente
   - Minimizar consultas ao banco

3. **UX**
   - Feedback visual claro
   - Cores significativas
   - Transições suaves
   - Modo escuro

## Exemplos de Uso

### Criando Protocolo
```javascript
await Protocol.create({
  protocolNumber: `(${newAttendanceCount})-${ticketId}`,
  contactId: ticket.contactId,
  tenantId: ticket.tenantId,
  ticketId: ticket.id,
  userId: userIdRequest,
  userName: requestingUserName,
  status: "ABER"
});
```

### Atualizando Mensagens
```javascript
await Message.update(
  { protocolNumber },
  {
    where: {
      ticketId: ticket.id,
      protocolNumber: { [Op.or]: [null, ""] }
    }
  }
);
```

## Troubleshooting

### Problemas Comuns
1. Protocolos não aparecem
   - Verificar carregamento inicial
   - Confirmar permissões
   - Validar formato das datas

2. Divisores duplicados
   - Verificar lógica de exibição
   - Confirmar unicidade dos protocolos

3. Estilos incorretos
   - Verificar modo escuro
   - Validar variáveis CSS
   - Confirmar classes aplicadas

## Manutenção

### Logs e Monitoramento
- Erros de carregamento
- Falhas de criação
- Problemas de sincronização

### Atualizações Futuras
1. Exportação de relatórios
2. Filtros avançados
3. Estatísticas de atendimento
4. Métricas de performance

## Segurança

1. **Validações**
   - Entrada de dados
   - Permissões de usuário
   - Escopo de tenant

2. **Sanitização**
   - Dados de protocolo
   - Nomes de usuário
   - Mensagens vinculadas 