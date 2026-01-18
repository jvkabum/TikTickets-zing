import { useQuasar } from 'quasar'

export function useNotifications() {
    const $q = useQuasar()

    /**
     * Notificação de sucesso
     * @param {string} message 
     */
    const notificarSucesso = (message) => {
        $q.notify({
            type: 'positive',
            message: message,
            position: 'top',
            progress: true,
            actions: [{ icon: 'close', round: true, color: 'white' }]
        })
    }

    /**
     * Notificação de erro
     * @param {string} message 
     * @param {any} error 
     */
    const notificarErro = (message, error = null) => {
        const detail = error?.response?.data?.message || error?.message || ''
        $q.notify({
            type: 'negative',
            message: `${message}${detail ? ': ' + detail : ''}`,
            position: 'top',
            progress: true,
            actions: [{ icon: 'close', round: true, color: 'white' }]
        })
    }

    /**
     * Notificação de aviso
     * @param {string} message 
     */
    const notificarAviso = (message) => {
        $q.notify({
            type: 'warning',
            message: message,
            position: 'top',
            progress: true,
            actions: [{ icon: 'close', round: true, color: 'white' }]
        })
    }

    /**
     * Notificação de informação
     * @param {string} message 
     */
    const notificarInfo = (message) => {
        $q.notify({
            type: 'info',
            message: message,
            position: 'top',
            progress: true,
            actions: [{ icon: 'close', round: true, color: 'white' }]
        })
    }

    return {
        notificarSucesso,
        notificarErro,
        notificarAviso,
        notificarInfo
    }
}
