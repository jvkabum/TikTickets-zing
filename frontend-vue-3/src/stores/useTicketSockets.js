import { format } from 'date-fns'
import { useQuasar } from 'quasar'
import { ConsultarTickets } from 'src/service/tickets'
import checkTicketFilter from 'src/utils/checkTicketFilter'
import { socketIO } from 'src/utils/socket'
import { useTicketStore } from './useTicketStore'

export function useTicketSockets() {
  const store = useTicketStore()
  const $q = useQuasar()
  const socket = socketIO()
  const usuario = JSON.parse(localStorage.getItem('usuario'))
  const userId = +localStorage.getItem('userId')

  const handlerNotifications = data => {
    if (Notification.permission === 'granted') {
      const options = {
        body: `${data.body} - ${format(new Date(), 'HH:mm')}`,
        icon: data.ticket.contact.profilePicUrl,
        tag: data.ticket.id,
        renotify: true
      }
      const notification = new Notification(`Mensagem de ${data.ticket.contact.name}`, options)
      setTimeout(() => notification.close(), 10000)
      notification.onclick = e => {
        e.preventDefault()
        window.focus()
        // Aqui deve haver uma lógica de redirecionamento ou abertura
      }
    }
  }

  const setupSockets = () => {
    if (!usuario?.tenantId) return

    socket.on('connect', () => {
      socket.emit(`${usuario.tenantId}:joinNotification`)

      socket.on(`${usuario.tenantId}:ticketList`, async data => {
        if (data.type === 'chat:create') {
          if (
            !data.payload.read &&
            (data.payload.ticket.userId === userId || !data.payload.ticket.userId) &&
            data.payload.ticket.id !== store.ticketFocado.id
          ) {
            if (checkTicketFilter(data.payload.ticket)) {
              handlerNotifications(data.payload)
            }
          }
          store.updateTicket(data.payload.ticket)
          // Se for a mensagem do chat focado, adiciona à lista
          if (data.payload.ticket.id === store.ticketFocado.id) {
            store.addMensagem(data.payload)
          }

          // Atualizar contagem de notificações comuns
          const params = {
            searchParam: '',
            pageNumber: 1,
            status: ['open'],
            showAll: false,
            count: null,
            queuesIds: [],
            withUnreadMessages: true,
            isNotAssignedUser: false,
            includeNotQueueDefined: true
          }
          try {
            const { data: respData } = await ConsultarTickets(params)
            store.updateNotifications(respData)
          } catch (err) {
            console.error('Erro ao atualizar notificações', err)
          }
        }

        if (data.type === 'chat:ack' || data.type === 'chat:delete') {
          store.updateMessageStatus(data.payload)
        }

        if (data.type === 'chat:update') {
          store.updateMensagem(data.payload)
        }

        if (data.type === 'ticket:update') {
          store.updateTicket(data.payload)
        }

        if (data.type === 'notification:new') {
          // Atualizar notificações de pendentes
          const paramsP = {
            searchParam: '',
            pageNumber: 1,
            status: ['pending'],
            showAll: false,
            count: null,
            queuesIds: [],
            withUnreadMessages: false,
            isNotAssignedUser: false,
            includeNotQueueDefined: true
          }
          try {
            const { data: data_noti } = await ConsultarTickets(paramsP)
            store.updateNotificationsP(data_noti)

            const isMyQueue = data_noti.tickets.some(t => t.id === data.payload.id)
            if (isMyQueue && Notification.permission === 'granted') {
              new Notification('Novo cliente pendente', {
                body: 'Cliente: ' + data.payload.contact.name,
                tag: 'new-pending'
              })
            }
          } catch (err) {
            console.error('Erro ao buscar notificações pendentes', err)
          }
        }
      })

      socket.on(`${usuario.tenantId}:contactList`, data => {
        store.updateTicketContact(data.payload)
      })

      socket.on(`${usuario.tenantId}:ticket`, data => {
        if (data.action === 'update' && data.ticket.userId === userId) {
          if (data.ticket.status === 'open' && !data.ticket.isTransference) {
            store.setTicketFocado(data.ticket)
          }
        }
      })
    })
  }

  const disconnectSockets = () => {
    socket.off(`${usuario.tenantId}:ticketList`)
    socket.off(`${usuario.tenantId}:contactList`)
    socket.off(`${usuario.tenantId}:ticket`)
    socket.disconnect()
  }

  return {
    setupSockets,
    disconnectSockets
  }
}
