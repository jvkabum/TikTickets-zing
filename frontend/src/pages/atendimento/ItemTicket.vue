<template>
  <q-list
    separator
    v-if="isValid"
    style="max-width: 370px"
    class="q-px-sm q-py-none q-pt-sm"
  >
    <q-item
      clickable
      style="height: 95px; max-width: 100%"
      @click="abrirChatContato(ticket)"
      :style="`border-left: 6px solid ${borderColor[ticket.status] || '#ccc'}; border-radius: 10px`"
      class="ticketBorder q-px-sm"
      :class="{
        ticketBorderGrey: !$q.dark.isActive,
        'ticket-active-item': ticket.id === ticketFocado.id,
        ticketNotAnswered: ticket.answered === false && !ticket.isGroup && ticket.status === 'open',
        'ticket-unread': ticket.unreadMessages > 0
      }"
    >
      <q-item-section
        avatar
        class="q-px-none"
      >
        <q-btn
          flat
          @click.stop="iniciarAtendimento(ticket)"
          push
          color="primary"
          dense
          round
          v-if="ticket.status === 'pending'"
        >
          <q-badge
            v-if="ticket.unreadMessages"
            style="border-radius: 10px; z-index: 99"
            class="text-center text-bold"
            floating
            dense
            text-color="white"
            color="red"
            :label="ticket.unreadMessages"
          />
          <q-avatar size="50px">
            <q-img
              :src="profilePicUrl"
              @error="onImageError"
              style="width: 50px; height: 50px; border-radius: 50%"
            />
          </q-avatar>
          <q-tooltip> Atender </q-tooltip>
        </q-btn>
        <q-avatar
          size="50px"
          v-else
          class="relative-position"
        >
          <q-badge
            v-if="ticket.unreadMessages"
            style="border-radius: 10px; z-index: 99"
            class="text-center text-bold"
            floating
            dense
            text-color="white"
            color="red"
            :label="ticket.unreadMessages"
          />
          <q-img
            :src="profilePicUrl"
            @error="onImageError"
            style="width: 50px; height: 50px; border-radius: 50%"
          />
        </q-avatar>
      </q-item-section>

      <q-item-section>
        <q-item-label
          class="text-bold"
          lines="1"
        >
          {{ ticket.contact?.name || ticket.name || 'Sem nome' }}
          <q-icon
            size="20px"
            :name="`img:${ticket.channel}-logo.png`"
            class="q-ml-xs"
          />
          <span class="absolute-top-right q-pr-xs q-pt-xs">
            <q-badge
              dense
              style="font-size: 0.7em"
              transparent
              square
              text-color="grey-10"
              color="secondary"
              :label="dataInWords(ticket.lastMessageAt || ticket.updatedAt)"
            />
          </span>
        </q-item-label>

        <q-item-label
          lines="1"
          caption
        >
          {{ ticket.lastMessage || '...' }}
        </q-item-label>

        <div class="row items-center q-gutter-xs">
          <q-btn
            flat
            dense
            round
            size="xs"
            icon="sync"
            color="primary"
            @click.stop="sincronizarMensagens"
            :loading="sincronizando"
            v-if="ticket.channel === 'whatsapp'"
          >
            <q-tooltip>Sincronizar mensagens</q-tooltip>
          </q-btn>

          <q-icon
            v-for="tag in tagsDoTicket"
            :key="tag.tag"
            :style="{ color: tag.color }"
            name="mdi-tag"
            size="1.4em"
          >
            <q-tooltip>{{ tag.tag }}</q-tooltip>
          </q-icon>

          <q-icon
            v-for="wallet in walletsDoTicket"
            :key="wallet.wallet"
            name="mdi-wallet"
            size="1.4em"
          >
            <q-tooltip>{{ wallet.wallet }}</q-tooltip>
          </q-icon>
        </div>

        <q-item-label
          lines="1"
          caption
          class="row items-center"
        >
          #{{ ticket.id }}
          <span class="q-ml-sm text-italic">
            {{ ticket.queue || filas.find(f => f.id === ticket.queueId)?.queue || '' }}
          </span>
          <q-space />
          <q-icon
            v-if="ticket.status === 'closed'"
            name="mdi-check-circle-outline"
            color="positive"
            size="1.8em"
          >
            <q-tooltip> Atendimento Resolvido </q-tooltip>
          </q-icon>
          <q-icon
            v-if="(ticket.stepAutoReplyId || ticket.chatFlowId) && ticket.status === 'pending'"
            name="mdi-robot"
            color="primary"
            size="1.8em"
          >
            <q-tooltip> ChatBot atendendo </q-tooltip>
          </q-icon>
        </q-item-label>

        <q-item-label
          lines="1"
          caption
          class="text-italic"
          v-if="ticket.username"
        >
          Usuário: {{ ticket.username }}
        </q-item-label>
      </q-item-section>

      <q-item-section
        avatar
        side
        class="q-px-none"
      >
        <q-btn
          flat
          @click.stop="espiarAtendimento(ticket)"
          push
          color="primary"
          dense
          round
          v-if="ticket.status === 'pending'"
        >
          <q-icon
            size="20px"
            name="mdi-eye-outline"
          />
          <q-tooltip> Espiar </q-tooltip>
        </q-btn>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script setup>
import { formatDistance, isValid as isValidDate, parseISO } from 'date-fns'
import pt from 'date-fns/locale/pt-BR'
import { storeToRefs } from 'pinia'
import { useQuasar } from 'quasar'
import defaultAvatar from 'src/assets/avatar.png'
import { ObterContato } from 'src/service/contatos'
import { SincronizarMensagensTicket } from 'src/service/tickets'
import { useTicketStore } from 'src/stores/useTicketStore'
import { notificarErro, notificarSucesso } from 'src/utils/helpersNotifications'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useTicketActions } from './useTicketActions'

const props = defineProps({
  ticket: {
    type: Object,
    required: true
  },
  filas: {
    type: Array,
    default: () => []
  }
})

const $q = useQuasar()
const router = useRouter()
const ticketStore = useTicketStore()
const { ticketFocado } = storeToRefs(ticketStore)
const { iniciarAtendimento, espiarAtendimento } = useTicketActions()

const tagsDoTicket = ref([])
const walletsDoTicket = ref([])
const profilePicUrl = ref(props.ticket.profilePicUrl || defaultAvatar)
const sincronizando = ref(false)
const recalcularHoraTrigger = ref(0)

const borderColor = {
  open: '#007bff',
  pending: '#dc3545',
  closed: '#28a745'
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
    const { data } = await ObterContato(props.ticket.contactId)
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
    await SincronizarMensagensTicket(props.ticket.id)
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
  background: rgba(0, 123, 255, 0.1) !important
  border-radius: 10px !important

.ticketBorder
  border-left: 6px solid #ccc
  transition: all 0.3s ease

.ticket-unread
  background-color: rgba(220, 53, 69, 0.05)
  animation: pulse-light 2s infinite

@keyframes pulse-light
  0%
    background-color: rgba(220, 53, 69, 0.05)
  50%
    background-color: rgba(220, 53, 69, 0.1)
  100%
    background-color: rgba(220, 53, 69, 0.05)
</style>
