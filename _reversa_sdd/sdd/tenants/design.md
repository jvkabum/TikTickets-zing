# Tenants (Empresas), Design Técnico

## Interface

Para endpoints HTTP:

| Método | Caminho | Entrada | Saída | Status codes |
|--------|---------|---------|-------|--------------|
| GET | `/tenants` | `QueryParams` | `[Tenant]` | 200, 401 |
| POST | `/tenants` | `TenantCreate` | `Tenant` | 201, 401, 400 |
| PUT | `/tenants/:id` | `TenantUpdate` | `Tenant` | 200, 404, 401 |
| DELETE | `/tenants/:id` | `id: string` | `200 OK` | 200, 404, 401 |
| PUT | `/tenants/:id/business-hours` | `BusinessHoursUpdate` | `Tenant` | 200, 400 |
| PUT | `/tenants/:id/message-business-hours` | `MessageUpdate` | `Tenant` | 200, 400 |

## Fluxo Principal
1. **Verificação de Limites:** Em rotas de criação de usuários e de canais (whatsapp), o backend realiza um `count()` na tabela correspondente associada ao `tenantId`.
2. O sistema compara o valor com `Tenant.maxUsers` ou `Tenant.maxConnections`.
3. Se o limite for alcançado, a requisição sofre *early return* com código HTTP 400 ou 403 e a mensagem de erro.

## Fluxos Alternativos
- **Atualização de Horários:** O Payload JSON contendo os dias da semana e 4 slots de horário (hr1 a hr4) passa pelo middleware Yup, que aplica a validação regex via date-fns (`isMatch(time, 'HH:mm')`).
- **Validação Global de Tenant Inativo:** Nos middlewares de autenticação, o `Tenant.status` é lido. Se for diferente de `active`, bloqueia tudo.

## Dependências
- `Yup / date-fns`: Validação estrita do payload de datas/horários para garantir que a inserção no banco obedeça a tipagem estrita, mesmo o campo sendo JSONB.
- `PostgreSQL (JSONB)`: Usa nativamente o engine JSONB do Postgres para evitar a criação de tabelas filho complexas só para expedientes.

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Expediente armazenado em JSONB | Model `Tenant.ts` (`businessHours`) | 🟢 |
| Hard block em nível de Middleware de Rotas (Auth) | Middleware valida tenant em tempo de requisição | 🟢 |

## Estado Interno
- **Status da Empresa:** Controla se toda a conta e todos os usuários conseguem acessar o sistema.
- **Limites (Quotas):** Os campos `maxUsers` e `maxConnections` atuam como semáforos estáticos lidos a cada tentativa de recurso novo.

## Riscos e Lacunas
- 🟡 Qual a consequência em tempo real para um Tenant que estava ativo e subitamente é "inativado" pelo Super Admin? Os JWTs já emitidos que duram minutos ou horas continuam válidos, ou a inativação derruba as sessões online via Socket na mesma hora?
