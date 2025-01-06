import { Router } from 'express';
import { getDaysToClose, setDaysToClose } from '../services/SettingServices/ConfiguraFechamentoTicketService';

const router = Router();

// Endpoint GET para obter daysToClose
router.get('/settings/ticket-close-days', async (req, res) => {
    try {
        const daysToClose = await getDaysToClose();
        res.json({ daysToClose });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar a configuração de fechamento' });
    }
});

// Endpoint PUT para atualizar daysToClose
router.put('/settings/ticket-close-days', async (req, res) => {
    const { daysToClose } = req.body;
    try {
        await setDaysToClose(daysToClose);
        res.status(200).json({ message: 'Configuração atualizada com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao atualizar a configuração de fechamento' });
    }
});

export default router;