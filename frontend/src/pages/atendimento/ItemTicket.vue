<template>
  <q-list separator
    style="max-width: 370px"
    class="q-px-sm q-py-none q-pt-sm">
    <!-- :clickable="ticket.status !== 'pending' && (ticket.id !== $store.getters['ticketFocado'].id || $route.name !== 'chat')" -->
    <q-item clickable
      style="height: 95px; max-width: 100%;"
      @click="abrirChatContato(ticket)"
      :style="`border-left: 6px solid ${borderColor[ticket.status]}; border-radius: 10px`"
      id="item-ticket-houve"
      class="ticketBorder q-px-sm"
      :class="{
        'ticketBorderGrey': !$q.dark.isActive,
        'ticket-active-item': ticket.id === $store.getters['ticketFocado'].id,
        'ticketNotAnswered': ticket.answered == false && ticket.isGroup == false && ticket.status == 'open',
        'ticket-unread': ticket.unreadMessages > 0
      }">
      <q-item-section avatar
        class="q-px-none">
        <q-btn flat
          @click="iniciarAtendimento(ticket)"
          push
          color="primary"
          dense
          round
          v-if="ticket.status === 'pending' || (buscaTicket && ticket.status === 'pending')">
          <q-badge v-if="ticket.unreadMessages"
            style="border-radius: 10px;"
            class="text-center text-bold"
            floating
            dense
            text-color="white"
            color="red"
            :label="ticket.unreadMessages" />
          <q-avatar>
            <img :src="ticket.profilePicUrl"
              onerror="this.style.display='none'"
              style="width: 50px; height: 50px; border-radius: 50%;" />
          </q-avatar>
          <q-tooltip>
            Atender
          </q-tooltip>
        </q-btn>
        <q-avatar size="50px"
          v-if="ticket.status !== 'pending'"
          class="relative-position">
          <q-badge v-if="ticket.unreadMessages"
            style="border-radius: 10px; z-index: 99"
            class="text-center text-bold"
            floating
            dense
            text-color="white"
            color="red"
            :label="ticket.unreadMessages" />
          <img :src="ticket.profilePicUrl"
            onerror="this.style.display='none'"
            v-show="ticket.profilePicUrl">
          <q-icon size="50px"
            name="mdi-account-circle"
            color="grey-8" />
        </q-avatar>

      </q-item-section>
      <q-item-section id="ListItemsTicket">
        <q-item-label class="text-bold"
          lines="1">
          {{ !ticket.name ? ticket.contact.name : ticket.name }}
          <q-icon size="20px"
            :name="`img:${ticket.channel}-logo.png`" />
          <span class="absolute-top-right q-pr-xs">
            <q-badge dense
              style="font-size: .7em;"
              transparent
              square
              text-color="grey-10"
              color="secondary"
              :label="dataInWords(ticket.lastMessageAt, ticket.updatedAt)"
              :key="recalcularHora" />
          </span>
        </q-item-label>
        <q-item-label lines="1"
          caption>
          {{ ticket.lastMessage }}
        </q-item-label>
        <q-item-label lines="1"
          caption>
          #{{ ticket.id }}
          <q-icon
            v-for="tag in tagsDoTicket"
            :key="tag.tag"
            :style="{ color: tag.color }"
            name="mdi-tag"
            size="1.4em"
            class="q-mb-sm">
            <q-tooltip>
              {{tag && tag.tag}}
            </q-tooltip>
          </q-icon>
          <q-icon
            v-for="wallet in walletsDoTicket"
            :key="wallet.wallet"
            name="mdi-wallet"
            size="1.4em"
            class="q-mb-sm">
            <q-tooltip>
              {{wallet.wallet}}
            </q-tooltip>
          </q-icon>
          <!-- <span class="q-ml-sm text-bold" :style="{ color: (ticket.queue || obterNomeFila(ticket)) ? 'black' : '' }"
          :color="$q.dark.isActive ? 'blue-9' : 'blue-2'"
          > -->
          <span class="q-ml-sm text-bold"
          :color="$q.dark.isActive ? 'white ' : 'black'"
          >
            {{ `${ticket.queue || obterNomeFila(ticket) || ''}` }}
          </span>
          <!-- <span class="q-ml-sm text-bold" :style="{ color: 'black' }">
            Etiquetas:
          </span> -->
          <!-- <q-chip
            v-for="tag in tagsDoTicket"
            :color="tag.color"
            :key="tag.tag"
            dense
            square
            :label="tag && tag.tag"
            size="10px"
            class="q-mr-md text-bold" /> -->
          <span class="absolute-bottom-right ">
            <q-icon v-if="ticket.status === 'closed'"
              name="mdi-check-circle-outline"
              color="positive"
              size="1.8em"
              class="q-mb-sm">
              <q-tooltip>
                Atendimento Resolvido
              </q-tooltip>
            </q-icon>
            <q-icon
              v-if="(ticket.stepAutoReplyId && ticket.autoReplyId && ticket.status === 'pending') || (ticket.chatFlowId && ticket.stepChatFlow && ticket.status === 'pending')"
              name="mdi-robot"
              color="primary"
              size="1.8em"
              class="q-mb-sm">
              <q-tooltip>
                ChatBot atendendo
              </q-tooltip>
            </q-icon>
          </span>
        </q-item-label>
        <q-item-label class="row col items-center justify-between"
          caption>
          Usuário: {{ ticket.username || '' }}
          <q-chip :color="$q.dark.isActive ? '$primary' : 'blue-2'"
            dense
            square
            :label="ticket.whatsapp && ticket.whatsapp.name"
            size="10px"
            class="q-mr-md text-bold" />
        </q-item-label>
        <!-- <span class="absolute-bottom-right" v-if="ticket.unreadMessages">
          <q-badge style="font-size: .8em; border-radius: 10px;" class="q-py-xs" dense text-color="white" color="green" :label="ticket.unreadMessages" />
        </span> -->
        </q-item-section>
        <q-item-section avatar
        class="q-px-none">
        <q-btn flat
          @click="espiarAtendimento(ticket)"
          push
          color="primary"
          dense
          round
          v-if="!$q.screen.xs && (ticket.status === 'pending' || (buscaTicket && ticket.status === 'pending'))"
          class="q-mr-md">
          <q-dialog v-model="isTicketModalOpen">
            <q-card :style="cardStyle">
              <q-card-section class="row items-center justify-between">
                <div class="text-h6">{{ 'Espiar Atendimento: ' + currentTicket.id}}</div>
                <q-btn icon="close" flat round @click="closeModal" />
              </q-card-section>
              <q-card-section>
                <MensagemChat :mensagens="currentTicket.messages" />
              </q-card-section>
            </q-card>
          </q-dialog>
          <!-- <q-badge v-if="ticket.unreadMessages"
            style="border-radius: 10px;"
            class="text-center text-bold"
            floating
            dense
            text-color="black"
            color="blue-2"
            :label="ticket.unreadMessages" /> -->
          <q-avatar>
            <q-icon size="20px"
              name="mdi-eye-outline" />
          </q-avatar>
          <q-tooltip>
            Espiar
          </q-tooltip>
        </q-btn>

        <q-btn flat
          @click="espiarAtendimento(ticket)"
          push
          color="primary"
          dense
          round
          v-if="$q.screen.xs && (ticket.status === 'pending' || (buscaTicket && ticket.status === 'pending'))"
          class="q-mr-md">
          <q-dialog v-model="isTicketModalOpen">
            <q-card :style="cardStyle">
              <q-card-section class="row items-center justify-between">
                <div class="text-h6">{{ 'Espiar Atendimento: ' + currentTicket.id}}</div>
                <q-btn icon="close" flat round @click="closeModal" />
              </q-card-section>
              <q-card-section>
                <MensagemChat :mensagens="currentTicket.messages" />
              </q-card-section>
            </q-card>
          </q-dialog>
          <q-badge v-if="ticket.unreadMessages"
            style="border-radius: 10px;"
            class="text-center text-bold"
            floating
            dense
            text-color="black"
            color="blue-2"
            :label="ticket.unreadMessages" />
          <q-avatar>
            <q-icon size="20px"
              name="mdi-eye-outline" />
          </q-avatar>
          <q-tooltip>
            Espiar
          </q-tooltip>
        </q-btn>

        <!-- <span class="absolute-bottom-right" v-if="ticket.unreadMessages">
          <q-badge style="font-size: .8em; border-radius: 10px;" class="q-py-xs" dense text-color="white" color="green" :label="ticket.unreadMessages" />
        </span> -->
      </q-item-section>
    </q-item>
    <!-- <q-separator color="grey-2"
      inset="item" /> -->
    <!-- <q-separator /> -->
  </q-list>
