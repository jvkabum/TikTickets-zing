# Análise Técnica Consolidada

> 🟢 CONFIRMADO

## Módulo: `auth`

### 1. Fluxo de Controle
- **Login (`SessionController.store`)**: Autentica e-mail/senha, checa status do tenant, gera JWT e Refresh Token. Emite evento WebSocket (`[tenantId]:users`) avisando que o usuário está online. Retorna os tokens, dados do usuário e fila online.
- **Refresh (`SessionController.update`)**: Lê cookie HTTP-only `jrt`, valida e emite novos tokens, renovando a sessão.
- **Logout (`SessionController.logout`)**: Atualiza `isOnline = false` e data de `lastLogout`, notifica via WebSocket e encerra a sessão.

### 2. Algoritmos e Lógica
- **Bcrypt Hash**: Senhas são criadas com hash via Bcrypt no hook `BeforeCreate`/`BeforeUpdate` da model `User`.
- **JWT**: Criação de Token e Refresh Token com secrets e tempos de expiração distintos (`createAccessToken`, `createRefreshToken`).
- **Tenant Isolation**: O login exige que a empresa (tenant) associada ao usuário (`tenantId`) possua o `status === "active"`. Se não, devolve 401.

### 3. Estruturas de Dados
- Entidade principal: `User` (ver dicionário de dados).
- DTO de Autenticação de resposta: `{ user, token, refreshToken, usuariosOnline }`.

### 4. Metadados e Configurações
- Estado de Presença é mantido em tempo real via Socket.io no canal `[tenantId]:users`.
- Controle de expiração e invalidação através do campo `tokenVersion` no banco de dados.

---

## Módulo: `tenants`

### 1. Fluxo de Controle
- **Listagem e CRUD (`AdminController`)**: Superadmins gerenciam tenants (`indexTenants`, `createTenant`, `updateTenant`, `deleteTenant`).
- **Atualização de Horários (`TenantController.updateBusinessHours`)**: Valida um payload de horários (dia da semana, horários hr1-hr4) via Yup, exigindo formato `HH:mm`.
- **Mensagem de Fora de Expediente (`TenantController.updateMessageBusinessHours`)**: Atualiza o aviso textual exibido quando a empresa está fechada.

### 2. Algoritmos e Lógica
- **Validação de Data/Hora (Yup + date-fns)**: O esquema de horários usa `date-fns::isMatch` customizado no Yup para certificar que o formato do horário é exatamente "HH:mm".
- **Multi-Tenancy**: Quase todos os módulos do sistema possuem relacionamento (FK `tenantId`) com a entidade `Tenant`, isolando os dados de diferentes empresas.

### 3. Estruturas de Dados
- Entidade principal: `Tenant` (ver dicionário de dados).
- O array de horários `businessHours` é nativamente gerenciado como `JSONB` no banco PostgreSQL.

### 4. Metadados e Configurações
- `maxUsers` e `maxConnections`: Representam as cotas permitidas para cada empresa do sistema.
- O campo `status` (default: "active") pode suspender ou inativar temporariamente uma empresa inteira (bloqueando login de seus usuários).

---

## Módulo: `users`

### 1. Fluxo de Controle
- **CRUD e Paginação (`UserController`)**: Gerencia a criação, leitura, atualização e exclusão de usuários com paginação (`ListUsersService`).
- **Exclusão Segura (`DeleteUserService`)**: Impede a deleção bruta de usuários que possuam tickets (atendimentos) abertos. Caso existam, invoca o helper `UpdateDeletedUserOpenTicketsStatus` para realocar ou fechar os tickets pendentes na mesma tenant.
- **Assinaturas via Sockets**: Qualquer mutação no usuário (create, update, delete) emite um evento instantâneo no canal `[tenantId]:user` atualizando as views dos demais operadores da mesma empresa.

