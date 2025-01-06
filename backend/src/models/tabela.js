/* eslint-disable no-unused-vars */
const fs = require('fs');
const path = require('path');
const { FastReply } = require('../models');

// ====================
// Funções Auxiliares
// ====================

// Função para salvar o arquivo no sistema de arquivos
function saveFile(fileContent, fileName, directory) {
  const dirPath = path.join(__dirname, directory); // Cria o caminho do diretório onde o arquivo será salvo
  if (!fs.existsSync(dirPath)) { // Verifica se o diretório já existe
    fs.mkdirSync(dirPath, { recursive: true }); // Se não existir, cria o diretório (e subdiretórios, se necessário)
  }
  const filePath = path.join(dirPath, fileName); // Cria o caminho completo do arquivo
  fs.writeFileSync(filePath, fileContent); // Salva o conteúdo do arquivo no sistema de arquivos
  return filePath; // Retorna o caminho do arquivo salvo
}

// Função para inserir o caminho do arquivo na tabela
async function insertFilePath(filePath) {
  await FastReply.create({ file_path: filePath }); // Insere o caminho do arquivo na tabela 'FastReply'
}

// ====================
// Exemplo de Uso
// ====================

const fileContent = Buffer.from("Conteúdo do arquivo"); // Cria um buffer com o conteúdo do arquivo
const fileName = "example.txt"; // Define o nome do arquivo
const directory = "backend/public"; // Define o diretório onde o arquivo será salvo

(async () => {
  // Salvar o arquivo
  const filePath = saveFile(fileContent, fileName, directory); // Chama a função para salvar o arquivo

  // Inserir o caminho do arquivo na tabela
  await insertFilePath(filePath); // Chama a função para inserir o caminho do arquivo na tabela

  console.log(`Arquivo salvo em: ${filePath}`); // Exibe o caminho do arquivo salvo no console
})();
