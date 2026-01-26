import { Message as WbotMessage } from "whatsapp-web.js";
import AppError from "../../errors/AppError";
import { getWbot } from "../../libs/wbot";
import { getIO } from "../../libs/socket";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import { logger } from "../../utils/logger";

interface SyncPollParams {
    pollMessageId: string;
    ticketId: number;
    wbotId: number;
}

const SyncPollVotesService = async ({
    pollMessageId,
    ticketId,
    wbotId
}: SyncPollParams): Promise<any> => {
    const wbot = getWbot(wbotId);

    // 1. Recuperar a mensagem original do WhatsApp
    let msg: WbotMessage | undefined;
    try {
        msg = await wbot.getMessageById(pollMessageId);
    } catch (error) {
        logger.error(`SyncPollVotes - Erro ao buscar mensagem no WWebJS: ${error}`);
    }

    if (!msg) {
        throw new AppError("Message not found in WhatsApp Session.");
    }

    // 2. Buscar votos atualizados usando o novo recurso (PR #3807)
    let votes;
    try {
        votes = await msg.getPollVotes();
    } catch (error) {
        logger.error(`SyncPollVotes - Erro ao obter votos (getPollVotes): ${error}`);
        // Se falhar o getPollVotes (ex: versão antiga), lança erro
        throw new AppError("Failed to fetch poll votes. Ensure WWebJS is updated.");
    }

    // 3. Buscar a mensagem no banco de dados local
    const messageRecord = await Message.findOne({
        where: { messageId: pollMessageId },
        include: [
            {
                model: Ticket,
                where: { tenantId: wbotId }, // Ajuste conforme sua lógica de tenant/wbot
                required: true
            }
        ]
    });

    if (!messageRecord) {
        throw new AppError("Message not found in Database.");
    }

    // Se não tiver dados de enquete, não há o que atualizar
    if (!messageRecord.pollData) {
        throw new AppError("Message is not a poll or has no pollData.");
    }

    // 4. Processar e Normalizar Votos
    const processedVotes: Array<{
        sender: string;
        selectedOptions: string[];
        timestamp: number;
    }> = [];

    for (const vote of votes) {
        const selectedOptionsNames = vote.selectedOptions.map(opt => opt.name).filter(Boolean);

        // Tratamento de LID para o voter
        let voter = vote.voter;
        if (voter.endsWith('@lid')) {
            const contact = await wbot.getContactById(voter);
            voter = contact?.number || voter.replace('@lid', '').split('@')[0];
        } else {
            voter = voter.replace('@c.us', '').replace('@g.us', '');
        }

        processedVotes.push({
            sender: voter,
            selectedOptions: selectedOptionsNames,
            timestamp: typeof vote.interractedAtTs === 'number' ? vote.interractedAtTs : Math.floor(Date.now() / 1000)
        });
    }

    // 5. Recalcular Contagem de Votos
    // Clonar opções originais para zerar contadores e recalcular
    const currentOptions = messageRecord.pollData.options.map(opt => ({
        ...opt,
        votes: 0 // Resetar contagem para recalcular com base no snapshot atual
    }));

    // Aplicar contagem
    processedVotes.forEach(pv => {
        pv.selectedOptions.forEach(selectedOptName => {
            const optIndex = currentOptions.findIndex(o => o.name === selectedOptName);
            if (optIndex !== -1) {
                currentOptions[optIndex].votes += 1;
            }
        });
    });

    const updatedPollData = {
        ...messageRecord.pollData,
        votes: processedVotes,
        options: currentOptions
    };

    // 6. Salvar no Banco
    await messageRecord.update({ pollData: updatedPollData });

    // 7. Emitir evento Socket para atualização imediata no frontend
    const io = getIO();
    io.to(ticketId.toString()).emit(`tenant:${messageRecord.ticket.tenantId}:message`, {
        action: "update",
        message: messageRecord
    });

    return {
        messageId: pollMessageId,
        voteCount: processedVotes.length,
        pollData: updatedPollData
    };
};

export default SyncPollVotesService;
