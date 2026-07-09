# Requirements: Módulo de Tenants (Empresas/Inquilinos)

> Identificador: `002-tenants`
> Data: `2026-07-09`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA

## 1. Resumo executivo

O módulo gerencia as entidades corporativas (empresas/inquilinos) do sistema SaaS. Provê rotinas para configuração de horário de atendimento, cotas de usuários e canais simultâneos, além de agir como a fronteira absoluta de isolamento de dados no banco de dados para evitar vazamento entre diferentes empresas.

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/architecture.md#Multi-Tenancy` | Isolamento via banco de dados compartilhado com chave estrangeira `tenantId`. | 🟢 |
| `_reversa_sdd/code-analysis.md#Módulo:tenants` | CRUD por superadmins, atualização de expedientes e isolamento de cotas de usuários (`maxUsers`). | 🟢 |
| `_reversa_sdd/data-dictionary.md#Módulo:tenants`| Tabela `Tenant` contém `businessHours`, `maxConnections` e o `status` global. | 🟢 |

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Administrador (Tenant) | Configurar expediente | Define as faixas de horário "HH:mm" nas quais a empresa atende via WhatsApp e cadastra a mensagem de ausência. |
| Super Admin (SaaS) | Gerir clientes | Ativa, suspende ou cadastra novas contas empresariais na plataforma, definindo limites de licença (usuários e WhatsApps). |
| Sistema (Workers) | Aplicar limites | Rejeita logins ou recusa cadastro de novas conexões no Baileys se a cota do Tenant for ultrapassada. |

## 4. Regras de negócio novas ou alteradas

1. **RN-01:** O campo de horários (`businessHours`) só aceita strings rigidamente formatadas no padrão `"HH:mm"`. 🟢
2. **RN-02:** Um `Tenant` possui um status global (padrão: `active`). Se inativado, toda a operação da empresa é barrada nos middlewares. 🟢
3. **RN-03:** Todas as tabelas que lidam com dados sensíveis (Usuários, Tickets, Contatos) obrigatoriamente devem assinalar seu dono através da FK `tenantId`. 🟢
4. **RN-04:** As cotas de `maxUsers` limitam a criação de contas de operador. `maxConnections` limitam quantas sessões WhatsApp a empresa pode atrelar. 🟢

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | CRUD de Tenants | Must | Apenas perfil `super-admin` visualiza e edita configurações base de Tenants. | 🟢 |
| RF-02 | Configuração de Horário Comercial | Must | Painel salva JSONB com os expedientes da semana. | 🟢 |
| RF-03 | Mensagem Fora de Expediente | Must | Salva string que será enviada pelo bot a clientes que chamarem à noite/finais de semana. | 🟢 |
| RF-04 | Validação de Limites | Must | Ao criar usuário/canal, o backend bloqueia a operação se o `count` atual for igual ou maior que as cotas da empresa. | 🟢 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Segurança | Isolamento Estrito de Queries | Toda query em tabelas de domínio do negócio injeta automaticamente a restrição `where: { tenantId }`. | 🟢 |
| Desempenho | Armazenamento de Expediente | Uso de campo JSONB para os horários reduz joins e acelera leitura na checagem de expediente do bot. | 🟢 |

## 7. Critérios de Aceitação

```gherkin
Cenário: Restrição de cota de usuário atingida
  Dado que o Tenant "Empresa A" possui "maxUsers" igual a 5
  E já existem 5 usuários cadastrados com esse "tenantId"
  Quando um Administrador tenta cadastrar o 6º usuário
  Então o sistema retorna erro de violação de limite
  E bloqueia a criação do registro no banco

Cenário: Expediente validado corretamente
  Dado que um Admin informa um novo quadro de horários
  Quando o formato contiver "08:00" a "18:00"
  Então o payload é validado (Yup via date-fns) e salvo no banco
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01 (CRUD Base) | Must | Sustentação do modelo de venda SaaS da aplicação. |
| RF-02 (Horários) | Must | Bloqueia falsas expectativas de clientes quando a empresa está fechada. |
| RF-04 (Cotas) | Must | O modelo de precificação do software depende estritamente das travas lógicas. |

## 9. Esclarecimentos

> Nenhuma sessão de dúvidas registrada ainda. Rode `/reversa-clarify` quando houver `[DÚVIDA]` pendente.

## 10. Lacunas

- Nenhuma lacuna crítica de conhecimento identificada.

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-09 | Versão inicial gerada por `/reversa-writer` | reversa |
