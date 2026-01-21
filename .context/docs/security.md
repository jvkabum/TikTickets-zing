# Segurança e Conformidade

## Isolamento de Dados (Multi-Tenancy)
- O isolamento é garantido via `tenantId` em todas as queries do Sequelize.
- Middleware de autenticação valida se o usuário tem acesso ao tenant solicitado.

## Autenticação e Autorização
- **JWT (JSON Web Tokens)**: Uso de tokens para sessões de API.
- **Níveis de Acesso**: Admin, Atendente.

## Segurança do WhatsApp
- **Puppeteer Sandbox**: O Chromium roda com sandbox ativado sempre que possível.
- **Armazenamento de Sessões**: As pastas em `.wwebjs_auth` são protegidas por permissões de sistema.

## Melhores Práticas
- Uso de variáveis de ambiente (`.env`) para chaves e senhas.
- Sanitização de inputs para evitar SQL Injection via Sequelize.
- Rate limiting nas rotas críticas.