### 2. Algoritmos e Lógica
- **Verificação Dinâmica de Cotas**: A criação (`store`) faz dupla checagem restritiva: contra o limite global da variável `.env` (`USER_LIMIT`) e contra o limite próprio da organização atual (`Tenant.maxUsers`).
- **Bloqueio de Inscrição**: A rota de store pode funcionar como um `/signup` público aberto, mas apenas se a configuração geral de sistema `userCreation` estiver permitida. Caso contrário, a criação é bloqueada e fica restrita a usuários já autenticados com `profile === "admin"`.

### 3. Estruturas de Dados
- Entidade principal: `User` (documentada em `auth`).
- Entidade de Relacionamento N:M: `UsersQueues` (vincula quais usuários atendem quais Filas).

### 4. Metadados e Configurações
- **Configurações Pessoais**: Cada usuário possui a coluna JSON genérica `configs` que pode ser manipulada livremente via endpoint `updateConfigs`.

---

## Módulo: `tickets`

### 1. Fluxo de Controle
- **CRUD Base (`TicketController`)**: Gerencia o ciclo de vida dos atendimentos (index, store, show, update, remove), com amplos filtros na listagem (`ListTicketsService`).
- **Fechamento e Despedida**: Quando um ticket é fechado (`status === "closed"` no `update`), o controlador verifica se o canal de WhatsApp possui `farewellMessage` configurada. Caso afirmativo, formata a string (usando a lib `pupa` para injetar variáveis como `{protocol}` e `{name}`) e engatilha um envio automatizado via `CreateMessageSystemService`.
- **Auditoria**: O endpoint `showLogsTicket` retorna uma timeline histórica de todas as interações no ticket usando a entidade `LogTicket`.
- **Sincronização de Mensagens**: O endpoint `syncMessages` reprocessa e reconcilia mensagens do Wbot associadas ao ticket.

### 2. Algoritmos e Lógica
- **Agregação em Tempo Real**: Na exibição do ticket (`show`), o sistema busca ativamente mensagens com status `pending` e `scheduleDate` futura para anexar via propriedade virtual `scheduledMessages`.
- **Injeção de Variáveis (Pupa)**: Utilizado nativamente para processar templates de mensagens (ex: protocolo atual, extraído do array do relacionamento `protocols` selecionando o último inserido).
- **Emissão Sockets**: Operações em tickets emitem eventos complexos para várias salas simultaneamente (`[tenantId]:[status]`, `[tenantId]:[ticketId]`, `[tenantId]:notification`) garantindo sincronismo da interface de usuário.

### 3. Estruturas de Dados
- Entidades Principais: `Ticket`, `Protocol`, `LogTicket`.
- `Ticket` concentra as métricas de tempo (`closedAt`, `startedAttendanceAt`), métricas de bot (`botRetries`, `lastInteractionBot`), fila lida (`unreadMessages`) e contagem agregada de reatendimento (`attendanceCount`).

### 4. Metadados e Configurações
- `Ticket` atua como Root Aggregate, vinculando as entidades `Contact`, `User`, `Whatsapp` (conexão), `Queue`, `AutoReply`, `StepsReply` e `ChatFlow` no mesmo contexto.

---

## Módulo: `contacts`

### 1. Fluxo de Controle
- **CRUD e Sincronização**: Gerencia contatos com funções de importação de arquivo (`upload` de planilhas XLSX) e exportação de base (`exportContacts`).
- **Validação de Número Ativa**: Na criação (`store`) e atualização (`update`), o backend se comunica ativamente com o serviço Baileys/Whatsapp (`CheckIsValidContact`) para certificar que o número submetido possui uma conta real registrada. Em paralelo, busca silenciosamente o avatar (`GetProfilePicUrl`).
- **Sync Automático (`syncContacts`)**: Processo que faz o enfileiramento das instâncias Wbot vinculadas à empresa para extrair a agenda do celular/servidor.

