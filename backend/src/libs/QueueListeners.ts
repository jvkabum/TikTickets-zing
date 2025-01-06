/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Job } from "bull";
import axios from "axios";

/* eslint-disable no-use-before-define */
/* eslint-disable no-shadow */

// ====================
// Definição dos Tipos
// ====================

export enum ExecutionType {
  DELAY = "delay", // Tipo de execução: atraso
  REPEAT = "repeat" // Tipo de execução: repetição
}

export type ExecutionOption = {
  type: ExecutionType; // Tipo de execução
  value: string | number; // Valor associado à execução
  // start date and end date only supported for ExecutionType.REPEAT
  startDate?: string; // Data de início (opcional)
  endDate?: string; // Data de fim (opcional)
};

export type JobConfig = {
  executionOptions: ExecutionOption; // Opções de execução do job
  retryOptions?: RetryOptions; // Opções de repetição do job
};

export type RetryOptions = {
  attempts: number; // Número de tentativas
  fallbackUrl?: string; // URL de fallback (opcional)
};

export type RabbitMQJob = {
  data: any; // Dados do job
  queue: string; // Nome da fila
};

// ====================
// Classe QueueListener
// ====================
export default class QueueListener {
  static onError(err: Error): void {
    console.error(err); // Registra erro no console
  }

  static onWaiting(jobId: string): void {
    // console.log(`Job with ID ${jobId} is waiting`); // (Comentado, não utilizado)
  }

  static onActive(
    job: Job<JobConfig>, // Job que está ativo
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    jobPromise: Promise<Job<JobConfig>> // Promessa do job
  ): void {
    // console.log(`Job with ID ${job.id} active`); // (Comentado, não utilizado)
  }

  static onStalled(job: Job<JobConfig>): void {
    // console.log(`Job with ID ${job.id} stalled`); // (Comentado, não utilizado)
    // TODO: log stalled request. These requests are most probably double processed.
  }

  static onCompleted(job: Job<JobConfig>, result: any): void {
    // console.log(`Job with ID ${job.id} completed`); // (Comentado, não utilizado)
    // console.log({ result }); // (Comentado, não utilizado)
  }

  // eslint-disable-next-line consistent-return
  static onFailed(job: Job<JobConfig>, err: Error) {
    console.log(
      `Job with ID ${job.id} failed. Attempts made ${job.attemptsMade}. Max attempts ${job.opts.attempts}`,
      err // Registra erro se o job falhar
    );
    if (job.opts.attempts && job.attemptsMade === job.opts.attempts) {
      // Se o número máximo de tentativas for alcançado, executa a lógica de fallback.
      const jobConfig = job.data; // Obtém a configuração do job
      if (jobConfig.retryOptions?.fallbackUrl) {
        const apiBody = {
          ...jobConfig,
          id: job.id,
          error: err // Adiciona informações de erro ao corpo da requisição
        };
        // console.log("Sending fallback hook"); // (Comentado, não utilizado)
        return axios.post(jobConfig.retryOptions.fallbackUrl, apiBody); // Envia requisição de fallback
      }
      // Se não houver fallback, notifica o administrador que o job falhou repetidamente
      const {
        id: jobId,
        data: jobData,
        name: jobName,
        opts: jobOpts,
        timestamp
      } = job; // Extrai informações do job
      const subject = `Job - ${jobId} failed ${job.attemptsMade} times`; // Assunto do email
      const mailBody = `
                    <h1> Job Failed Repeatedly </h1>
                    <div>
                        <p> Job ID : ${jobId} </p>
                        <p> Job Name: ${jobName} </p>
                        <p> Timestamp: ${timestamp} </p
                        <div> <p> JobData : </p>
                        <code> ${JSON.stringify(jobData)} </code> </div>
                        <div> <p> JobOptions : </p>
                        <code> ${JSON.stringify(jobOpts)} </code> </div>
                    </div>
               `;
      // return Mailer.sendMail(mailBody, subject); // (Comentado, não utilizado)
      console.error("On Failed", subject, mailBody); // Registra erro no console
    }
  }

  static onClean(jobs: Job<JobConfig>[], type: string): void {
    // console.log(`Jobs cleaned ${jobs.length} - ${type}`); // (Comentado, não utilizado)
    // console.log(JSON.stringify(jobs)); // (Comentado, não utilizado)
  }

  static onRemoved(job: Job<JobConfig>): void {
    // console.log(`Job with ID ${job.id} removed`); // (Comentado, não utilizado)
  }
}
