import { verify } from "jsonwebtoken";
import RabbitmqServer from "../../libs/rabbitmq-server";
import authConfig from "../../config/auth";
import MessengerHandleMessage from "./MessengerHandleMessage";

// Serviço responsável por consumir mensagens do Facebook Messenger
// Processa mensagens da fila RabbitMQ e encaminha para o manipulador apropriado
const MessengerConsumer = async () => {
  // Inicializa a conexão com o servidor RabbitMQ
  // Usa a URL do ambiente ou fallback para string vazia
  const rabbit = new RabbitmqServer(process.env.AMQP_URL || "");
  await rabbit.start();
  // Configura o consumidor para a fila 'messenger'
  // Processa cada mensagem recebida de forma assíncrona
  rabbit.consume("messenger", message => {
    // Converte o conteúdo da mensagem de buffer para objeto
    const content = JSON.parse(message.content.toString());
    // Verifica a autenticidade do token JWT
    // Se inválido, descarta a mensagem sem processamento
    const decode: any = verify(content.token, authConfig.secret);
    if (!decode) return;

    // Encaminha as mensagens para o manipulador específico
    // Responsável por processar e responder às mensagens
    MessengerHandleMessage(content.messages);
  });
};

export default MessengerConsumer;
