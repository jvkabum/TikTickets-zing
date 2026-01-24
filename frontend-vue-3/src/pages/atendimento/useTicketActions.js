import { notificarErro } from 'src/utils/helpersNotifications'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useTicketStore } from 'src/stores/useTicketStore'

export function useTicketActions () {
  const $q = useQuasar()
  const router = useRouter()
  const ticketStore = useTicketStore()
  const userId = +localStorage.getItem('userId')

  const iniciarAtendimento = async ticket => {
    try {
      await ticketStore.atualizarStatusTicket(ticket.id, 'open', userId)
      $q.notify({
        message: `Atendimento Iniciado || ${ticket.name || ticket.contact.name} - Ticket: ${ticket.id}`,
        type: 'positive',
        position: 'top'
      })
      ticketStore.setTicketFocado({})
      ticketStore.setHasMore(true)
      // Aqui o Atendimento.vue ou TicketsList já deve reagir ao socket ou à atualização manual
    } catch (error) {
      console.error(error)
      notificarErro('Não foi possível iniciar o atendimento', error)
    }
  }

  const espiarAtendimento = async ticket => {
    try {
      // Para espiar, apenas focamos o ticket sem mudar status ou mudando para pending para garantir carregamento
      // No legado ele mudava para pending se já não fosse
      await ticketStore.atualizarStatusTicket(ticket.id, 'pending')
      $q.notify({
        message: `Espiando || ${ticket.name || ticket.contact.name} - Ticket: ${ticket.id}`,
        type: 'positive',
        position: 'top'
      })
      ticketStore.setTicketFocado(ticket)
    } catch (error) {
      console.error(error)
      notificarErro('Não foi possível espiar o atendimento', error)
    }
  }

  const atualizarStatusTicket = (ticket, status) => {
    const contatoName = ticket?.contact?.name || ticket?.name || ''
    const ticketId = ticket.id
    const title = {
      open: 'Atendimento será iniciado, ok?',
      pending: 'Retornar à fila?',
      closed: 'Encerrar o atendimento?'
    }
    const toast = {
      open: 'Atendimento iniciado!',
      pending: 'Retornado à fila!',
      closed: 'Atendimento encerrado!'
    }

    $q.dialog({
      title: title[status],
      message: `Cliente: ${contatoName} || Ticket: ${ticketId}`,
      cancel: { label: 'Não', color: 'negative', push: true },
      ok: { label: 'Sim', color: 'primary', push: true },
      persistent: true
    }).onOk(async () => {
      try {
        await ticketStore.atualizarStatusTicket(ticketId, status, userId)
        $q.notify({
          message: `${toast[status]} || ${contatoName} (Ticket ${ticketId})`,
          type: 'positive',
          position: 'top'
        })
        ticketStore.setTicketFocado({})
        if (status !== 'open') {
          router.push({ name: 'chat-empty' })
        }
      } catch (error) {
        console.error(error)
        notificarErro('Não foi possível atualizar o status', error)
      }
    })
  }

  return {
    iniciarAtendimento,
    espiarAtendimento,
    atualizarStatusTicket
  }
}
