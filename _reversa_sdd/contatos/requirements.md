# Contatos

> Template do arquivo `requirements.md`. Foca no QUE a unit faz, não no como.

## Visão Geral
Módulo raiz do mapeamento Omnichannel. Retém a identidade de todos os clientes com os quais o sistema conversa, suportando WhatsApp, Instagram e Telegram dentro do mesmo escopo de Banco de Dados.

## Responsabilidades
- Criar, exibir e editar perfis das agendas de clientes.
- Realizar validação ativa e higienização formatada de números de telefone com integração direta com a Meta/Baileys.
- Fornecer endpoints de Upload (Planilhas Excel/CSV) e Exportação para rotinas administrativas massivas.
- Armazenar campos personalizados dinamicamente (Custom Fields).

## Regras de Negócio
- Todo contato inserido manualmente e editado sofre higienização de RegEx, retendo exclusivamente algarismos numéricos e formatando a DDI para evitar colisões no BD 🟢
- O sistema precisa consultar em tempo real a API do provedor (WhatsappWebJS / Baileys) para autenticar que o contato de fato é registrável no app antes de prosseguir com a inserção 🟢
- Se houver `profilePicUrl` na nuvem da Meta, ele a puxa como Avatar nativamente 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | CRUD de Contatos e Agenda | Must | Criação, Listagem Paginada e Edição de nomes, e-mails e anexos customizados. |
| RF-02 | Verificação Ativa de Conta (Baileys) | Must | Rejeitar contatos cujo número não seja reconhecido pela API do WhatsApp integrada àquele Tenant. |
| RF-03 | Importação de Planilhas | Should | Uma rota com `Multer` que leia arquivos `.xlsx` e ingira grandes lotes contornando gargalos. |
| RF-04 | Exportação XLSX | Should | Produção via Buffer/Streams de tabelas exportadas para consumo pelo gestor da empresa. |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Confiabilidade (Sanitização) | Todos os inputs sofrem substituição via RegEx `/\D/g` | Controllers & Models | 🟢 |
| Escalabilidade | Sync Automático roda em rotina passiva (`syncContacts`) | Trabalhadores de fundo | 🟢 |

> Inferido a partir do código. Validar com equipe de operações.

## Critérios de Aceitação

```gherkin
Dado que o operador insere manualmente o número "(11) 9.8888-7777"
Quando o controller armazena no BD
Então o sistema retém "5511988887777", atesta que o contato WhatsApp existe e faz o download de seu Avatar
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Agenda Base e Higienização | Must | Sem contatos normalizados, os bots perdem o alvo ou dão crash por erro de sintaxe. |
| Importação e Exportação | Should | Funções cruciais para onboarding de novos clientes (Tenant Vendas). |

> Prioridade inferida por frequência de chamada e posição na cadeia de dependências.

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `backend/src/controllers/ContactController.ts` | Base e Importação | 🟢 |
| `backend/src/services/ContactServices/*` | Validação WebJS e Exportação | 🟢 |
