# Contatos, Design Técnico

> Template do arquivo `design.md`. Foca no COMO a unit é construída, com base no código legado lido.

## Interface

| Método | Caminho | Entrada | Saída | Status codes |
|--------|---------|---------|-------|--------------|
| GET | `/contacts` | `searchNumber`, `searchParam`, `page` | `Contact[]` | 200, 401 |
| POST | `/contacts` | `ContactCreatePayload` | `Contact` Completo | 201, 400 |
| POST | `/contacts/upload` | Form Multipart Data (Planilha `.xlsx`) | Array processado de contatos importados | 200, 400 |
| GET | `/contacts/export` | Params | Arquivo em Buffer FileSystem | 200, 400 |

## Fluxo Principal
1. O Front-end bate na API base.
2. A injeção retira máscara.
3. Se o canal ativo for WhatsApp (wbot), o Helper `CheckIsValidContact` intercepta a chamada fazendo proxy até o container que roda o Baileys/Puppeteer para "perguntar" se o número existe na agenda do WhatsApp da plataforma.
4. Salva a resposta no modelo base `Contact` e opcionalmente expande no `ContactCustomField`.

## Fluxos Alternativos
- **SyncContacts:** Rotina paralela executada periodicamente que instrui o bot de interface (Wbot) a iterar sobre toda a agenda física do aparelho vinculado ao QR Code, trazendo os dados para a plataforma central.

## Dependências
- **Lib XLSX NodeJS:** Empregada intensamente para ler e produzir buffers nas operações de I/O de Upload e Export.
- **Canal Wbot (Baileys/WhatsappWebJS):** Estreitamente acoplado no momento da validação cruzada.

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Atributos arbitrários em tabela segregada (ContactCustomField) | Tabela filha para evitar DDL gigante | 🟢 |
| Sanitização preemptiva do backend (Regex /\D/g) | Controllers/Services | 🟢 |

## Estado Interno
As entidades Contact são quase estáticas, funcionando como catálogo.

## Riscos e Lacunas
- 🔴 Se o provedor Meta cair ou o cliente desconectar o QR code de seu aparelho, a operação vital de criação de contato ficará bloqueada (visto que depende do Proxy do WhatsApp Ativo para validação). Tal fragilidade exige fallback arquitetural urgente (permitir Bypass da verificação se não houver Socket).