### 2. Algoritmos e Lógica
- **Higienização de Entradas**: Números recebem sanitize via RegEx (`/\D/g`) nativamente antes da inserção no banco de dados, protegendo chamadas de API subsequentes.
- **Exportação XLSX (FS e Buffer)**: O algoritmo de exportação consulta o BD, utiliza a biblioteca nativa XLSX do NodeJS para inflar um Buffer de memória com a planilha e salva no FileSystem com nome mascarado (UUID), devolvendo um link temporário `/public/downloads/`.

### 3. Estruturas de Dados
- Entidade Principal: `Contact` (Omnichannel - abriga chaves do WhatsApp, Telegram, Messenger e Instagram).
- Entidade Filha: `ContactCustomField` (Armazena chaves-valor customizados sem alteração de DDL principal).

### 4. Metadados e Configurações
- **Relacionamentos Cruciais**: Conta com as pivôs `ContactWallet` (associando contatos a operadores fixos), `ContactTag` (categorização) e `CampaignContacts` (lista de envios em massa).

---

## Módulo: `queues`

### 1. Fluxo de Controle
- **CRUD Básico (`QueueController`)**: Gerencia a catalogação de filas de atendimento. Apenas usuários com `profile === "admin"` podem criar (`store`), editar (`update`) ou excluir (`remove`) filas (a leitura é global e irrestrita).
- **Proteção de Deleção via FK**: Na exclusão (`DeleteQueueService`), a aplicação permite a execução direta do método `destroy()`. Se houver tickets atrelados à fila, a própria restrição de chave estrangeira (FK Constraint) nativa do banco de dados levanta uma exceção que cai no bloco `catch`, sendo convertida na resposta elegante HTTP 404 `ERR_QUEUE_TICKET_EXISTS`.

### 2. Algoritmos e Lógica
- **Validação Estruturada**: Utiliza Yup para forçar a consistência dos contratos (nome da fila na propriedade `queue`, status como `isActive`).

### 3. Estruturas de Dados
- Entidade Principal: `Queue`. Entidade simples de parametrização organizacional.

### 4. Metadados e Configurações
- Os Tickets são ancorados nas Filas. Operadores ganham visão dessas filas através da tabela pivot `UsersQueues`.

---

## Módulo: `chatflow`

### 1. Fluxo de Controle
- **Motor do Chatbot (`VerifyStepsChatFlowTicket`)**: Intercepta mensagens de tickets em `pending`. Navega no grafo (JSON `flow`) baseando-se nas condições do nó atual. 
  - Ação `0`: Avança o passo e dispara a próxima cadeia de mensagens.
  - Ação `1`: Roteia para Fila (`isQueueDefine`).
  - Ação `2`: Roteia para Usuário Específico (`isUserDefine`).
- **Limites e Retentativas (`isRetriesLimit`)**: Conta os erros do cliente (`botRetries`). Se o limite `maxRetryBotMessage` for atingido, aplica uma rota de fuga de emergência (transferência compulsória para atendente ou encerramento).
- **Encerramento Automático (`isAnswerCloseTicket`)**: Palavras-chave pré-definidas podem forçar a transição instantânea do ticket para `status: closed`.
- **Modo de Teste (`celularTeste`)**: Um telefone de homologação que ignora gatilhos caso o bote não esteja em produção.

### 2. Algoritmos e Lógica
- **Parse Dinâmico de Mídias (`get flow()`)**: Na modelagem Sequelize, o getter nativo `flow` varre o JSON sob demanda. Se encontrar nós do tipo `MediaField`, ele automaticamente concatena a URL raiz do backend (`BACKEND_URL:PROXY_PORT/public/`) para servir corretamente as imagens/arquivos no motor de front-end.
- **Proxy de Disparo (`BuildSendMessageService`)**: Pega interações do JSON e materializa no banco de dados como instâncias de `Message` via `SendMessageSystemProxy`, acionando os conectores do WhatsApp real. Utiliza `pupa` para preencher meta-tags (ex: protocolo e nome do contato).

