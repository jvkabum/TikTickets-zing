# Respostas Rápidas (Fast Replies)

> Template do arquivo `requirements.md`. Foca no QUE a unit faz, não no como.

## Visão Geral
Gerencia os atalhos textuais utilizados pelos operadores. Permite a configuração de gatilhos (ex: `#saudacao`) que se expandem em mensagens ricas incluindo textos padronizados e múltiplas mídias anexadas, economizando tempo no front-line de atendimento.

## Responsabilidades
- Criar e listar as respostas pré-definidas vinculadas exclusivamente a um Tenant.
- Gerenciar uploads de arquivos atrelados à resposta rápida via Multer.
- Fornecer endpoint cirúrgico para deleção individual de imagens anexadas sem perder o texto atrelado.

## Regras de Negócio
- A coluna de mídias só pode aceitar Strings num formato Array `["url1", "url2"]`, protegido pela ORM 🟢
- Isolamento restrito por Tenant 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | CRUD de Atalhos | Must | O operador cria gatilhos (`key`) atrelados a textos completos (`message`). |
| RF-02 | Anexo Multimídia Multipart | Should | A rota HTTP deve aceitar o upload binário no mesmo payload de texto. |
| RF-03 | Deleção Segregada de Arquivo | Could | Rota especialista `deleteImage` que remova o link JSON do array da resposta sem invalidar o resto. |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `backend/src/controllers/FastReplyController.ts` | Base e Multer Upload | 🟢 |
