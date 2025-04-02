<template>
  <q-list separator
    v-if="isValid"
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
            style="border-radius: 10px; z-index: 99;"
            class="text-center text-bold"
            floating
            dense
            text-color="white"
            color="red"
            :label="ticket.unreadMessages" />
          <q-avatar>
            <img :src="ticket.profilePicUrl || profilePicUrl || defaultAvatar"
              @error="onImageError"
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
            style="border-radius: 10px; z-index: 99;"
            class="text-center text-bold"
            floating
            dense
            text-color="white"
            color="red"
            :label="ticket.unreadMessages" />
          <img :src="ticket.profilePicUrl || profilePicUrl || defaultAvatar"
            v-if="ticket.profilePicUrl || profilePicUrl"
            @error="onImageError"
            style="width: 50px; height: 50px; border-radius: 50%;">
          <q-icon v-else
            size="50px"
            name="mdi-account-circle"
            color="grey-8" />
        </q-avatar>

      </q-item-section>
      <q-item-section id="ListItemsTicket">
        <q-item-label class="text-bold"
          lines="1">
          {{ !ticket.name ? (ticket.contact ? ticket.contact.name : 'Sem nome') : ticket.name }}
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
          >
            <q-tooltip>Sincronizar mensagens do WhatsApp</q-tooltip>
          </q-btn>
          <q-badge dense
            style="font-size: .7em;"
            transparent
            square
            text-color="grey-10"
            color="secondary"
            :label="dataInWords(ticket.lastMessageAt, ticket.updatedAt)"
            :key="recalcularHora" />
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
        </div>
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
import { SincronizarMensagensTicket } from 'src/service/tickets'

