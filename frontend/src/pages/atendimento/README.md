/**
 * Módulo de Atendimento
 * 
 * Responsável pelo chat e gestão de tickets de atendimento.
 * 
 * Principais recursos:
 * - Chat em tempo real
 * - Gestão de tickets
 * - Notificações
 * - Transferência de atendimento
 */

# Módulo de Atendimento

## Descrição
Módulo responsável pelo chat e gestão de tickets de atendimento.

## Principais recursos atuais
- Chat em tempo real
- Gestão de tickets
- Notificações
- Transferência de atendimento

## 📁 Estrutura de Arquivos

- `Chat.vue` - Componente principal do chat
- `InputMensagem.vue` - Componente de entrada de mensagens
- `MensagemChat.vue` - Componente de exibição de mensagens
- `TicketList.vue` - Lista de tickets/conversas
- `ItemTicket.vue` - Item individual da lista de tickets
- `InforCabecalhoChat.vue` - Cabeçalho do chat com informações
- `MensagemRespondida.vue` - Exibição de mensagens respondidas
- `ModalNovoTicket.vue` - Modal para criação de tickets
- `RecordingTimer.vue` - Timer para gravação de áudio
- `ContatoCard.vue` - Card de informações do contato
- `ContatoModal.vue` - Modal de detalhes do contato
- `mixinSockets.js` - Lógica de websockets
- `mixinCommon.js` - Funções comuns
- `store/modules/chat.js` - Gerenciamento de estado
- `types/chat.ts` - Definições de tipos
- `components/` - Componentes auxiliares
- `css/chat.sass` - Estilos

## 🔧 Funcionalidades Principais

### Chat
- Envio e recebimento de mensagens em tempo real
- Suporte para múltiplos tipos de mídia (áudio, imagem, vídeo)
- Sistema de respostas rápidas
- Citação de mensagens
- Encaminhamento de mensagens

### Tickets
- Gerenciamento de status (aberto, pendente, fechado)
- Atribuição de atendentes
- Histórico de conversas
- Filtros e busca

### Mensagens Rápidas
- Atalhos personalizáveis
- Suporte a mídia
- Organização por categorias
- Busca rápida

### Mídia
- Upload de arquivos
- Gravação de áudio
- Envio de imagens e vídeos
- Preview de mídia centralizado (400px x 350px)
- Fechamento do preview com ESC ou clique fora da área

### Emojis
- Seletor de emoji centralizado na tela
- Tamanho do seletor: 400px de largura (90% da tela em dispositivos menores)
- Fechamento com ESC, botão de fechar ou clique fora da área
- Suporte completo ao modo escuro

## 🚀 Como Usar

### Mensagens Rápidas
1. Digite "/" para abrir o menu de mensagens rápidas
2. Selecione a mensagem desejada
3. A mensagem será inserida automaticamente

### Envio de Mídia
1. Clique no ícone de anexo
2. Selecione o arquivo desejado
3. Adicione uma legenda (opcional)
4. Envie a mensagem

### Tickets
1. Use a barra lateral para navegar entre tickets
2. Altere o status usando os botões no cabeçalho
3. Atribua tickets a atendentes conforme necessário

## ⌨️ Atalhos de Teclado

- `Enter` - Enviar mensagem
- `Shift + Enter` - Nova linha
- `/` - Abrir menu de mensagens rápidas
- `Esc` - Fechar modais, preview de mídia e seletor de emoji

## 🔄 Ciclo de Vida do Ticket

1. **Pendente**: Ticket recém-criado aguardando atendimento
2. **Aberto**: Em atendimento por um agente
3. **Fechado**: Atendimento finalizado

## 🎯 Próximas Melhorias

1. **Interface**
   - Modo escuro aprimorado
   - Layout mais responsivo
   - Preview de links

2. **Funcionalidades**
   - Busca avançada de mensagens
   - Tags para organização
   - Templates dinâmicos

3. **Performance**
   - Carregamento otimizado de imagens
   - Cache aprimorado
   - Virtualização de listas

4. **Produtividade**
   - Mais atalhos de teclado
   - Macros personalizáveis
   - Múltiplos atendentes

## 🔒 Segurança

- Criptografia de mensagens
- Controle de acesso por perfil
- Backup automático
- Logs de atividades

## 📱 Responsividade

O módulo é totalmente responsivo e se adapta a diferentes tamanhos de tela:
- Desktop: Layout completo
- Tablet: Layout adaptativo
- Mobile: Layout otimizado para toque

