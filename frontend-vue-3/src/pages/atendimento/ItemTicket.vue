<template>
  <q-item
    clickable
    v-if="isValid"
    @click="abrirChatContato(ticket)"
    class="ticket-item q-ma-xs q-pa-sm"
    :class="{
      'ticket-active-item': ticket.id === ticketFocado.id,
      'ticket-unread': ticket.unreadMessages > 0
    }"
  >
    <div 
      class="absolute-left full-height" 
      :style="{ width: '5px', backgroundColor: borderColor[ticket.status] || '#ccc' }"
    ></div>
    <q-item-section avatar class="q-pl-sm">
      <div class="relative-position">
        <q-avatar size="48px" class="bg-grey-2">
          <q-img :src="profilePicUrl" @error="onImageError" />
        </q-avatar>
        <q-badge
          v-if="ticket.unreadMessages"
          color="negative"
          floating
          rounded
          class="text-bold"
        >
          {{ ticket.unreadMessages }}
        </q-badge>
      </div>
    </q-item-section>

    <q-item-section>
      <div class="row items-center no-wrap">
        <div class="text-subtitle2 text-bold ellipsis col">{{ ticket.contact?.name || ticket.name || 'Sem nome' }}</div>
        <q-icon
          v-if="ticket.channel && typeof ticket.channel === 'string'"
          :name="`img:/${ticket.channel}-logo.png`"
          size="18px"
          class="q-ml-xs"
        />
      </div>

      <div class="row items-center q-gutter-x-xs text-caption text-grey-6">
        <q-btn
          v-if="ticket.channel === 'whatsapp'"
          flat dense round size="xs" 
          icon="sync" color="primary" 
          @click.stop="sincronizarMensagens" 
          :loading="sincronizando"
        />
        <div class="bg-grey-3 q-px-xs rounded-borders text-grey-8 text-bold" style="font-size: 10px;">
          {{ dataInWords(ticket.lastMessageAt || ticket.updatedAt) }}
        </div>
        <div class="text-weight-bold">#{{ ticket.id }}</div>
        <q-icon v-if="walletsDoTicket.length" name="mdi-wallet" size="14px" color="grey-7" />
      </div>

      <div class="text-caption text-grey-8 ellipsis" v-if="ticket.username">
        Usuário: <span class="text-weight-medium">{{ ticket.username }}</span>
      </div>

      <div class="row q-gutter-xs q-mt-xs" v-if="ticket.queue || ticket.channel">
        <q-badge
          dense
          color="blue-1"
          text-color="primary"
          class="q-px-sm text-bold"
          style="font-size: 10px; border-radius: 6px"
        >
          {{ ticket.channel }} {{ ticket.queue || '' }}
        </q-badge>
      </div>
    </q-item-section>

    <q-item-section side v-if="ticket.status === 'pending'">
      <q-btn
        flat
        round
        dense
        color="primary"
        icon="mdi-eye-outline"
        @click.stop="espiarAtendimento(ticket)"
      >
        <q-tooltip>Espiar</q-tooltip>
      </q-btn>
    </q-item-section>
  </q-item>
</template>

<script setup>
import { formatDistance, isValid as isValidDate, parseISO } from 'date-fns'
import pt from 'date-fns/locale/pt-BR'
import { useTicketActions } from './useTicketActions'

const props = defineProps({
  ticket: { type: Object, default: () => ({}) },
  filas: { type: Array, default: () => [] }
})

const defaultAvatar = '/default-avatar.png'

const $q = useQuasar()
const router = useRouter()
const contatoStore = useContatoStore()
const ticketStore = useTicketStore()
const { ticketFocado } = storeToRefs(ticketStore)
const { iniciarAtendimento, espiarAtendimento } = useTicketActions()

const tagsDoTicket = ref([])
const walletsDoTicket = ref([])
const profilePicUrl = ref(props.ticket.profilePicUrl || defaultAvatar)
const sincronizando = ref(false)
const recalcularHoraTrigger = ref(0)

const borderColor = {
  open: '#2196f3',      // Azul (Aberto)
  pending: '#dc3545',   // Vermelho (Pendente) - Cor original do sistema legado
  closed: '#21ba45'     // Verde (Resolvido)
}

const isValid = computed(() => props.ticket && props.ticket.id)

const dataInWords = timestamp => {
  if (!timestamp) return '...'
  // eslint-disable-next-line no-unused-expressions
  recalcularHoraTrigger.value // Trigger re-render
  try {
    const data = typeof timestamp === 'string' ? parseISO(timestamp) : new Date(timestamp)
    if (!isValidDate(data)) return '...'
    return formatDistance(data, new Date(), { locale: pt, addSuffix: true })
  } catch (e) {
    return '...'
  }
}

const loadContactInfo = async () => {
  if (!props.ticket.contactId) return
  try {
    const data = await contatoStore.obterContato(props.ticket.contactId)
    tagsDoTicket.value = data.tags || []
    walletsDoTicket.value = data.wallets ? data.wallets.map(w => ({ wallet: w.name })) : []
  } catch (e) {
    console.error('Erro ao carregar info do contato', e)
  }
}

const abrirChatContato = ticket => {
  if (ticket.status === 'pending') return
  ticketStore.setTicketFocado(ticket)
  router.push({ name: 'atendimento' })
}

const sincronizarMensagens = async () => {
  sincronizando.value = true
  try {
    await ticketStore.sincronizarMensagens(props.ticket.id)
    notificarSucesso('Mensagens sincronizadas!')
  } catch (e) {
    notificarErro('Erro ao sincronizar', e)
  } finally {
    sincronizando.value = false
  }
}

const onImageError = e => {
  profilePicUrl.value = defaultAvatar
}

let hourInterval
onMounted(() => {
  loadContactInfo()
  hourInterval = setInterval(() => {
    recalcularHoraTrigger.value++
  }, 60000)
})

onUnmounted(() => {
  clearInterval(hourInterval)
})

watch(
  () => props.ticket.contactId,
  () => {
    loadContactInfo()
  }
)
</script>

<style lang="sass" scoped>
.ticket-active-item
  background: rgba(var(--q-primary), 0.05) !important
  border-right: 3px solid var(--q-primary)

.ticket-item
  transition: all 0.2s ease
  border-radius: 12px !important
  min-height: 85px
  border: 1px solid rgba(0, 0, 0, 0.05)
  background: white

  &:hover
    background: rgba(0, 0, 0, 0.01)
    transform: translateY(-1px)

.ticket-unread
  background-color: rgba(var(--q-negative), 0.05)
  .text-subtitle2
    color: var(--q-negative)
    font-weight: 900
</style>
