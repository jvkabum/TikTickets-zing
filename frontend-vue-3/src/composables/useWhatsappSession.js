import { useQuasar } from 'quasar'
import {
    DeletarWhatsapp,
    DesconectarWhatsapp,
    IniciarSessaoWhatsapp,
    ListarWhatsapps
} from 'src/service/sessoesWhatsapp'
import { computed, ref } from 'vue'

/**
 * Composable para gerenciar sessões do WhatsApp
 */
export function useWhatsappSession() {
    const $q = useQuasar()

    const sessoes = ref([])
    const loading = ref(false)
    const sessaoAtual = ref(null)
    const qrCode = ref(null)
    const qrCodeVisible = ref(false)

    /**
     * Status possíveis de uma sessão
     */
    const statusLabels = {
        DISCONNECTED: 'Desconectado',
        OPENING: 'Abrindo...',
        qrcode: 'Aguardando QR Code',
        CONNECTED: 'Conectado',
        TIMEOUT: 'Tempo esgotado',
        CONFLICT: 'Conflito de sessão',
        PAIRING: 'Pareando...'
    }

    const statusColors = {
        DISCONNECTED: 'grey',
        OPENING: 'warning',
        qrcode: 'info',
        CONNECTED: 'positive',
        TIMEOUT: 'negative',
        CONFLICT: 'negative',
        PAIRING: 'warning'
    }

    const statusIcons = {
        DISCONNECTED: 'mdi-wifi-off',
        OPENING: 'mdi-loading mdi-spin',
        qrcode: 'mdi-qrcode',
        CONNECTED: 'mdi-check-circle',
        TIMEOUT: 'mdi-clock-alert',
        CONFLICT: 'mdi-alert',
        PAIRING: 'mdi-cellphone-link'
    }

    /**
     * Lista todas as sessões
     */
    const listarSessoes = async () => {
        loading.value = true
        try {
            const { data } = await ListarWhatsapps()
            sessoes.value = data.whatsapps || data
            return data
        } catch (error) {
            $q.notify({
                type: 'negative',
                message: 'Erro ao listar sessões',
                position: 'top'
            })
            throw error
        } finally {
            loading.value = false
        }
    }

    /**
     * Inicia uma sessão
     */
    const iniciarSessao = async (id) => {
        try {
            const { data } = await IniciarSessaoWhatsapp(id)
            const idx = sessoes.value.findIndex(s => s.id === id)
            if (idx !== -1) {
                sessoes.value[idx] = { ...sessoes.value[idx], ...data }
            }

            // Se retornar QR Code, exibir
            if (data.qrcode) {
                qrCode.value = data.qrcode
                qrCodeVisible.value = true
            }

            return data
        } catch (error) {
            $q.notify({
                type: 'negative',
                message: 'Erro ao iniciar sessão',
                position: 'top'
            })
            throw error
        }
    }

    /**
     * Desconecta uma sessão
     */
    const desconectarSessao = async (id) => {
        try {
            await DesconectarWhatsapp(id)
            const idx = sessoes.value.findIndex(s => s.id === id)
            if (idx !== -1) {
                sessoes.value[idx].status = 'DISCONNECTED'
            }
            $q.notify({
                type: 'info',
                message: 'Sessão desconectada',
                position: 'top'
            })
        } catch (error) {
            $q.notify({
                type: 'negative',
                message: 'Erro ao desconectar sessão',
                position: 'top'
            })
            throw error
        }
    }

    /**
     * Deleta uma sessão
     */
    const deletarSessao = async (id) => {
        try {
            await DeletarWhatsapp(id)
            sessoes.value = sessoes.value.filter(s => s.id !== id)
            $q.notify({
                type: 'positive',
                message: 'Sessão deletada',
                position: 'top'
            })
        } catch (error) {
            $q.notify({
                type: 'negative',
                message: 'Erro ao deletar sessão',
                position: 'top'
            })
            throw error
        }
    }

    /**
     * Atualiza status de uma sessão
     */
    const atualizarStatus = (id, status) => {
        const idx = sessoes.value.findIndex(s => s.id === id)
        if (idx !== -1) {
            sessoes.value[idx].status = status
        }
    }

    /**
     * Atualiza QR Code
     */
    const atualizarQrCode = (id, qr) => {
        const sessao = sessoes.value.find(s => s.id === id)
        if (sessao) {
            qrCode.value = qr
            qrCodeVisible.value = true
            sessaoAtual.value = sessao
        }
    }

    /**
     * Fecha modal de QR Code
     */
    const fecharQrCode = () => {
        qrCode.value = null
        qrCodeVisible.value = false
        sessaoAtual.value = null
    }

    /**
     * Obtém label do status
     */
    const getStatusLabel = (status) => statusLabels[status] || status

    /**
     * Obtém cor do status
     */
    const getStatusColor = (status) => statusColors[status] || 'grey'

    /**
     * Obtém ícone do status
     */
    const getStatusIcon = (status) => statusIcons[status] || 'mdi-help-circle'

    // Computed
    const sessoesConectadas = computed(() =>
        sessoes.value.filter(s => s.status === 'CONNECTED')
    )

    const sessoesDesconectadas = computed(() =>
        sessoes.value.filter(s => s.status === 'DISCONNECTED')
    )

    return {
        sessoes,
        loading,
        sessaoAtual,
        qrCode,
        qrCodeVisible,
        sessoesConectadas,
        sessoesDesconectadas,
        listarSessoes,
        iniciarSessao,
        desconectarSessao,
        deletarSessao,
        atualizarStatus,
        atualizarQrCode,
        fecharQrCode,
        getStatusLabel,
        getStatusColor,
        getStatusIcon
    }
}