</template>

<script>
import { formatDistance, parseJSON } from 'date-fns'
import pt from 'date-fns/locale/pt-BR'
import mixinAtualizarStatusTicket from './mixinAtualizarStatusTicket'
import { outlinedAccountCircle } from '@quasar/extras/material-icons-outlined'
// import { GetColorName } from 'hex-color-to-color-name';
import { ObterContato } from 'src/service/contatos'
import MensagemChat from './MensagemChat.vue'
import whatsBackground from 'src/assets/wa-background.png'
import whatsBackgroundDark from 'src/assets/wa-background-dark.jpg'
import defaultAvatar from 'src/assets/avatar.png'

export default {
  name: 'ItemTicket',
  mixins: [mixinAtualizarStatusTicket],
  components: {
    MensagemChat
  },
  data () {
    return {
      whatsBackground: whatsBackground,
      whatsBackgroundDark: whatsBackgroundDark,
      isTicketModalOpen: false,
      currentTicket: {},
      tagsDoTicket: [],
      walletsDoTicket: [],
      // colorName: null,
      outlinedAccountCircle,
      recalcularHora: 1,
      statusAbreviado: {
        open: 'A',
        pending: 'P',
        closed: 'R'
      },
      status: {
        open: 'Aberto',
        pending: 'Pendente',
        closed: 'Resolvido'
      },
      color: {
        open: 'primary',
        pending: 'negative',
        closed: 'positive'
      },
      borderColor: {
        open: 'primary',
        pending: 'negative',
        closed: 'positive'
      },
      defaultAvatar,
      profilePicUrl: null
    }
  },
  props: {
    ticket: {
      type: Object,
      default: () => {
      }
    },
    buscaTicket: {
      type: Boolean,
      default: false
    },
    filas: {
      type: Array,
      default: () => []
    },
    etiquetas: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    cardStyle () {
      return {
        backgroundImage: this.$q.dark.isActive ? `url(${this.whatsBackgroundDark})` : `url(${this.whatsBackground})`
      }
    }
  },
  async mounted () {
    this.tagsDoTicket = await this.obterInformacoes(this.ticket, 'tags')
    this.walletsDoTicket = await this.obterInformacoes(this.ticket, 'carteiras')
    if (this.ticket.contact?.number) {
      this.profilePicUrl = await this.$parent.getProfilePic(this.ticket.contact.number)
    }
    this.$store.subscribe(async (mutation, state) => {
      if (mutation.type === 'UPDATE_CONTACT' && mutation.payload.id === this.ticket.contactId) {
        this.tagsDoTicket = await this.obterInformacoes(this.ticket, 'tags')
        this.walletsDoTicket = await this.obterInformacoes(this.ticket, 'carteiras')
      }
    })
  },
  methods: {
    closeModal () {
      this.isTicketModalOpen = false
    },
    obterNomeFila (ticket) {
      try {
        const fila = this.filas.find(f => f.id === ticket.queueId)
        if (fila) {
          return fila.queue
        }
        return ''
      } catch (error) {
        return ''
      }
    },
    async obterInformacoes (ticket, tipo) {
      try {
        const contato = await ObterContato(ticket.contactId)
        if (contato) {
          if (tipo === 'tags') {
            const tags = contato.data.tags
            return tags.map(tag => ({ tag: tag.tag, color: tag.color }))
          } else if (tipo === 'carteiras') {
            const wallets = contato.data.wallets
            return wallets.map(wallet => ({ wallet: wallet.name }))
          }
        }
        return []
      } catch (error) {
        console.error(`Erro ao obter ${tipo}:`, error)
        return []
      }
    },
    dataInWords (timestamp, updated) {
      let data = parseJSON(updated)
      if (timestamp) {
        data = new Date(Number(timestamp))
      }
      return formatDistance(data, new Date(), { locale: pt })
    },
    abrirChatContato (ticket) {
      // caso esteja em um tamanho mobile, fechar a drawer dos contatos
      if (this.$q.screen.lt.md && ticket.status !== 'pending') {
        this.$root.$emit('infor-cabecalo-chat:acao-menu')
      }
      if (!(ticket.status !== 'pending' && (ticket.id !== this.$store.getters.ticketFocado.id || this.$route.name !== 'chat'))) return
      this.$store.commit('SET_HAS_MORE', true)
      this.$store.dispatch('AbrirChatMensagens', ticket)
    },
    onImageError () {
      this.profilePicUrl = this.defaultAvatar
    },
    async loadProfilePic () {
      if (this.ticket.contact?.number) {
        this.profilePicUrl = await this.$parent.getProfilePic(this.ticket.contact.number)
      }
    }
  },
  created () {
    setInterval(() => {
      this.recalcularHora++
    }, 20000)
  }
}
</script>

