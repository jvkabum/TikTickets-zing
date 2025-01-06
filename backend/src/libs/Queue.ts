/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import Queue from "bull"; 
import QueueListeners from "./QueueListeners"; 
import * as jobs from "../jobs/Index"; 

// Cria uma lista de filas a partir dos jobs importados
const queues = Object.values(jobs).map((job: any) => ({
  bull: new Queue(job.key, { // Cria uma nova fila Bull com a chave do job
    redis: {
      host: process.env.IO_REDIS_SERVER, // Host do servidor Redis
      port: +(process.env.IO_REDIS_PORT || "6379"), // Porta do servidor Redis, padrão 6379
      password: process.env.IO_REDIS_PASSWORD || undefined, // Senha do Redis, se houver
      db: 3 // Seleciona o banco de dados 3 do Redis
    }
  }),
  name: job.key, // Nome da fila
  handle: job.handle, // Função de manipulação do job
  options: job.options // Opções do job
}));

export default {
  queues, // Exporta as filas
  async add(name: string, data: any | any[]) { // Função para adicionar um job à fila
    const queue = this.queues.find((q: any) => q.name === name); // Busca a fila pelo nome
    if (!queue) {
      throw new Error(`Queue ${name} not exists`); // Lança erro se a fila não existir
    }
    if (Array.isArray(data)) { // Verifica se os dados são um array
      const parsedJobs = data.map((jobData: any) => {
        return {
          data: jobData, // Dados do job
          opts: {
            ...queue.options, // Opções da fila
            ...jobData?.options // Opções específicas do job
          }
        };
      });
      return queue.bull.addBulk(parsedJobs); // Adiciona múltiplos jobs à fila
    }
    return queue.bull.add(data, { ...queue.options, ...data.options }); // Adiciona um único job à fila
  },
  process() { // Função para processar os jobs nas filas
    return this.queues.forEach(queue => {
      queue.bull.process(200, queue.handle); // Processa até 200 jobs de cada vez

      // Registra ouvintes de eventos para a fila
      queue.bull
        .on("active", QueueListeners.onActive) // Evento quando um job se torna ativo
        .on("error", QueueListeners.onError) // Evento de erro
        .on("waiting", QueueListeners.onWaiting) // Evento quando um job está aguardando
        .on("completed", QueueListeners.onCompleted) // Evento quando um job é concluído
        .on("stalled", QueueListeners.onStalled) // Evento quando um job é travado
        .on("failed", QueueListeners.onFailed) // Evento quando um job falha
        .on("cleaned", QueueListeners.onClean) // Evento quando um job é limpo
        .on("removed", QueueListeners.onRemoved); // Evento quando um job é removido
    });
  }
};
