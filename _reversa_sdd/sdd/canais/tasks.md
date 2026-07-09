# Canais (WhatsApp), Tarefas de Implementação

> Foca em uma sequência de tarefas executáveis para reimplementar a unit a partir do legado, com rastreabilidade ao código original.

## Pré-requisitos
- [ ] Módulo de Tenants e limites de conexões ativos.
- [ ] Socket.io pronto para brodcasts bidirecionais.

## Tarefas

- [ ] T-01, Implementar Entidade `Whatsapp`
  - Origem no legado: `backend/src/models/Whatsapp.ts`
  - Critério de pronto: Tabela criada com status (`qrcode`, `connected`, `disconnected`, `opening`), mensagens default, `tenantId` e controle de token.
  - Confiança: 🟢

- [ ] T-02, Serviços REST Base (CRUD)
  - Origem no legado: `backend/src/services/WhatsappService/`
  - Critério de pronto: O serviço `CreateWhatsAppService` barra a criação se ultrapassar a cota de conexões e força que haja sempre ao menos uma com `isDefault: true`.
  - Confiança: 🟢

- [ ] T-03, Instanciador e Gerenciador de Sessão WWebJS/Baileys
  - Origem no legado: `backend/src/libs/wbot.ts`
  - Critério de pronto: Classe/Módulo que encapsula a engine de WhatsApp. Deve disparar eventos quando um QR Code é emitido, atualizando a model no BD.
  - Confiança: 🟢

- [ ] T-04, Listeners e Sockets do Bot
  - Origem no legado: `backend/src/controllers/WhatsAppSessionController.ts`
  - Critério de pronto: Endpoints para forçar conexão (`POST`) e desconexão (`DELETE`). Amarração dos disparos de WebSocket do Node para o Vue.
  - Confiança: 🟢

- [ ] T-05, Lógica de Boot (Auto-reconnect)
  - Origem no legado: `backend/src/server.ts` (ou helpers init)
  - Critério de pronto: No "on startup" do servidor, ler todos os WhatsApps no banco de dados e instanciar os que tinham status ativo, reconstituindo as sessões.
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Validar Limite de Conexões: Em um tenant com cota de 1, tente adicionar a segunda conexão via API.
- [ ] TT-02, Simular a recepção de um QR Code gerado pelo serviço simulado e checar se o WebSocket entregou a string correta na porta 3000.

## Ordem Sugerida
1. T-01 e T-02: Gestão CRUD é necessária para popular o banco.
2. T-03: Implementar a complexa lib que fará a ponte com os servidores do WhatsApp.
3. T-04: Conectar a lib à API REST.
4. T-05: Garantir a persistência ao reiniciar a máquina host.

## Lacunas Pendentes (🔴)
- Avaliar estratégia de armazenamento das chaves do WhatsApp em caso de escalabilidade horizontal. Se a meta é Kubernetes, a T-03 precisará de refatoração para salvar as chaves no banco ou em um volume Redis centralizado.