## 🤝 Contribuindo

Para contribuir com melhorias:
1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Faça commit das alterações
4. Crie um Pull Request

## 📄 Licença

Este módulo é parte do sistema TikTickets e está sob a licença proprietária.

## 📋 Lista Detalhada de Melhorias Sugeridas

### 1. Interface do Chat
- Adicionar indicador de digitação (quando o cliente está digitando)
  - Exibir indicador visual quando o cliente está digitando
  - Atualização em tempo real via WebSocket
  - Ícone animado de digitação
  - Timeout automático após inatividade
- Implementar preview de links compartilhados
- Adicionar suporte para temas escuros mais consistente
- Melhorar a visualização de mensagens longas

### 2. Mensagens Rápidas
- Adicionar categorização das mensagens rápidas
- Implementar busca por tags nas mensagens rápidas
- Adicionar atalhos de teclado personalizáveis
- Permitir favoritar mensagens mais usadas

### 3. Mídia e Arquivos
- Adicionar preview de documentos antes do envio
- Melhorar o gerenciamento de uploads múltiplos
- Implementar compressão de imagens opcional
- Adicionar suporte para envio de GIFs

### 4. UX/UI
- Adicionar temas personalizáveis
- Melhorar feedback visual de status de mensagem
- Adicionar mais atalhos de teclado
- Implementar modo compacto/expandido
- Melhorar visualização em dispositivos móveis
> **Justificativa**: Tornar a interface mais intuitiva e eficiente para os atendentes.

### 5. Funcionalidades
- Implementar filtros avançados para busca de mensagens
- Adicionar tags para organização de conversas
- Implementar templates de respostas dinâmicos
- Adicionar suporte para notas internas nas conversas

### 6. Performance
- Implementar carregamento lazy de imagens
- Melhorar o cache de mensagens
- Otimizar o carregamento inicial do chat
- Implementar virtualização para listas longas

### 7. Integração
- Melhorar integração com APIs externas
- Adicionar suporte para mais tipos de mídia
- Implementar webhooks personalizáveis
- Adicionar integrações com CRM

### 8. Produtividade
- Adicionar atalhos de teclado globais
- Implementar macros para ações comuns
- Melhorar o sistema de agendamento de mensagens
- Adicionar suporte para múltiplos atendentes na mesma conversa

### 9. Monitoramento
- Implementar métricas de tempo de resposta
- Adicionar análise de sentimento das conversas
- Melhorar logs de ações dos usuários
- Implementar relatórios personalizáveis

### 10. Segurança
- Implementar criptografia end-to-end
- Melhorar o controle de acesso por perfil
- Adicionar autenticação em dois fatores
- Implementar backup automático de conversas

### 11. Acessibilidade
- Melhorar suporte para leitores de tela
- Adicionar atalhos de teclado para todas as ações
- Implementar temas de alto contraste
- Melhorar a navegação por teclado

### 12. Experiência do Usuário
- Adicionar tour guiado para novos usuários
- Implementar dicas contextuais
- Melhorar feedback visual de ações
- Adicionar animações suaves de transição

## 📋 Lista de Melhorias Planejadas

### 1. Sistema de Notificações
- Implementar notificações push mais robustas
- Adicionar sons personalizáveis por tipo de mensagem
- Permitir configuração de notificações por usuário
- Mostrar preview da mensagem na notificação
> **Justificativa**: Melhorar a experiência do atendente e garantir que mensagens importantes não sejam perdidas.

### 2. Performance do Chat
- Implementar virtualização da lista de mensagens
- Lazy loading de imagens e mídia
- Melhorar o sistema de paginação
- Implementar cache local das mensagens
> **Justificativa**: Melhorar a performance com grande volume de mensagens e reduzir consumo de recursos.

### 3. UX/UI
- Adicionar temas personalizáveis
- Melhorar feedback visual de status de mensagem
- Adicionar mais atalhos de teclado
- Implementar modo compacto/expandido
- Melhorar visualização em dispositivos móveis
> **Justificativa**: Tornar a interface mais intuitiva e eficiente para os atendentes.

### 4. Recursos Avançados de Chat
- Implementar edição de mensagens enviadas
- Adicionar formatação rica (markdown)
- Melhorar preview de links
- Implementar citações aninhadas
- Adicionar reações a mensagens
> **Justificativa**: Oferecer mais ferramentas para comunicação efetiva.

