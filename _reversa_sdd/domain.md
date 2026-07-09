# Domínio e Regras de Negócio

> 🟡 INFERIDO

## Glossário

- **Tenant**: A empresa ou organização cliente do SaaS. Tudo no sistema (exceto configurações globais do Super Admin) é isolado por `tenantId`.
- **Ticket**: A unidade central de atendimento. Representa uma conversa/sessão com um contato.
- **Contact**: O cliente final (lead ou usuário) que interage com a empresa via WhatsApp, Instagram, etc.
- **Queue (Fila)**: Um departamento ou setor para onde os tickets são roteados (ex: Vendas, Suporte).
- **ChatFlow / AutoReply**: A engine de chatbot (I.V.R. - Interactive Voice/Text Response) que responde automaticamente e roteia os tickets antes que um operador humano assuma.
- **Wbot**: A instância do processo do WhatsApp Web JS (Baileys) ou integração WABA/Messenger associada a um canal.
- **Campaign**: Disparo massivo de mensagens para listas de contatos com recursos anti-spam.

## Regras de Negócio Principais

### Autenticação e Multi-Tenancy
- **Isolamento Estrito**: Usuários só podem acessar dados do seu próprio `tenantId`.
- **Bloqueio de Tenant Inativo**: O login exige que o status do tenant seja "active". Se a empresa estiver suspensa, seus usuários não podem logar.
- **Cotas Limite**: A criação de usuários e conexões respeita um limite definido tanto de forma global `.env` (`USER_LIMIT`, `CONNECTIONS_LIMIT`) quanto de forma específica por Tenant (`Tenant.maxUsers`, `Tenant.maxConnections`).

### Ciclo de Vida do Ticket
- **Prevenção de Deleção de Usuário**: Não é permitido excluir fisicamente um usuário (`DeleteUserService`) se ele possuir tickets abertos. Os tickets precisam ser realocados ou fechados.
- **Fechamento Automático (Zumbis)**: Tickets sem interação há `daysToClose` dias são fechados automaticamente. (Atenção: Atualmente a query de settings de fechamento tem um vazamento global que ignora o `tenantId`).
- **Despedida**: Ao fechar um ticket, se o canal (`Whatsapp`) tiver `farewellMessage` configurada, uma mensagem final é enviada automatizada.

### Campanha e Disparos
- **Proteção Anti-Spam (A/B Testing)**: O envio de campanhas sorteia entre até 3 mensagens configuradas (`message1`, `message2`, `message3`) para evitar restrições heurísticas.
- **Horário Comercial**: O agendador de campanha transfere automaticamente os disparos programados fora da janela (08:00 às 20:00) para o dia seguinte, reduzindo banimentos.
- **Progressão Aritmética de Delay**: Campanhas utilizam um delay progressivo entre mensagens na fila Redis para não afogar a API do WhatsApp.

### Contatos e Mensagens
- **Higienização de Número**: Números de telefone perdem todos os caracteres não-numéricos antes de validação na API e gravação no banco.
- **Validação Ativa**: O sistema consulta diretamente a API da Meta/Baileys (`CheckIsValidContact`) no ato da criação para assegurar que a conta de WhatsApp existe.
