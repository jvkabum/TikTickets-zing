import Contact from "../models/Contact";
import Ticket from "../models/Ticket";
import ShowStepAutoReplyMessageService from "../services/AutoReplyServices/ShowStepAutoReplyMessageService";
import CreateLogTicketService from "../services/TicketServices/CreateLogTicketService";

// Função para processar mensagem automática de boas-vindas do chatbot
// @param instance - Instância do ticket que será processado
const AutoReplyWelcome = async (instance: Ticket): Promise<void> => {
  // Se já existe um usuário atribuído ou é um grupo, não processa
  if (instance.userId || instance.isGroup) return;

  // Busca a primeira etapa da resposta automática (step 0)
  // configurada para boas-vindas (isInitial = true)
  const stepAutoReply = await ShowStepAutoReplyMessageService(
    0,
    0,
    0,
    true,
    instance.tenantId
  );

  // Se não encontrou configuração de resposta automática, encerra
  if (!stepAutoReply) return;

  // Busca informações do contato
  const contato = await Contact.findByPk(instance.contactId);
  // Obtém número de teste configurado na resposta automática
  const { celularTeste } = stepAutoReply.autoReply;
  // Obtém número do contato
  const celularContato = contato?.number;

  // Verifica se:
  // - Existe número de teste E o contato não contém esse número, OU
  // - Não existe número de contato
  if (
    (celularTeste && celularContato?.indexOf(celularTeste.substr(1)) === -1) ||
    !celularContato
  ) {
    // Se não for Telegram, encerra
    if (instance.channel !== "telegram") {
      return;
    }
  }

  // Atualiza o ticket com as informações da resposta automática
  await instance.update({
    autoReplyId: stepAutoReply.autoReply.id,
    stepAutoReplyId: stepAutoReply.id
  });

  // Cria um log do ticket indicando que foi processado pelo chatbot
  await CreateLogTicketService({
    ticketId: instance.id,
    type: "chatBot"
  });
};

export default AutoReplyWelcome;
