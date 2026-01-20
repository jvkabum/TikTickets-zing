import { useQuasar } from 'quasar'
import { ref } from 'vue'

export function useNotifications() {
    const $q = useQuasar()
    const permission = ref('Notification' in window ? Notification.permission : 'denied')
    const isWebSupported = ref('Notification' in window)

    /**
     * Notificações UI (Quasar)
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

    const notificarAviso = (message) => {
        $q.notify({
            type: 'warning',
            message: message,
            position: 'top',
            progress: true,
            actions: [{ icon: 'close', round: true, color: 'white' }]
        })
    }

    const notificarInfo = (message) => {
        $q.notify({
            type: 'info',
            message: message,
            position: 'top',
            progress: true,
            actions: [{ icon: 'close', round: true, color: 'white' }]
        })
    }

    /**
     * Notificações Browser (Web Push)
     */
    const solicitarPermissaoWeb = async () => {
        if (!isWebSupported.value) return false
        const result = await Notification.requestPermission()
        permission.value = result
        return result === 'granted'
    }

    const exibirNotificacaoWeb = (title, options = {}) => {
        if (!isWebSupported.value || permission.value !== 'granted') return null

        const defaultOptions = {
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
            tag: 'tiktickets',
            renotify: true,
            ...options
        }

        const notification = new Notification(title, defaultOptions)

        notification.onclick = (event) => {
            event.preventDefault()
            window.focus()
            if (options.onClick) options.onClick(notification)
            notification.close()
        }

        return notification
    }

    return {
        // UI
        notificarSucesso,
        notificarErro,
        notificarAviso,
        notificarInfo,
        // Web
        isWebSupported,
        permission,
        solicitarPermissaoWeb,
        exibirNotificacaoWeb
    }
}
