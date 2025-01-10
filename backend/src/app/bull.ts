import { BullAdapter, setQueues, router as bullRoute } from "bull-board";
import Queue from "../libs/Queue";

// Função de inicialização do sistema de filas BullMQ
// Responsável por configurar e iniciar o processamento de tarefas em background
export default async function bullMQ(app) {
  // Indica que o sistema de filas foi iniciado
  console.info("bullMQ started");

  // Inicia o processamento das filas definidas
  await Queue.process();
  
  // Adiciona tarefa para verificar tickets inativos do chatbot
  await Queue.add("VerifyTicketsChatBotInactives", {});

  // Adiciona tarefa para envio de mensagens agendadas
  await Queue.add("SendMessageSchenduled", {});

  // Em ambiente de desenvolvimento, configura interface de administração das filas
  if (process.env.NODE_ENV !== "production") {
    setQueues(Queue.queues.map((q: any) => new BullAdapter(q.bull) as any));
    app.use("/admin/queues", bullRoute);
  }
}
