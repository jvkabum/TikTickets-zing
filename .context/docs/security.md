---
type: doc
name: security
description: Políticas de segurança, autenticação, gerenciamento de segredos e requisitos de conformidade
category: security
generated: 2026-01-23
status: filled
scaffoldVersion: "2.0.0"
---

# Notas de Segurança e Conformidade

Este documento descreve as diretrizes, tecnologias e práticas empregadas no **TikTickets-zing** para garantir a integridade dos dados, a privacidade dos usuários e a segurança das comunicações.

## Segurança e Conformidade

O projeto adota uma postura de segurança em camadas, focando especialmente no isolamento rigoroso de dados em ambiente multi-tenancy. As principais guardas de segurança incluem:

- **Isolamento de Dados (Tenant Isolation)**: Cada requisição ao backend é validada contra o `tenantId` associado ao usuário autenticado. Nenhuma operação de leitura ou escrita deve vazar dados entre empresas diferentes.
- **Sanitização de Inputs**: Todas as entradas do usuário são tratadas para prevenir ataques de SQL Injection e Cross-Site Scripting (XSS).
- **Tratamento de Mídias**: Arquivos recebidos via WhatsApp são armazenados em diretórios controlados, com verificação de tipo de arquivo para evitar a execução de scripts maliciosos.

## Autenticação e Autorização

O sistema utiliza um modelo de autenticação baseado em **JSON Web Tokens (JWT)**:

- **Identidade**: O login é realizado via e-mail e senha (armazenada com hashing **bcrypt**).
- **Sessão**: Após a autenticação, o servidor emite um par de tokens (Access Token e Refresh Token). O Access Token deve ser enviado no header `Authorization: Bearer <token>` em todas as requisições protegidas.
- **Middleware `isAuth`**: A maioria das rotas do backend utiliza o middleware `isAuth`, que valida o token, extrai o `userId` e o `tenantId`, e os anexa ao objeto de requisição para uso posterior nos serviços.
- **Modelo de Permissões (RBAC)**: O sistema diferencia entre perfis `admin` (acesso total às configurações do tenant) e `user` (acesso restrito ao atendimento e visualização de seus próprios tickets).

## Segredos e Dados Sensíveis

O gerenciamento de informações sensíveis é realizado seguindo as melhores práticas da indústria:

- **Variáveis de Ambiente (`.env`)**: Configurações críticas como credenciais de banco de dados, chaves secretas do JWT, chaves de API externas (360Dialog) e URLs de serviços são armazenadas exclusivamente em arquivos `.env`, que nunca devem ser versionados no Git.
- **Criptografia**: Senhas de usuários e, opcionalmente, tokens de API de terceiros são criptografados antes da persistência no banco de dados.
- **Rotação de Segredos**: Recomenda-se a rotação periódica das chaves JWT e credenciais de banco de dados em ambientes de produção.
- **Logs de Auditoria**: Operações críticas de administração e mudanças de permissão são registradas para fins de auditoria e rastreabilidade.

## Conformidade e Políticas

Embora o sistema seja flexível, os administradores devem estar cientes de:

- **LGPD (Lei Geral de Proteção de Dados)**: O TikTickets-zing fornece ferramentas para exclusão de dados de contatos e anonimização, auxiliando na conformidade com a legislação brasileira.
- **Políticas de Spam**: O uso da ferramenta para envio de mensagens em massa deve respeitar as políticas de termos de uso do WhatsApp para evitar o banimento de números.

## Resposta a Incidentes

Em caso de suspeita de vulnerabilidade ou vazamento de dados:

1. **Notificação**: Os administradores master devem ser notificados imediatamente.
2. **Triagem**: Análise de logs do sistema e do banco de dados para identificar a origem e o escopo da violação.
3. **Contenção**: Revogação imediata de tokens JWT comprometidos e alteração de segredos no arquivo `.env` se necessário.
4. **Rescaldo**: Atualização do código e das políticas de segurança para prevenir recorrências.

## Recursos Relacionados
- [architecture.md](./architecture.md)
- [api.md](./api.md)
- [tooling.md](./tooling.md)
