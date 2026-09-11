import { format } from 'date-fns'
import { ConsultarTickets } from 'src/service/tickets'
import checkTicketFilter from 'src/utils/checkTicketFilter'
import { socketIO } from 'src/utils/socket'
import alertSound from 'src/assets/sound.mp3'
import { useTicketStore } from './useTicketStore'
import { useAuthStore } from './useAuthStore'
import { storeToRefs } from 'pinia'
import { watch } from 'vue'

let audioAlert = null
function playAlertSound() {
  try {
    if (!audioAlert) {
      audioAlert = new Audio(alertSound)
    }
    audioAlert.currentTime = 0
    audioAlert.volume = 0.6
    audioAlert.play().catch(() => {})
  } catch (_) {}
}

export function useTicketSockets() {
  const store = useTicketStore()
  const authStore = useAuthStore()
  const { user } = storeToRefs(authStore)
  const $q = useQuasar()
  const socket = socketIO()

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
    // Função para reconectar e configurar listeners
    const connect = () => {
      const usuario = user.value
      const userId = usuario?.id || +localStorage.getItem('userId')

      if (!usuario?.tenantId) {
        console.warn('[Socket] Usuário ou Tenant ID não definido. Aguardando...')
        return
      }

      console.log('[Socket] Configurando sockets para Tenant:', usuario.tenantId)

      socket.removeAllListeners('connect')
      socket.removeAllListeners(`${usuario.tenantId}:ticketList`)
      socket.removeAllListeners(`${usuario.tenantId}:contactList`)
      socket.removeAllListeners(`${usuario.tenantId}:ticket`)

      socket.on('connect', () => {
        console.log('[Socket] Conectado! Emitindo joinNotification e joinTickets...')
        socket.emit(`${usuario.tenantId}:joinNotification`)
        socket.emit(`${usuario.tenantId}:joinTickets`)
        socket.emit(`${usuario.tenantId}:setUserActive`)
      })

      // Se já estiver conectado, emite os joins
      if (socket.connected) {
        socket.emit(`${usuario.tenantId}:joinNotification`)
        socket.emit(`${usuario.tenantId}:joinTickets`)
        socket.emit(`${usuario.tenantId}:setUserActive`)
      }

      socket.on(`${usuario.tenantId}:ticketList`, async data => {
        console.log('[Socket] Evento ticketList recebido:', data.type, data.payload)

        if (data.type === 'chat:create') {
          // Correção robusta para "null name"
          // Injeta dados se:
          // 1. Mensagem enviada por mim (fromMe ou mesmo userId)
          // 2. Contato não existe OU nome do contato é inválido
          const isMe = data.payload.fromMe || data.payload.ticket.userId === userId
          const hasValidContact = data.payload.contact && data.payload.contact.name

          if (isMe && !hasValidContact) {
            console.log('[Socket] Injetando MEUS dados no contato da mensagem')
            data.payload.contact = { name: usuario.name, profilePicUrl: usuario.profilePicUrl }
          }
          else if (!isMe && !hasValidContact && data.payload.ticket && data.payload.ticket.contact) {
            console.log('[Socket] Injetando dados do TICKET no contato da mensagem')
            data.payload.contact = data.payload.ticket.contact
          }

          // Tocar som de notificação se a mensagem for do cliente e não estiver no chat focado em primeiro plano
          if (!data.payload.fromMe) {
            const isDifferentTicket = String(data.payload.ticket?.id) !== String(store.ticketFocado.id)
            const isTabHidden = typeof document !== 'undefined' && document.hidden
            if (isDifferentTicket || isTabHidden) {
              playAlertSound()
            }
          }

          // Verifica se é para mim ou se é do cliente (não enviado por mim)
          if (
            !data.payload.read &&
            (data.payload.ticket.userId === userId || !data.payload.ticket.userId) &&
            String(data.payload.ticket.id) !== String(store.ticketFocado.id)
          ) {
            if (checkTicketFilter(data.payload.ticket)) {
              handlerNotifications(data.payload)
            }
          }

          store.updateTicket(data.payload.ticket)

          // Adiciona mensagem ao chat se for o focado
          if (String(data.payload.ticket.id) === String(store.ticketFocado.id)) {
            console.log('[Socket] Adicionando nova mensagem ao chat focado')
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

        if (data.type === 'contact:update') {
          store.updateTicketContact(data.payload)
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
        if (data.action === 'update' && data.ticket) {
          store.updateTicket(data.ticket)
          if (data.ticket.userId === userId && data.ticket.status === 'open' && !data.ticket.isTransference) {
            store.setTicketFocado(data.ticket)
          }
        }
      })
    }

    // Inicializa
    connect()

    // Atualiza o título da aba com o contador de tickets/mensagens pendentes e abertos
    watch(
      () => [store.ticketsCount.open, store.ticketsCount.pending],
      ([open, pending]) => {
        if (typeof document === 'undefined') return
        const total = (open || 0) + (pending || 0)
        if (total > 0) {
          document.title = `(${total}) TikTickets Atendimento`
        } else {
          document.title = 'TikTickets Atendimento'
        }
      },
      { immediate: true }
    )

    // Reage a mudanças no usuário
    watch(user, (newUser) => {
      console.log('[Socket] Usuário alterado, reconectando sockets...', newUser?.name)
      if (newUser && newUser.tenantId) {
        connect()
      }
    }, { deep: true })
  }

  const disconnectSockets = () => {
    const usuario = user.value
    if (!usuario?.tenantId) return
    socket.off(`${usuario.tenantId}:ticketList`)
    socket.off(`${usuario.tenantId}:contactList`)
    socket.off(`${usuario.tenantId}:ticket`)
  }

  return {
    setupSockets,
    disconnectSockets
  }
}
