# Habilidade: Auditoria de Segurança (Security Audit)

Checklist de segurança para proteger o sistema TikTickets-zing contra vazamento de dados e vulnerabilidades.

## Áreas de Vigilância
1. **Isolamento de Dados (Multi-Tenancy)**:
   - Toda query SQL/Sequelize deve conter cláusula `where: { tenantId }`.
   - APIs não devem expor segredos ou IDs sensíveis de outros tenants.
2. **Autenticação e Autorização**:
   - Validar expiração de JWT.
   - Verificar se usuários "normais" não acessam rotas de Admin.
3. **Segurança do Puppeteer**:
   - Manter sandbox ativo sempre que possível.
   - Limpar dados sensíveis de pastas de sessão expiradas.
4. **Vulnerabilidades de Dependência**:
   - Evitar o uso de pacotes obsoletos.
   - Monitorar alertas do `npm audit`.

## Processo de Auditoria
- Revisar middlewares de autenticação (`isAuth.ts`).
- Verificar se existem hardcoded passwords ou tokens no código (usar sempre `.env`).
- Testar CSRF e excesso de exposição de erros do banco para o cliente final.

## Axioma de Segurança
"Em um sistema Multi-Tenant, a segurança de um é a segurança de todos. O isolamento de dados é o nosso pilar mais forte."
