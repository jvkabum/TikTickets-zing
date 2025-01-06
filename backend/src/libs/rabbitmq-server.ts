/* eslint-disable no-useless-constructor */
import { Connection, Channel, connect, Message } from "amqplib"; 
import { logger } from "../utils/logger"; 
import { sleepRandomTime } from "../utils/sleepRandomTime"; 

// ====================
// Classe RabbitmqServer
// ====================
export default class RabbitmqServer {
  private conn: Connection; // Conexão com o RabbitMQ
  private channel: Channel; // Canal de comunicação com o RabbitMQ

  // Construtor da classe que recebe a URI do RabbitMQ
  constructor(private uri: string) { }

  // Função para iniciar a conexão e o canal
  async start(): Promise<void> {
    this.conn = await connect(this.uri); // Conecta ao RabbitMQ usando a URI fornecida
    this.channel = await this.conn.createChannel(); // Cria um canal de comunicação
    await this.channel.assertQueue("waba360", { durable: true }); // Assegura que a fila "waba360" existe
    await this.channel.assertQueue("messenger", { durable: true }); // Assegura que a fila "messenger" existe
  }

  // Função para publicar uma mensagem em uma fila
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async publishInQueue(queue: string, message: string) {
    await this.channel.assertQueue(queue, { durable: true }); // Assegura que a fila existe
    return this.channel.sendToQueue(queue, Buffer.from(message), { // Envia a mensagem para a fila
      persistent: true // Marca a mensagem como persistente
    });
  }

  // Função para publicar uma mensagem em um exchange
  async publishInExchange(
    exchange: string,
    routingKey: string,
    message: string
  ): Promise<boolean> {
    return this.channel.publish(exchange, routingKey, Buffer.from(message), { // Publica a mensagem no exchange
      persistent: true // Marca a mensagem como persistente
    });
  }

  // Função para consumir mensagens de uma fila para WhatsApp
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async consumeWhatsapp(
    queue: string,
    callback: (message: Message) => Promise<void>
  ) {
    this.channel.prefetch(10, false); // Define o número de mensagens que podem ser processadas simultaneamente
    await this.channel.assertQueue(queue, { durable: true }); // Assegura que a fila existe
    this.channel.consume(queue, async (message: any) => { // Inicia o consumo de mensagens da fila
      try {
        await callback(message); // Chama a função de callback para processar a mensagem
        // delay para processamento da mensagem
        await sleepRandomTime({ // Aguarda um tempo aleatório antes de reconhecer a mensagem
          minMilliseconds: Number(process.env.MIN_SLEEP_INTERVAL || 500),
          maxMilliseconds: Number(process.env.MAX_SLEEP_INTERVAL || 2000)
        });
        this.channel.ack(message); // Reconhece a mensagem como processada
        return;
      } catch (error) {
        this.channel.nack(message); // Não reconhece a mensagem se ocorrer um erro
        logger.error("consumeWhatsapp", error); // Registra erro no logger
        // this.channel.close(); // (Comentado, não utilizado)
      }
    });
  }

  // Função para consumir mensagens de uma fila
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async consume(queue: string, callback: (message: Message) => void) {
    return this.channel.consume(queue, (message: any) => { // Inicia o consumo de mensagens da fila
      try {
        callback(message); // Chama a função de callback para processar a mensagem
        this.channel.ack(message); // Reconhece a mensagem como processada
        return;
      } catch (error) {
        logger.error(error); // Registra erro no logger
        // this.channel.close(); // (Comentado, não utilizado)
      }
    });
  }
}
