/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import Queue from "bull"; 
import QueueListeners from "./QueueListeners"; 
import * as jobs from "../jobs/Index"; 

// Cria uma lista de filas a partir dos jobs importados
const queues = Object.values(jobs).map((job: any) => ({
  bull: new Queue(job.key, {
    redis: {
      host: process.env.IO_REDIS_SERVER,
      port: +(process.env.IO_REDIS_PORT || "6379"),
      password: process.env.IO_REDIS_PASSWORD || undefined,
      db: 3
    },
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'fixed',
        delay: 60000
      },
      removeOnComplete: true,
      removeOnFail: false
    },
    limiter: {
      max: 200, // Máximo de jobs por intervalo
      duration: 1000 // Intervalo em ms (1 segundo)
    }
  }),
  name: job.key,
  handle: job.handle,
  options: job.options
}));

export default {
  queues,
  async add(name: string, data: any | any[]) {
    const queue = this.queues.find((q: any) => q.name === name);
    if (!queue) {
      throw new Error(`Queue ${name} not exists`);
    }
    if (Array.isArray(data)) {
      const parsedJobs = data.map((jobData: any) => {
        return {
          data: jobData,
          opts: {
            ...queue.options,
            ...jobData?.options
          }
        };
      });
      return queue.bull.addBulk(parsedJobs);
    }
    return queue.bull.add(data, { ...queue.options, ...data.options });
  },
  process() {
    return this.queues.forEach(queue => {
      queue.bull.process(200, queue.handle); // Mantendo 200 jobs simultâneos

      queue.bull
        .on("active", QueueListeners.onActive)
        .on("error", QueueListeners.onError)
        .on("waiting", QueueListeners.onWaiting)
        .on("completed", QueueListeners.onCompleted)
        .on("stalled", QueueListeners.onStalled)
        .on("failed", QueueListeners.onFailed)
        .on("cleaned", QueueListeners.onClean)
        .on("removed", QueueListeners.onRemoved);
    });
  }
};
