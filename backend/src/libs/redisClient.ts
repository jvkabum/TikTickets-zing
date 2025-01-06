import Redis from "ioredis";
import { Request, Response } from "express"; 
import { getIO } from "../libs/socket"; 
import AppError from "../errors/AppError"; 

// Cria uma nova instância do cliente Redis
const redisClient = new Redis({
  port: Number(process.env.IO_REDIS_PORT), // Porta do Redis
  host: process.env.IO_REDIS_SERVER, // Host do servidor Redis
  db: Number(process.env.IO_REDIS_DB_SESSION) || 9, // Seleciona o banco de dados do Redis
  password: process.env.IO_REDIS_PASSWORD || undefined // Senha do Redis, se houver
});

// Função para obter um valor do Redis
export const getValue = (key: string) => {
  return new Promise((resolve, reject) => {
    redisClient.get(key, (err, value): any => { // Obtém o valor associado à chave
      if (err) return reject(err); // Lança erro se ocorrer um problema
      let data: any; // Variável para armazenar os dados
      if (value) {
        try {
          data = JSON.parse(value || ""); // Tenta parsear o valor como JSON
        } catch (error) {
          data = String(value); // Se falhar, converte o valor para string
        }
      } else {
        data = value; // Se não houver valor, atribui undefined
      }
      return resolve(data); // Retorna os dados
    });
  });
};

// Função para definir um valor no Redis
export const setValue = (key: string, value: any) => {
  return new Promise((resolve, reject) => {
    let stringfy: any; // Variável para armazenar o valor como string
    if (typeof value === "object") {
      stringfy = JSON.stringify(value); // Converte o objeto para string
    } else {
      stringfy = String(value); // Converte o valor para string
    }
    redisClient.set(key, stringfy, err => { // Define o valor associado à chave
      if (err) return reject(err); // Lança erro se ocorrer um problema
      return resolve(stringfy); // Retorna o valor como string
    });
  });
};

// Função para remover um valor do Redis
export const removeValue = (key: string) => {
  return new Promise((resolve, reject) => {
    redisClient.del(key, err => { // Remove o valor associado à chave
      if (err) return reject(err); // Lança erro se ocorrer um problema
      return resolve(true); // Retorna true se a remoção for bem-sucedida
    });
  });
};
