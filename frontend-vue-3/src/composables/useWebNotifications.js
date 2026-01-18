import { ref } from 'vue'

/**
 * Composable para gerenciar notificações do navegador (Web Push)
 */
export function useWebNotifications() {
    const permission = ref(Notification.permission)
    const isSupported = ref('Notification' in window)

    /**
     * Solicita permissão para enviar notificações
     */
    const requestPermission = async () => {
        if (!isSupported.value) {
            console.warn('Notificações não são suportadas neste navegador')
            return false
        }

        try {
            const result = await Notification.requestPermission()
            permission.value = result
            return result === 'granted'
        } catch (error) {
            console.error('Erro ao solicitar permissão de notificação:', error)
            return false
        }
    }

    /**
     * Verifica se as notificações estão habilitadas
     */
    const isEnabled = () => {
        return isSupported.value && permission.value === 'granted'
    }

    /**
     * Exibe uma notificação
     */
    const showNotification = (title, options = {}) => {
        if (!isEnabled()) {
            console.warn('Notificações não estão habilitadas')
            return null
        }

        const defaultOptions = {
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
            vibrate: [200, 100, 200],
            tag: 'tiktickets-notification',
            renotify: true,
            requireInteraction: false,
            silent: false,
            ...options
        }

        try {
            const notification = new Notification(title, defaultOptions)

            // Auto-fechar após 10 segundos se não for interação necessária
            if (!defaultOptions.requireInteraction) {
                setTimeout(() => notification.close(), 10000)
            }

            return notification
        } catch (error) {
            console.error('Erro ao exibir notificação:', error)
            return null
        }
    }

    /**
     * Exibe notificação de nova mensagem
     */
    const notifyNewMessage = (contact, message) => {
        return showNotification(`Nova mensagem de ${contact.name}`, {
            body: message.body || 'Mensagem recebida',
            icon: contact.profilePicUrl || '/icons/icon-192x192.png',
            tag: `message-${contact.id}`,
            data: {
                type: 'message',
                contactId: contact.id,
                ticketId: message.ticketId
            }
        })
    }

    /**
     * Exibe notificação de novo ticket pendente
     */
    const notifyNewTicket = (ticket) => {
        return showNotification('Novo cliente pendente', {
            body: `Cliente: ${ticket.contact?.name || 'Novo contato'}`,
            icon: ticket.contact?.profilePicUrl || '/icons/icon-192x192.png',
            tag: `ticket-${ticket.id}`,
            data: {
                type: 'ticket',
                ticketId: ticket.id
            }
        })
    }

    /**
     * Exibe notificação de transferência de ticket
     */
    const notifyTicketTransfer = (ticket, fromUser) => {
        return showNotification('Ticket transferido para você', {
            body: `${fromUser} transferiu o atendimento de ${ticket.contact?.name}`,
            icon: ticket.contact?.profilePicUrl || '/icons/icon-192x192.png',
            tag: `transfer-${ticket.id}`,
            requireInteraction: true,
            data: {
                type: 'transfer',
                ticketId: ticket.id
            }
        })
    }

    /**
     * Configura handler de clique para notificações
     */
    const setupNotificationClick = (notification, callback) => {
        if (notification) {
            notification.onclick = (event) => {
                event.preventDefault()
                window.focus()
                if (callback) {
                    callback(notification.data)
                }
                notification.close()
            }
        }
    }

    /**
     * Fecha todas as notificações com uma tag específica
     */
    const closeNotificationsByTag = (tag) => {
        // Nota: Esta função só funciona com Service Workers
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.ready.then(registration => {
                registration.getNotifications({ tag }).then(notifications => {
                    notifications.forEach(notification => notification.close())
                })
            })
        }
    }

    return {
        // Estado
        permission,
        isSupported,
        // Métodos
        requestPermission,
        isEnabled,
        showNotification,
        notifyNewMessage,
        notifyNewTicket,
        notifyTicketTransfer,
        setupNotificationClick,
        closeNotificationsByTag
    }
}