<style lang="sass">
img:after
  content: ""
  vertical-align: middle
  display: inline-block
  border-radius: 50%
  font-size: 48px
  position: absolute
  top: 0
  left: 0
  width: inherit
  height: inherit
  z-index: 10
  // background: #ebebeb url('http://via.placeholder.com/300?text=PlaceHolder') no-repeat center
  color: transparent
.ticket-active-item
  // border: 2px solid rgb(21, 120, 173)
  // border-left: 3px solid $light //rgb(21, 120, 173)
  border-radius: 0
  position: relative
  height: 100%
  background: $blue-1 //$active-item-ticket
  // background-color: #e6ebf5
#ListItemsTicket
  .q-item__label + .q-item__label
    margin-top: 1.5px
#item-ticket-houve:hover
  background: $blue-1 //$active-item-ticket
  transition: all .2s
.primary
  border-left: 3px solid $primary
.negative
  border-left: 3px solid $negative
.positive
  border-left: 3px solid $positive
.ticketNotAnswered
  border-left: 5px solid $warning !important
.ticketBorder
  border-left: 5px solid $grey-9
.ticketBorderGrey
  border-left: 5px solid $grey-4
.ticket-unread
  animation: pulse-red 1.5s infinite
  background-color: rgba(255, 0, 0, 0.1)
@keyframes pulse-red
  0%
    background-color: rgba(255, 0, 0, 0.1)
    transform: scale(1)
  50%
    background-color: rgba(255, 0, 0, 0.3)
    transform: scale(1.02)
  100%
    background-color: rgba(255, 0, 0, 0.1)
    transform: scale(1)
</style>