### 3. Estruturas de Dados
- Entidade Principal: `ChatFlow`.
- O coração do construtor de bots reside na coluna JSON `flow`, que serializa a interface vetorial (`nodeList`, `lineList` e `configurations`).

### 4. Metadados e Configurações
- A tabela funciona como a central de automação I.V.R (Interactive Voice/Text Response) e atua no início do ciclo de vida do `Ticket` (antes dele ganhar um `userId` definitivo).

---

## Módulo: `chatflow`

### 1. Fluxo de Controle
- **Motor do Chatbot (`VerifyStepsChatFlowTicket`)**: Intercepta mensagens de tickets em `pending`. Navega no grafo (JSON `flow`) baseando-se nas condições do nó atual. 
  - Ação `0`: Avança o passo e dispara a próxima cadeia de mensagens.
  - Ação `1`: Roteia para Fila (`isQueueDefine`).
  - Ação `2`: Roteia para Usuário Específico (`isUserDefine`).
- **Limites e Retentativas (`isRetriesLimit`)**: Conta os erros do cliente (`botRetries`). Se o limite `maxRetryBotMessage` for atingido, aplica uma rota de fuga de emergência (transferência compulsória para atendente ou encerramento).
- **Encerramento Automático (`isAnswerCloseTicket`)**: Palavras-chave pré-definidas podem forçar a transição instantânea do ticket para `status: closed`.
- **Modo de Teste (`celularTeste`)**: Um telefone de homologação que ignora gatilhos caso o bote não esteja em produção.

### 2. Algoritmos e Lógica
- **Parse Dinâmico de Mídias (`get flow()`)**: Na modelagem Sequelize, o getter nativo `flow` varre o JSON sob demanda. Se encontrar nós do tipo `MediaField`, ele automaticamente concatena a URL raiz do backend (`BACKEND_URL:PROXY_PORT/public/`) para servir corretamente as imagens/arquivos no motor de front-end.
- **Proxy de Disparo (`BuildSendMessageService`)**: Pega interações do JSON e materializa no banco de dados como instâncias de `Message` via `SendMessageSystemProxy`, acionando os conectores do WhatsApp real. Utiliza `pupa` para preencher meta-tags (ex: protocolo e nome do contato).

### 3. Estruturas de Dados
- Entidade Principal: `ChatFlow`.
- O coração do construtor de bots reside na coluna JSON `flow`, que serializa a interface vetorial (`nodeList`, `lineList` e `configurations`).

### 4. Metadados e Configurações
- A tabela funciona como a central de automação I.V.R (Interactive Voice/Text Response) e atua no início do ciclo de vida do `Ticket` (antes dele ganhar um `userId` definitivo).

---

## Módulo: `channels` (WhatsApp, Telegram, IG, Messenger)

### 1. Fluxo de Controle
- **Gerenciador Omnichannel (`WhatsAppController`)**: Apesar do nome estar atrelado ao WhatsApp, este módulo gerencia a infraestrutura de conexões de todas as redes da empresa (WhatsApp Web/Baileys, WABA, Telegram, Instagram, Messenger).
- **Controle de Cotas (`store`)**: Durante a criação de uma conexão, o sistema barra a ação caso o Tenant ultrapasse a cota corporativa `maxConnections` ou o limite global de infraestrutura `.env.CONNECTIONS_LIMIT`.
- **Encerramento de Conexões (`remove`)**: Ao deletar um canal, a rotina também encerra o processo em memória do WhatsappWebJS (`removeWbot`), evitando vazamentos de processos ou contas zumbis.