### 5. Gestão de Filas
- Melhorar visualização de filas
- Adicionar priorização automática
- Implementar regras de distribuição
- Adicionar métricas em tempo real
- Melhorar sistema de transferência
> **Justificativa**: Otimizar o fluxo de atendimento e distribuição de tickets.

### 6. Integração e Extensibilidade
- Criar sistema de plugins
- Melhorar integração com APIs externas
- Implementar webhooks personalizados
- Adicionar suporte a chatbots
> **Justificativa**: Permitir maior personalização e integração com outros sistemas.

### 7. Recursos de Produtividade
- Implementar templates de mensagem mais avançados
- Adicionar macros personalizáveis
- Melhorar sistema de tags
- Implementar atalhos personalizáveis
- Adicionar sugestões automáticas
> **Justificativa**: Aumentar a produtividade dos atendentes.

### 8. Segurança
- Implementar criptografia ponta-a-ponta
- Melhorar sistema de permissões
- Adicionar autenticação em dois fatores
- Implementar logs de auditoria
> **Justificativa**: Aumentar a segurança e conformidade do sistema.

### 9. Analytics e Relatórios
- Implementar dashboard em tempo real
- Adicionar métricas de performance
- Melhorar relatórios de atendimento
- Implementar análise de sentimento
> **Justificativa**: Fornecer mais insights para gestão e melhoria contínua.

### 10. Recursos de Colaboração
- Implementar notas internas
- Adicionar sistema de supervisão
- Melhorar compartilhamento de informações
- Implementar chat interno entre atendentes
> **Justificativa**: Melhorar a colaboração entre a equipe de atendimento.

### 11. Melhorias Técnicas
- Refatorar código para melhor manutenibilidade
- Implementar testes automatizados
- Melhorar documentação
- Otimizar queries do banco de dados
- Implementar sistema de cache mais eficiente
> **Justificativa**: Garantir qualidade, manutenibilidade e escalabilidade do código.

### 12. Acessibilidade
- Implementar suporte a leitores de tela
- Melhorar navegação por teclado
- Adicionar alto contraste
- Implementar recursos de acessibilidade
> **Justificativa**: Tornar o sistema mais acessível para todos os usuários.

## Priorização das Melhorias

As melhorias serão implementadas na seguinte ordem:

1. Melhorias Técnicas e Refatoração
   - Foco inicial na qualidade e manutenibilidade do código
   - Base sólida para novas implementações

2. Performance e Otimizações
   - Melhorar experiência do usuário
   - Reduzir consumo de recursos

3. Recursos Essenciais de Produtividade
   - Aumentar eficiência dos atendentes
   - Melhorar fluxo de trabalho

4. UX/UI e Acessibilidade
   - Tornar interface mais amigável
   - Garantir acesso universal

5. Recursos Avançados e Integrações
   - Adicionar funcionalidades complementares
   - Expandir possibilidades de uso

## 💻 Tecnologias Utilizadas
- Vue.js
- Quasar Framework
- TypeScript
- WebSockets
- Pinia (State Management)

## 📞 Contato

Para dúvidas ou sugestões, entre em contato com a equipe de desenvolvimento.

# Componentes de Atendimento

## InputMensagem.vue

Este componente é responsável pela interface de envio de mensagens no chat de atendimento.

### Funcionalidades

#### Preview de Mídia
- O preview de mídia é exibido centralizado na tela quando um arquivo é selecionado
- Tamanho do preview: 400px x 350px
- Fechamento do preview:
  - Clicando no botão de fechar
  - Pressionando a tecla ESC
  - Clicando fora da área do preview

#### Seletor de Emoji
- O seletor de emoji é exibido centralizado na tela
- Tamanho do seletor: 400px de largura (90% da tela em dispositivos menores)
- Fechamento do seletor:
  - Clicando no botão de fechar
  - Pressionando a tecla ESC
  - Clicando fora da área do seletor

#### Atalhos de Teclado
- ESC: Fecha o preview de mídia ou o seletor de emoji
- ENTER: Envia a mensagem (quando o campo de texto está focado)

### Estilos
- O preview de mídia e o seletor de emoji utilizam um overlay semi-transparente para destacar o conteúdo
- Ambos possuem bordas arredondadas e sombras para melhor visualização
- O cabeçalho do preview e do seletor de emoji possuem estilos consistentes

### Modo Escuro
- Suporte completo ao modo escuro com cores adaptadas para melhor visualização