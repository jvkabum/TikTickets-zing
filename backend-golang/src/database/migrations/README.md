# Documentação de Migrações

## Migrações relacionadas ao protocolNumber

### 20240224001_add_protocolNumber_to_messages.ts
Esta migração adiciona uma nova coluna `protocolNumber` do tipo INTEGER à tabela `Messages` com valor padrão 0.

### 20240224002_alter_messages_protocolNumber.ts
Esta migração altera o tipo da coluna `protocolNumber` de INTEGER para STRING (VARCHAR) com valor padrão como string vazia.

## Solução de problemas

Se você encontrar o erro `ERROR: column "protocolNumber" of relation "Messages" does not exist` durante a execução da migração 20240224002_alter_messages_protocolNumber, significa que a migração 20240224001_add_protocolNumber_to_messages não foi executada antes. 

Certifique-se de executar as migrações na ordem correta:

```bash
npx sequelize-cli db:migrate --to 20240224001_add_protocolNumber_to_messages.js
npx sequelize-cli db:migrate --to 20240224002_alter_messages_protocolNumber.js
```

Ou simplesmente execute todas as migrações pendentes:

```bash
npx sequelize-cli db:migrate
``` 