### 2. Algoritmos e Lógica
- **Geração de Webhook com JWT**: Para integrações corporativas (WhatsApp Business API e Messenger), os hooks `BeforeCreate` / `BeforeUpdate` do Sequelize assinam dinamicamente um Token JWT de tempo virtualmente infinito (`10000d`), preenchendo a coluna `tokenHook`. Esse token protege as rotas webhook de recepção contra interceptações de terceiros.
- **Notificação de Quedas via Fila (Hooks)**: O modelo possui um gatilho `@AfterUpdate` que reage às mudanças do status da conexão (ex: "CONNECTED" para "DISCONNECTED"). Se o cliente houver configurado uma API de escuta (`ApiConfig.urlServiceStatus`), a aplicação enfileira na Redis (Bull Queue `WebHooksAPI`) um payload notificando a mudança, permitindo que a integração do cliente seja informada do problema sem travar o Event Loop da aplicação Node.

### 3. Estruturas de Dados
- Entidade Principal: `Whatsapp` (com nome genérico "Whatsapp", servindo como polimorfismo primitivo).
- Campo de controle crucial: `type` (ENUM limitador do protocolo em uso: whatsapp, telegram, instagram, messenger, waba).

### 4. Metadados e Configurações
- **Getters Virtuais** (`UrlWabaWebHook` e `UrlMessengerWebHook`): Montam a URL absoluta resolvendo `BACKEND_URL` + `/caminho/` + `tokenHook` em tempo de leitura, entregando ao front-end a URL pronta para ser colada na Meta for Developers.

---

## Módulo: `campaigns`

### 1. Fluxo de Controle
- **Painel de Envios Massivos**: Controlado pelo `CampaignController` e processado inteiramente em background por meio do Bull (Filas do Redis).
- **Proteção Anti-Spam (A/B Testing Integrado)**: No disparo da campanha (`StartCampaignService`), o algoritmo sorteia aleatoriamente entre 3 variações de texto cadastradas (`message1`, `message2`, `message3`) para evitar envio de payloads 100% idênticos que acionariam os filtros heurísticos de spam da Meta.
- **Auto-conclusão de Status (`@AfterFind`)**: O modelo `Campaign` intercepta queries do tipo `findAll/findOne` e, usando hook estático, soma as estatísticas transacionais (`pendentesEntrega + recebidas + lidas`). Se o total igualar o número total de contatos da fila (`contactsCount`), a campanha muda do estado `processing` para `finished` de forma autônoma e silenciosa.

### 2. Algoritmos e Lógica
- **Horário Comercial Automático (`nextDayHoursValid`)**: O calculador de agendamento verifica se o tempo de disparo do job na fila acontecerá fora do horário das 08h às 20h. Caso positivo, ele recalcula os milissegundos matematicamente para transferir a execução para a manhã do dia seguinte (08:30 am), protegendo o destinatário contra notificações de madrugada e reduzindo a taxa de banimento.
- **Pupa Templating**: Ao montar a string que irá pra fila, o sistema injeta os dados reais (`name`, saudação referencial ao relógio) via pacote `pupa`, transformando templates dinâmicos em mensagens hiper-personalizadas para cada contato no array de alvos.

### 3. Estruturas de Dados
- Entidades: `Campaign` (A Cabeça), `CampaignContacts` (Relação 1:N com os status `ack` das entregas).
- No envio em massa, o delay de job (Bull) não é estático. Ele escala em P.A. (Progressão Aritmética). Se o `timeDelay` estipulado for 20s, o Job 1 recebe delay de 20s, o Job 2 de 40s, Job 3 de 60s, espalhando artificialmente o estrangulamento da fila `SendMessageWhatsappCampaign`.

### 4. Metadados e Configurações
- **Getters Virtuais de Mídia** (`mediaUrl`, `mediaUrl2`, `mediaUrl3`): Garantem a conversão orgânica do caminho local do disco (upload) num asset HTTP consumível pelo motor do wbot no ato do encapsulamento da mídia pela lib `whatsapp-web.js`.

---

## Módulo: `fast-replies`

