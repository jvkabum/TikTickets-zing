# Respostas Rápidas, Tarefas de Implementação

> Template do arquivo `tasks.md`. Foca em uma sequência de tarefas executáveis para reimplementar a unit a partir do legado, com rastreabilidade ao código original.

## Tarefas

- [ ] T-01, Gestor CRUD e Validação JSON
  - Origem no legado: `backend/src/models/FastReply.ts`
  - Critério de pronto: Cadastrar atalhos blindando o banco para aceitar apenas um array puro no campo `medias`.
  - Confiança: 🟢

- [ ] T-02, Endpoint Multipart
  - Origem no legado: `backend/src/controllers/FastReplyController.ts` (store)
  - Critério de pronto: Implementar o processamento de Multer DiskStorage para escrever arquivos localmente (`public/`) no ato da request de criação.
  - Confiança: 🟢

- [ ] T-03, Deleção Parcial de Mídia
  - Origem no legado: `backend/src/controllers/FastReplyController.ts` (deleteImage)
  - Critério de pronto: Serviço que receba o link antigo, varra o array JSON gravado, purgue a string e limpe o arquivo físico correspondente.
  - Confiança: 🟢
