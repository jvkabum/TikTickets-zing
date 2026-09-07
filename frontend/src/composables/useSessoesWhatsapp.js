import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import {
    CriarWhatsapp,
    DeletarWhatsapp,
    DeleteWhatsappSession,
    ListarWhatsapps,
    RequestNewQrCode,
    StartWhatsappSession,
    UpdateWhatsapp
} from 'src/service/sessoesWhatsapp'
import { notificarErro } from 'src/utils/helpersNotifications'

export function useSessoesWhatsapp () {
    const $q = useQuasar()
    const whatsappStore = useWhatsappStore()

    const loading = ref(false)
    const abrirModalQR = ref(false)
    const modalWhatsapp = ref(false)
    const whatsappSelecionado = ref({})

    const whatsapps = computed(() => whatsappStore.whatsapps)

    const cDadosWhatsappSelecionado = computed(() => {
        const { id } = whatsappSelecionado.value
        if (!id) return {}
        console.log('useSessoesWhatsapp: Finding current data for ID', id)
        return whatsapps.value.find(w => String(w.id) === String(id)) || {}
    })

    const handleOpenQrModal = channel => {
        whatsappSelecionado.value = channel
        abrirModalQR.value = true
    }

    const handleOpenModalWhatsapp = whatsapp => {
        whatsappSelecionado.value = whatsapp
        modalWhatsapp.value = true
    }

    const handleDisconectWhatsSession = async (whatsAppId) => {
        return new Promise((resolve) => {
            $q.dialog({
                title: 'Atenção!! Deseja realmente desconectar? ',
                cancel: { label: 'Não', color: 'primary', push: true },
                ok: { label: 'Sim', color: 'negative', push: true },
                persistent: true
            }).onOk(async () => {
                loading.value = true
                try {
                    await DeleteWhatsappSession(whatsAppId)
                    whatsappStore.updateWhatsapp({ id: whatsAppId, status: 'DISCONNECTED' })
                    resolve(true)
                } catch (error) {
                    console.error(error)
                    resolve(false)
                } finally {
                    loading.value = false
                }
            }).onCancel(() => {
                resolve(false)
            })
        })
    }

    const handleStartWhatsAppSession = async (whatsAppId) => {
        try {
            await StartWhatsappSession(whatsAppId)
        } catch (error) {
            console.error(error)
        }
    }

    const handleRequestNewQrCode = async (channel) => {
        if (channel.type === 'telegram' && !channel.tokenTelegram) {
            notificarErro('Necessário informar o token para Telegram')
            return
        }
        loading.value = true
        try {
            await RequestNewQrCode({ id: channel.id, isQrcode: true })
            setTimeout(() => {
                handleOpenQrModal(channel)
            }, 2000)
        } catch (error) {
            console.error(error)
        } finally {
            loading.value = false
        }
    }

    const listarWhatsapps = async () => {
        loading.value = true
        try {
            const { data } = await ListarWhatsapps()
            whatsappStore.setWhatsapps(data)
        } catch (error) {
            console.error(error)
        } finally {
            loading.value = false
        }
    }

    const deleteWhatsapp = async (whatsapp) => {
        return new Promise((resolve) => {
            $q.dialog({
                title: 'Atenção!! Deseja realmente deletar? ',
                message: 'Não é uma boa ideia apagar se já tiver gerado atendimentos para esse whatsapp.',
                cancel: { label: 'Não', color: 'primary', push: true },
                ok: { label: 'Sim', color: 'negative', push: true },
                persistent: true
            }).onOk(async () => {
                loading.value = true
                try {
                    await DeletarWhatsapp(whatsapp.id)
                    whatsappStore.removeWhatsapp(whatsapp.id)
                    resolve(true)
                } catch (error) {
                    console.error(error)
                    resolve(false)
                } finally {
                    loading.value = false
                }
            }).onCancel(() => {
                resolve(false)
            })
        })
    }

    const saveWhatsapp = async (whatsappData) => {
        try {
            if (whatsappData.id) {
                await UpdateWhatsapp(whatsappData.id, whatsappData)
            } else {
                await CriarWhatsapp(whatsappData)
            }
            $q.notify({
                type: 'positive',
                message: `Canal ${whatsappData.id ? 'editado' : 'criado'} com sucesso!`,
                position: 'top'
            })
            await listarWhatsapps()
            return true
        } catch (error) {
            console.error(error)
            const errorMsg =
                error.data?.error === 'ERR_NO_PERMISSION_CONNECTIONS_LIMIT'
                    ? 'Limite de conexões atingida.'
                    : 'Ops! Verifique os erros... O nome da conexão não pode existir na plataforma, é um identificador único.'

            $q.notify({
                type: 'negative',
                message: errorMsg,
                position: 'top'
            })
            return false
        }
    }

    return {
        loading,
        abrirModalQR,
        modalWhatsapp,
        whatsappSelecionado,
        whatsapps,
        cDadosWhatsappSelecionado,
        handleOpenQrModal,
        handleOpenModalWhatsapp,
        handleDisconectWhatsSession,
        handleStartWhatsAppSession,
        handleRequestNewQrCode,
        listarWhatsapps,
        deleteWhatsapp,
        saveWhatsapp
    }
}