### 1. Fluxo de Controle
- **CRUD e Atalhos Táticos**: Sistema de atalhos textuais. Permite ao atendente digitar `#algumacoisa` e enviar um bloco pronto de texto e imagens.
- **Middleware Multer Integrado**: O `FastReplyController` atua nativamente processando `Multipart Form Data`. As chamadas de `store` e `update` disparam a engine de disco (`multer.diskStorage`), salvando arquivos na pasta `backend/public` antes mesmo do endpoint ser alcançado.

### 2. Algoritmos e Lógica
- **Validação de JSON Nativa (Sequelize)**: Devido à arquitetura agnóstica de banco da coluna `medias` (DataType.JSON), o modelo `FastReply` roda uma validação customizada (`isArrayOfStrings`) para garantir integridade, abortando a inserção se alguém injetar um Objeto em vez de um Array puro de strings.
- **Fallback URL Hardcoded**: Na montagem da URL final dos arquivos, o controller acessa `process.env.BACKEND_URL`. Em caso de erro sistêmico na leitura das vars, existe um fallback embutido ("https://backend.tikanais.com.br") para prevenir falhas de frontend.
- **Destacamento Dinâmico (`deleteImage`)**: Além do CRUD tradicional, há uma rota especialista `deleteImage` acoplada a um Service próprio, que escaneia e apaga apenas a array JSON de mídias anexadas a uma resposta, deixando o atalho de texto intacto.

### 3. Estruturas de Dados
- Entidade Principal: `FastReply`.
- Uma coluna notável é a `key`, o gatilho semântico que o frontend "escuta" e expande para acionar a `message`.

### 4. Metadados e Configurações
- Todas as respostas rápidas são "Tenant-Bound", ou seja, uma conta da Plataforma "A" jamais compartilhará os atalhos criados por um usuário da Plataforma "B", assegurado pela `tenantId` mandatória nas chaves compostas de busca.

---

## Módulo: `settings`

### 1. Fluxo de Controle
- **Key-Value Store**: O painel de configurações gerais é mapeado diretamente no banco como um dicionário chave-valor (ex: "chatbot_active" = "true").
- **Real-Time Props**: Qualquer alteração numa configuração convencional via `SettingController` dispara imediatamente um evento bidirecional via Socket.io (`tenantId:settings` action `update`). O frontend da plataforma escuta essa via expressa para habilitar/desabilitar áreas do painel instantaneamente, sem precisar de `F5`.

### 2. Algoritmos e Lógica
- **Raw SQL Query (Bypass Multi-Tenant)**: A funcionalidade pontual de `daysToClose` (tempo limite para fechamento de tickets inativos hospedada no `ConfiguraFechamentoTicketService`) apresenta uma anomalia arquitetural notável escavada no código. Ao contrário dos outros serviços que usam a ORM do Sequelize (e consequentemente filtram por `tenantId`), este serviço faz uma Query Bruta (`SELECT value FROM public."Settings" WHERE key = 'daysToClose'`). Ao ignorar a chave do inquilino, o serviço inadvertidamente converte o fechamento automático numa "variável global vazada", onde o banco reage à primeira linha encontrada ou sobrescreve regras de outras empresas cadastradas no SaaS. Um ponto importantíssimo de documentação para refatoração.

### 3. Estruturas de Dados
- Entidade Única: `Setting`.
- Contém estruturalmente `key` (varchar) e `value` (varchar). O Casting da variável (ou seja, decidir se "10" é um Number ou se "true" é Boolean) é delegado à camada consumidora (frontend ou Service), mantendo o banco de dados burro e polimórfico.

### 4. Metadados e Configurações
- Chaves notáveis conhecidas pelo sistema: `daysToClose` (tempo limite de tickets zumbis) e as predefinições de interface.

---

## Módulo: `statistics`

### 1. Fluxo de Controle
- **Painéis Gerenciais (Dashboards)**: O módulo consome um oceano de dados brutos e os entrega mastigados para a camada visual (Gráficos e Indicadores).
- **Bifurcação de Perfil (Role-Based Access)**: Todos os serviços (ex: `DashTicketsAndTimes`) impõem uma condicional estrita. Se o `req.user.profile` for `"admin"`, executa-se o bloco `queryAdmin` que enxerga o tenant como um todo. Caso seja usuário comum, a query é restrita, acoplando um exigente `lt."userId" = :userId` na injeção.