// Cache de imagens para evitar recarregamento constante
const profileImageCache = {}

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
      profilePicUrl: defaultAvatar,
      originalProfilePicUrl: null, // Guardar URL original
      sincronizando: false,
      updateTimer: null
    }
  },
  props: {
    ticket: {
      type: Object,
      default: () => ({})
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
    },
    isValid () {
      // Verificar se o ticket é válido para renderização
      if (!this.ticket || !this.ticket.id) {
        return false
      }

      // Verificar outras propriedades essenciais
      if (!this.ticket.status) {
        console.warn('ItemTicket: ticket sem status', this.ticket.id)
        return false
      }

      return true
    },
    ticketHash () {
      // Hash único para detectar mudanças no ticket
      if (!this.isValid) return ''
      return `${this.ticket.id}-${this.ticket.updatedAt}-${this.ticket.unreadMessages}-${this.ticket.status}`
    }
  },
  watch: {
    ticket: {
      handler (newVal, oldVal) {
        if (newVal && newVal.id) {
          this.loadTicketInfo()
        }
      },
      deep: true,
      immediate: true
    },
    ticketHash: {
      handler (newVal, oldVal) {
        if (newVal && newVal !== oldVal) {
          this.loadTicketInfo()
        }
      }
    }
  },
  async mounted () {
    try {
      if (!this.isValid) {
        console.warn('ItemTicket: ticket inválido', this.ticket)
        return
      }

      await this.loadTicketInfo()

      this.$store.subscribe(async (mutation, state) => {
        if (mutation.type === 'UPDATE_CONTACT' && mutation.payload.id === this.ticket.contactId) {
          this.tagsDoTicket = await this.obterInformacoes(this.ticket, 'tags')
          this.walletsDoTicket = await this.obterInformacoes(this.ticket, 'carteiras')
        }

        if (mutation.type === 'UPDATE_TICKET' && mutation.payload.ticket && mutation.payload.ticket.id === this.ticket.id) {
          this.loadTicketInfo()
        }

        if (mutation.type === 'UPDATE_TICKET_UNREAD_MESSAGES' &&
            mutation.payload.ticket &&
            mutation.payload.ticket.id === this.ticket.id) {
          this.loadTicketInfo()
        }
      })

      // Escutar evento de tickets atualizados
      this.$root.$on('tickets-updated', this.loadTicketInfo)
    } catch (error) {
      console.error('Erro ao montar ItemTicket:', error)
    }

    // Atualizar a hora a cada 20 segundos
    this.hourUpdateInterval = setInterval(() => {
      this.recalcularHora++
    }, 20000)
  },
  beforeDestroy () {
    // Limpar intervalos e listeners ao destruir o componente
    clearInterval(this.hourUpdateInterval)
    if (this.updateTimer) {
      clearTimeout(this.updateTimer)
    }
    this.$root.$off('tickets-updated', this.loadTicketInfo)
  },
  methods: {
    async loadTicketInfo () {
      if (!this.isValid) return

      // Definir avatar padrão imediatamente
      if (!this.profilePicUrl) {
        this.profilePicUrl = this.defaultAvatar
      }

      // Debounce para evitar múltiplas requisições em sequência
      if (this.updateTimer) {
        clearTimeout(this.updateTimer)
      }

      this.updateTimer = setTimeout(async () => {
        try {
          this.tagsDoTicket = await this.obterInformacoes(this.ticket, 'tags')
          this.walletsDoTicket = await this.obterInformacoes(this.ticket, 'carteiras')

          // Preservar a imagem original se já existe no ticket
          if (this.ticket.originalProfilePicUrl) {
            this.profilePicUrl = this.ticket.originalProfilePicUrl
            this.originalProfilePicUrl = this.ticket.originalProfilePicUrl
            return
          }

          if (this.ticket.contact?.number) {
            // Verificar primeiro no cache
            const cacheKey = `profile_${this.ticket.contact.number}`
            if (profileImageCache[cacheKey]) {
              this.profilePicUrl = profileImageCache[cacheKey]
              this.originalProfilePicUrl = profileImageCache[cacheKey]
            } else if (typeof this.$parent.getProfilePic === 'function') {
              try {
                // Buscar URL da imagem
                const profileUrl = await this.$parent.getProfilePic(this.ticket.contact.number)

                // Verificar se a URL é do WhatsApp (problemática)
                if (this.isInvalidImageUrl(profileUrl)) {
                  this.profilePicUrl = this.defaultAvatar
                } else {
                  this.profilePicUrl = profileUrl || this.defaultAvatar
                  this.originalProfilePicUrl = profileUrl // Guardar URL original

                  // Preservar a URL original no ticket para persistência
                  this.$set(this.ticket, 'originalProfilePicUrl', profileUrl)
                }

                // Salvar no cache
                profileImageCache[cacheKey] = this.profilePicUrl
              } catch (error) {
                console.error('Erro ao buscar imagem de perfil:', error)
                this.profilePicUrl = this.defaultAvatar
              }
            } else {
              this.profilePicUrl = this.defaultAvatar
            }
          }

          // Forçar atualização do componente
          this.$forceUpdate()
        } catch (error) {
          console.error('Erro ao carregar informações do ticket:', error)
          this.profilePicUrl = this.defaultAvatar
        }
      }, 200)
    },
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
        if (!ticket || !ticket.contactId) {
          console.warn(`Tentativa de obter ${tipo} com ticket inválido:`, ticket)
          return []
        }

        const contato = await ObterContato(ticket.contactId)
        if (contato && contato.data) {
          if (tipo === 'tags' && Array.isArray(contato.data.tags)) {
            return contato.data.tags.map(tag => ({ tag: tag.tag, color: tag.color }))
          } else if (tipo === 'carteiras' && Array.isArray(contato.data.wallets)) {
            return contato.data.wallets.map(wallet => ({ wallet: wallet.name }))
          }
        }
        return []
      } catch (error) {
        console.error(`Erro ao obter ${tipo}:`, error)
        return []
      }
    },
    dataInWords (timestamp, updated) {
      try {
        // Se nenhum dos valores for válido, usar data atual
        if (!timestamp && !updated) {
          return formatDistance(new Date(), new Date(), { locale: pt })
        }

        let data

        // Verificar se timestamp existe e é válido
        if (timestamp && !isNaN(Number(timestamp))) {
          const timestampNum = Number(timestamp)

          // Verificar se é timestamp em segundos (10 dígitos) e converter para milissegundos
          if (timestampNum > 1000000000 && timestampNum < 9999999999) {
            data = new Date(timestampNum * 1000)
          } else if (timestampNum > 1262304000000 && timestampNum < 2524608000000) { // Verificar se o timestamp em milissegundos é válido (após 2010 e antes de 2050)
            data = new Date(timestampNum)
          } else if (timestampNum > 2524608000000) { // Timestamp futuro (possivelmente em segundos mas já convertido erroneamente)
            console.warn('Timestamp futuro detectado:', timestampNum)
            data = new Date() // Usar data atual para valores inválidos
          } else {
            console.warn('Timestamp inválido:', timestamp)
            data = new Date() // Usar data atual para valores inválidos
          }
        } else if (updated) {
          try {
            // Tentar parse do updated
            data = parseJSON(updated)

            // Verificar se a data parseada é válida
            if (isNaN(data.getTime())) {
              throw new Error('Data parseada inválida')
            }
          } catch (parseError) {
            console.warn('Erro ao fazer parse da data updated:', parseError)
            data = new Date() // Usar data atual para valores inválidos
          }
        } else {
          // Se nenhum dos dois for válido, usar data atual
          data = new Date()
        }

        return formatDistance(data, new Date(), { locale: pt })
      } catch (error) {
        console.error('Erro ao formatar data:', error)
        return 'agora' // Retornar "agora" em caso de erro
      }
    },
    abrirChatContato (ticket) {
      if (!this.isValid) return

      // caso esteja em um tamanho mobile, fechar a drawer dos contatos
      if (this.$q.screen.lt.md && ticket.status !== 'pending') {
        this.$root.$emit('infor-cabecalo-chat:acao-menu')
      }
      if (!(ticket.status !== 'pending' && (ticket.id !== this.$store.getters.ticketFocado.id || this.$route.name !== 'chat'))) return
      this.$store.commit('SET_HAS_MORE', true)
      this.$store.dispatch('AbrirChatMensagens', ticket)
    },
    onImageError (e) {
      // Se já estamos usando o avatar padrão, não fazer nada para evitar loops
      if (e.target.src === this.defaultAvatar) {
        return
      }

      // Se temos a imagem original e ela é diferente da que falhou, tentar usar
      if (this.originalProfilePicUrl && e.target.src !== this.originalProfilePicUrl) {
        e.target.src = this.originalProfilePicUrl
        return
      }

      // Evitar loops de erro e registrar o problema para depuração
      e.target.onerror = null

      // Definir a imagem padrão como fonte
      e.target.src = this.defaultAvatar

      // Também atualizar a referência da imagem no componente
      this.profilePicUrl = this.defaultAvatar

      // Atualizar no ticket e no cache (mas preservar a original)
      if (this.ticket && this.ticket.contact?.number) {
        const cacheKey = `profile_${this.ticket.contact.number}`
        profileImageCache[cacheKey] = this.defaultAvatar
      }
    },
    async sincronizarMensagens () {
      if (!this.isValid) return

      try {
        this.sincronizando = true
        await SincronizarMensagensTicket(this.ticket.id)
        this.$q.notify({
          message: 'Mensagens sincronizadas com sucesso',
          type: 'positive'
        })
      } catch (err) {
        this.$q.notify({
          message: 'Erro ao sincronizar mensagens: ' + (err.response?.data?.error || err.message),
          type: 'negative'
        })
      } finally {
        this.sincronizando = false
      }
    },
    isInvalidImageUrl (url) {
      if (!url) return true

      // Se for a imagem original armazenada, consideramos válida
      if (this.originalProfilePicUrl && url === this.originalProfilePicUrl) {
        return false
      }

      // Verificar URLs do WhatsApp que são conhecidas por falhar
      if (
        url.includes('pps.whatsapp.net') ||
        url.includes('web.whatsapp.com') ||
        url.includes('whatsapp') ||
        /\/t\d+\.\d+-\d+\//.test(url) // Padrão comum em URLs do WhatsApp
      ) {
        return true
      }

      // Verificar se a URL é de um domínio bloqueado ou tem extensão inválida
      const blockedDomains = ['mmg.whatsapp.net', 'mmg-fna.whatsapp.net']
      if (blockedDomains.some(domain => url.includes(domain))) {
        return true
      }

      return false
    }
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
