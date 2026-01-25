#!/bin/sh

echo "--> Iniciando processo de deploy..."

# Garante que as migrações rodem antes da aplicação subir
echo "--> Rodando Database Migrations..."
npx sequelize db:migrate

# Roda os seeds (popula o banco inicialmente)
echo "--> Rodando Database Seeds..."
npx sequelize db:seed:all

# Inicia o servidor
echo "--> Iniciando aplicação Backend..."
pm2-docker start ./dist/server.js