### 2. Algoritmos e Lógica
- **Offloading Computacional (PostgreSQL)**: Diante do volume potencial de milhões de tickets e logs, o código NodeJS abandona o ORM e delega 100% da carga matemática ao motor do banco de dados (C++). Nada de `.map()` e `.reduce()` lentos na RAM do servidor Node.
- **Matemática Nativa (TMA/TME)**: A extração do Tempo Médio de Atendimento e Tempo Médio de Espera utiliza funções escalares sofisticadas nativas do Postgres: `extract(epoch from AGE(to_timestamp(...), createdAt)) / 60`.
- **Rastreamento Multi-Atendente (`LogTickets`)**: Num callcenter, o "Ticket 123" pode ter passado pela mão do "Atendente A", e depois transferido para o "Atendente B". Para o Dashboard do "Atendente B" não roubar (ou ser penalizado) pelos minutos gastos pelo "Atendente A", as queries dependem fundamentalmente de um `INNER JOIN "LogTickets" lt`. Só entra na estatística o tempo que o usuário específico deteve a custódia do ticket.

### 3. Estruturas de Dados
- Entidades Base: Nenhuma tabela nova isolada; esta é uma camada analítica e puramente Leitora (View-like).
- A engine se blinda contra SQL Injection ao usar a camada limpa de `replacements: { tenantId, userId, startDate, endDate }` oferecida pelo Sequelize na hora de envelopar a Raw Query.

### 4. Metadados e Configurações
- Por padrão, o painel não conta com abstração de Cache (ex: Redis). As páginas batem nos discos do Postgres em "Tempo Real" a cada carregamento de página do gestor.

---

## Módulo: `api-integration`

### 1. Fluxo de Controle
- **Inbound Headless**: Funciona como a ponte (REST API) que permite a sistemas de terceiros (CRMs, ERPs) enviarem requisições de disparo de mensagens pelo WhatsApp de forma autônoma, sem interface gráfica.
- **Desacoplamento por Fila (Redis)**: Ao bater no endpoint `sendMessageAPI`, o controller propositalmente não aguarda o protocolo do WhatsApp processar a mensagem. Ele empacota os dados e faz um `Queue.add("SendMessageAPI", newMessage)`. A requisição HTTP externa responde imediatamente com `200 OK`, livrando a porta. O trabalho pesado fica para um Worker de fundo, evitando timeout em integrações de grande volume.

### 2. Algoritmos e Lógica
- **Middlewares de Sessão (`req.APIAuth`)**: A API não expõe IDs crus na URL desprotegida. Um middleware antecessor quebra o Token Bearer (ou header) e acopla nativamente o `tenantId` e `sessionId` no objeto Request. O controller então verifica se a conta acessada confere com o dono do Token (`APIConfig?.sessionId !== sessionId`), prevenindo que um Token válido envie spam em nome de outro dispositivo do mesmo Tenant.
- **Desfibrilador de Conexão (`startSession`)**: O endpoint de start é uma sacada genial de resiliência. Permite que um script externo "acorde" ou reconecte o WhatsApp associado programaticamente caso perceba que a fila parou de andar, sem que um operador humano precise logar no painel administrativo.

### 3. Estruturas de Dados
- Entidade Principal: `ApiConfig` (Guarda o token e as credenciais Webhook).
- Polymorphic Payload: O objeto de disparo via API aceita anexos (`mediaUrl`) tanto como uma simples String URL (para o backend baixar de outro lugar) quanto via Form Multipart Data (Objeto Multer, onde o arquivo inteiro já subiu no buffer HTTP).

