import { Request, Response } from "express"; 
import AppError from "../errors/AppError"; 

// ====================
// Função para receber requisições do 360
// ====================
export const ReceivedRequest360 = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // const message = {
    //   token: req.params.token,
    //   messages: req.body
    // };
    // await req.app.rabbit.publishInQueue("waba360", JSON.stringify(message)); // (Comentado, não utilizado)
  } catch (error) {
    throw new AppError(error.message); // Lança erro se ocorrer um problema
  }
  // Queue.add("SendMessageAPI", newMessage); // (Comentado, não utilizado)

  return res.status(200).json({ message: "Message add queue" }); // Retorna mensagem de sucesso
};

// ====================
// Função para verificar o serviço do Messenger
// ====================
export const CheckServiceMessenger = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const challenge = req.query["hub.challenge"]; // Extrai o desafio do webhook
  console.log("WEBHOOK_VERIFIED"); // Registra que o webhook foi verificado
  return res.status(200).send(challenge); // Retorna o desafio como resposta
};

// ====================
// Função para receber requisições do Messenger
// ====================
export const ReceivedRequestMessenger = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // const message = {
    //   token: req.params.token,
    //   messages: req.body
    // };
    // await req.app.rabbit.publishInQueue("messenger", JSON.stringify(message)); // (Comentado, não utilizado)
  } catch (error) {
    throw new AppError(error.message); // Lança erro se ocorrer um problema
  }
  // Queue.add("SendMessageAPI", newMessage); // (Comentado, não utilizado)

  return res.status(200).json({ message: "Message add queue" }); // Retorna mensagem de sucesso
};
