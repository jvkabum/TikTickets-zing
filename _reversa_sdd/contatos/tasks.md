# Contatos, Tarefas de Implementação

> Template do arquivo `tasks.md`. Foca em uma sequência de tarefas executáveis para reimplementar a unit a partir do legado, com rastreabilidade ao código original.

## Pré-requisitos
- [ ] O modelo e infraestrutura do Canal/Whatsapp já deve estar desenhado ou mockado, visando sustentar as chamadas cruzadas de validação.

## Tarefas

- [ ] T-01, CRUD Base e Sanitização
  - Origem no legado: `backend/src/controllers/ContactController.ts`
  - Critério de pronto: Endpoint de salvamento devendo obrigatóriamente purificar qualquer caracter alfanumérico não-dígito do número do cliente, salvando em padrão de país (`55`).
  - Confiança: 🟢

- [ ] T-02, Custom Fields e Relacionamento
  - Origem no legado: Estrutura relacional do Sequelize (1:N)
  - Critério de pronto: Garantir que qualquer chave `extraInfo` seja transacionada em lote para a tabela auxiliar `ContactCustomField`.
  - Confiança: 🟢

- [ ] T-03, Importação XLSX (Upload)
  - Origem no legado: Rota `/upload` do controller.
  - Critério de pronto: Receber form-data contendo o binário, invocar middleware de parsing e inserir lotes (`bulkCreate` preferencialmente) lidando com registros duplicados.
  - Confiança: 🟢

- [ ] T-04, Acoplamento Wbot para Validação
  - Origem no legado: Helper `CheckIsValidContact` ou Service afim.
  - Critério de pronto: Disparar um comando passivo para o microserviço Baileys antes do Insert no Banco para testar a validade da conta. Fallback requerido em caso de desconexão.
  - Confiança: 🟢

## Tarefas de Teste
- [ ] TT-01, Enviar número totalmente desconfigurado "+55 (11) 988A!8-5.5.5-2" e verificar se o sistema converte assertivamente para "551198885552".
- [ ] TT-02, Subir planilha com 10.000 linhas e atestar OOM (Out of Memory) e tempo de transação (Timeout Nodejs).

## Ordem Sugerida
1. T-01 e T-02, criando a base bruta de informações que as Campanhas e os Tickets usarão como alvo.
2. T-04
3. T-03

## Lacunas Pendentes (🔴)
- Avaliar a migração para a nova arquitetura Serverless: Fazer upload de arquivos imensos em Memória na função AWS Lambda ou subir pro S3 primeiro (Signed URL)?