### 4. Metadados e Configurações
- A PK (Primary Key) da tabela `ApiConfigs` é UUID (ex: `e4d909c2-901b...`), o que impede o ataque de Enumeração (tentar deduzir o ID 2, ID 3 da API) por curiosos na web.

---

## Módulo: `tags`

### 1. Fluxo de Controle
- **CRUD e Categorização (`TagServices`)**: Gerencia etiquetas que podem ser anexadas a Contatos, Tickets, etc.
- **Marcação Automática (`autoTag`)**: Tags podem ser configuradas para aplicar-se de forma autônoma a determinadas entidades.

### 2. Algoritmos e Lógica
- **Tenant Isolation**: Assim como em outros módulos, as Tags estão estritamente vinculadas a um `tenantId` e não vazam entre empresas.

### 3. Estruturas de Dados
- Entidade Principal: `Tags`.
- Inclui propriedades visuais como `color` para renderização no Frontend.

### 4. Metadados e Configurações
- Status de ativação via `isActive`.

---

## Módulo: `auto-replies`

### 1. Fluxo de Controle
- **CRUD de Respostas (`AutoReplyServices`)**: Configuração de respostas automáticas em árvore ou passos.
- **Motor de Execução (`VerifyActionStepAutoReplyService`)**: Diferente do ChatFlow, as AutoReplies formam uma estrutura de respostas roteadas por ações e passos.
- **Validação com Celular Teste**: Existe a possibilidade de configurar `celularTeste` para verificar o funcionamento do bot sem afetar clientes reais.

### 2. Algoritmos e Lógica
- **Fluxo por Passos (`StepsReply`)**: A resposta não é uma string monolítica, mas uma relação `HasMany` com `StepsReply`, onde `initialStep` marca o ponto de entrada da conversa.

### 3. Estruturas de Dados
- Entidades Principais: `AutoReply`, `StepsReply`, `StepsReplyAction`.

### 4. Metadados e Configurações
- Integrado intimamente ao fluxo do `Ticket`, oferecendo I.V.R. básico.

---

## Módulo: `messages`

### 1. Fluxo de Controle
- **Gerenciamento Unificado (`MessageServices`)**: Ponto de concentração para todo o I/O textual e de mídia. Processa o status (`ack`) de "pendente" até "lido".
- **Mensagens de Sistema e Offline**: Serviços como `CreateMessageSystemService` e `CreateMessageOfflineService` são invocados quando o servidor precisa se comunicar diretamente, sem a intervenção de um humano, ou injetar avisos internos no histórico do Ticket.

### 2. Algoritmos e Lógica
- **Tratamento Multimídia (`mediaUrl` getter)**: O getter virtual intercepta a leitura do banco, prefixando o endereço estático com `BACKEND_URL:PROXY_PORT/public/` para que as imagens sejam imediatamente acessíveis ao frontend.
- **Processamento de Enquetes**: Suporte a envio estruturado de formulários e enquetes via coluna JSONB `pollData`.

### 3. Estruturas de Dados
- Entidade Principal: `Message`.
- Possui enumeradores restritos para `status` (pending, sended, received) e `sendType` (campaign, chat, external, schedule, bot, sync, API).

### 4. Metadados e Configurações
- Relaciona-se com `Ticket`, `Contact`, `Tenant` e opcionalmente suporta recursividade estrutural através de `quotedMsgId` (mensagem respondendo outra).

---

## Módulo: `super-admin`

### 1. Fluxo de Controle
- **Criação Nativa de Tenants (`AdminCreateTenantService`)**: Rotina onde os super administradores injetam novas empresas no sistema.
- **Listagens Globais (`AdminList...`)**: Serviços de listagem que sobrepõem o Tenant Isolation, com capacidade de visualizar Usuários, Canais e Configurações de todo o ecossistema.

### 2. Algoritmos e Lógica
- **Bypass Consciente**: Enquanto a aplicação majoritária é filtrada forçosamente pelo middleware de sessão, este módulo opera fora desse escopo para permitir a gestão macro da plataforma SaaS.
