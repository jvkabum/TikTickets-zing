<template>
  <div
    class="WAL position-relative q-page"
    :style="style"
  >
    <q-layout
      class="WAL__layout no-shadow"
      container
      view="lHr LpR lFr"
      style="border-radius: 20px; overflow: hidden; margin: 10px; height: calc(100% - 20px) !important; width: calc(100% - 20px) !important"
    >
      <q-drawer
        v-model="drawerTickets"
        @hide="drawerTickets = false"
        show-if-above
        :overlay="$q.screen.lt.md"
        persistent
        :breakpoint="769"
        bordered
        :width="$q.screen.lt.md ? $q.screen.width : 380"
        :content-class="$q.dark.isActive ? 'bg-transparent border-glass' : 'bg-transparent border-glass'"
      >
        <q-toolbar
          class="q-gutter-xs full-width no-border-radius glass-premium no-shadow"
          style="height: 60px; min-height: 60px; border-bottom: 2px solid rgba(var(--q-primary), 0.1)"
        >
          <q-btn-dropdown
            no-caps
            color="black"
            class="text-bold btn-rounded"
            ripple
          >
            <template v-slot:label>
              <div
                :style="{ maxWidth: $q.screen.lt.sm ? '120px' : '' }"
                class="ellipsis"
              >
                {{ username || 'Usuário' }}
              </div>
            </template>
            <q-list style="min-width: 100px">
              <q-item
                clickable
                v-close-popup
                @click="modalUsuario = true"
              >
                <q-item-section>Perfil</q-item-section>
              </q-item>
              <q-item
                clickable
                v-close-popup
                @click="efetuarLogout"
              >
                <q-item-section>Sair</q-item-section>
              </q-item>
              <q-separator />
            </q-list>
          </q-btn-dropdown>
          <q-space />
          <q-btn
            color="black"
            class="btn-rounded"
            icon="mdi-home"
            @click="() => router.push({ name: 'home-dashboard' })"
          >
            <q-tooltip content-class="bg-padrao text-grey-9 text-bold"> Retornar ao menu </q-tooltip>
          </q-btn>
        </q-toolbar>
        <q-toolbar
          v-show="toolbarSearch"
          class="row q-gutter-sm q-py-sm items-center glass"
        >
          <q-separator class="absolute-top" />
          <q-btn
            :icon="!cFiltroSelecionado ? 'mdi-filter-outline' : 'mdi-filter-plus'"
            class="btn-rounded"
            :color="cFiltroSelecionado ? 'deep-orange-9' : 'primary'"
          >
            <q-menu
              content-class="shadow-10 no-scroll"
              square
            >
              <div
                class="row q-pa-sm"
                style="min-width: 350px; max-width: 350px"
              >
                <div class="q-ma-sm full-width">
                  <div class="row items-center justify-between q-mb-md relative-position">
                    <div class="text-h6">Filtros Avançados</div>
                    <q-btn
                      color="negative"
                      icon="close"
                      flat
                      round
                      v-close-popup
                      class="absolute-top-right q-mr-xs"
                      size="md"
                      style="margin-top: -2px"
                    >
                      <q-tooltip>Fechar</q-tooltip>
                    </q-btn>
                  </div>
                  <q-separator />
                  <div class="row q-mt-md">
                    <q-checkbox
                      v-model="pesquisaTickets.showAll"
                      label="Visualizar todos os atendimentos (Tickets)"
                      @update:model-value="filtrarTickets"
                    />
                    <q-checkbox
                      v-model="pesquisaTickets.withUnreadMessages"
                      label="Somente com mensagens não lidas"
                      @update:model-value="filtrarTickets"
                    />
                    <q-checkbox
                      v-model="pesquisaTickets.isNotAssignedUser"
                      label="Somente sem usuário atribuído"
                      @update:model-value="filtrarTickets"
                    />
                  </div>
                  <q-select
                    v-model="pesquisaTickets.queuesIds"
                    multiple
                    :options="filas"
                    use-chips
                    option-value="id"
                    option-label="queue"
                    emit-value
                    map-options
                    label="Filas"
                    outlined
                    dense
                    @update:model-value="filtrarTickets"
                  />
                  <q-select
                    v-model="pesquisaTickets.tagsIds"
                    multiple
                    :options="etiquetas"
                    use-chips
                    option-value="id"
                    option-label="tag"
                    emit-value
                    map-options
                    label="Etiquetas"
                    outlined
                    dense
                    class="q-mt-sm"
                    @update:model-value="filtrarTickets"
                  />
                  <div class="row items-center justify-center q-mt-sm">
                    <q-btn
                      label="Limpar Filtros"
                      color="primary"
                      flat
                      @click="limparFiltro"
                    />
                  </div>
                </div>
              </div>
            </q-menu>
          </q-btn>
          <q-input
            v-model="pesquisaTickets.searchParam"
            placeholder="Pesquisar..."
            outlined
            dense
            rounded
            class="col"
            @update:model-value="debouncedFiltrarTickets"
          >
            <template v-slot:prepend>
              <q-icon name="mdi-magnify" />
            </template>
          </q-input>
          <q-btn
            icon="mdi-account-plus-outline"
            color="primary"
            round
            flat
            @click="modalNovoTicket = true"
          >
            <q-tooltip>Novo Ticket</q-tooltip>
          </q-btn>
        </q-toolbar>

        <q-tabs
          v-model="selectedTab"
          dense
          class="text-grey-7 rounded-borders q-ma-sm glass-premium"
          active-color="primary"
          indicator-color="primary"
          align="justify"
          narrow-indicator
        >
          <q-tab name="open" class="q-py-sm">
            <div class="column items-center">
              <span class="text-uppercase text-weight-bold" style="font-size: 10px">Abertos</span>
              <q-badge 
                v-if="ticketCounts?.open > 0" 
                :label="ticketCounts.open" 
                color="red" 
                text-color="white" 
                class="q-mt-xs text-bold shadow-1" 
                style="border-radius: 4px; min-width: 20px"
              />
              <q-badge v-else label="0" color="transparent" text-color="grey-4" class="q-mt-xs" style="min-width: 20px" />
            </div>
          </q-tab>
          <q-tab name="pending" class="q-py-sm">
            <div class="column items-center">
              <span class="text-uppercase text-weight-bold" style="font-size: 10px">Pendentes</span>
              <q-badge 
                v-if="ticketCounts?.pending > 0" 
                :label="ticketCounts.pending" 
                color="red" 
                text-color="white" 
                class="q-mt-xs text-bold shadow-1" 
                style="border-radius: 4px; min-width: 20px"
              />
              <q-badge v-else label="0" color="transparent" text-color="grey-4" class="q-mt-xs" style="min-width: 20px" />
            </div>
          </q-tab>
          <q-tab name="closed" class="q-py-sm">
            <div class="column items-center">
              <span class="text-uppercase text-weight-bold" style="font-size: 10px">Fechados</span>
              <q-badge 
                v-if="ticketCounts?.closed > 0" 
                :label="ticketCounts.closed" 
                color="red" 
                text-color="white" 
                class="q-mt-xs text-bold shadow-1" 
                style="border-radius: 4px; min-width: 20px"
              />
              <q-badge v-else label="0" color="transparent" text-color="grey-4" class="q-mt-xs" style="min-width: 20px" />
            </div>
          </q-tab>
          <q-tab name="groups" class="q-py-sm">
            <div class="column items-center">
              <span class="text-uppercase text-weight-bold" style="font-size: 10px">Grupos</span>
              <q-badge 
                v-if="ticketCounts?.groups > 0" 
                :label="ticketCounts.groups" 
                color="red" 
                text-color="white" 
                class="q-mt-xs text-bold shadow-1" 
                style="border-radius: 4px; min-width: 20px"
              />
              <q-badge v-else label="0" color="transparent" text-color="grey-4" class="q-mt-xs" style="min-width: 20px" />
            </div>
          </q-tab>
        </q-tabs>

        <q-separator />

        <q-tab-panels
          v-model="selectedTab"
          animated
          class="bg-transparent"
        >
          <q-tab-panel
            v-for="tab in ['open', 'pending', 'closed', 'groups']"
            :key="tab"
            :name="tab"
            class="q-pa-none"
          >
            <TicketList
              :status="tab"
              :search-params="pesquisaTickets"
              :filas="filas"
            />
          </q-tab-panel>
        </q-tab-panels>

        <!-- Barra inferior: Dark Mode + Status Canais -->
        <div
          class="absolute-bottom row justify-between items-center q-px-sm glass-premium"
          style="height: 50px; border-top: 1px solid rgba(255,255,255,0.2)"
        >
          <q-toggle
            size="lg"
            keep-color
            dense
            :model-value="$q.dark.isActive"
            :color="$q.dark.isActive ? 'grey-3' : 'black'"
            checked-icon="mdi-white-balance-sunny"
            unchecked-icon="mdi-weather-sunny"
            @update:model-value="$q.dark.toggle()"
          >
            <q-tooltip>{{ $q.dark.isActive ? 'Desativar' : 'Ativar' }} Modo Escuro</q-tooltip>
          </q-toggle>
          <div class="row items-center">
            <template v-for="item in whatsapps" :key="item.id">
              <q-btn
                rounded
                flat
                dense
                size="18px"
                class="q-mx-xs q-pa-none"
                :style="`opacity: ${item.status === 'CONNECTED' ? 1 : 0.3}`"
              >
                <q-avatar size="24px">
                  <img :src="`/${item.type || 'whatsapp'}-logo.png`" />
                </q-avatar>
                <q-tooltip max-height="200px" content-class="bg-grey-1 text-grey-9">
                  <div class="text-bold">{{ item.name }}</div>
                  <div :class="item.status === 'CONNECTED' ? 'text-positive' : 'text-negative'">
                    {{ item.status }}
                  </div>
                </q-tooltip>
              </q-btn>
            </template>
          </div>
        </div>
      </q-drawer>


      <q-page-container class="bg-transparent">
        <q-page
          class="flex flex-center"
          style="background-image: url('/assets/wa-background.png'); background-repeat: repeat; background-size: contain; opacity: 0.9"
          v-if="!ticketFocado.id"
        >
          <div class="text-center">
            <q-icon
              size="6em"
              color="grey-6"
              name="mdi-emoticon-wink-outline"
            />
            <h1 class="text-h4 text-grey-6">Selecione um ticket!</h1>
          </div>
        </q-page>
        <q-page
          v-else
          class="column no-wrap overflow-hidden"
        >
          <Chat v-if="!cRouteContatos" />
          <router-view v-else />
        </q-page>
      </q-page-container>

      <q-drawer
        v-if="ticketFocado.id && !cRouteContatos"
        v-model="drawerContact"
        side="right"
        bordered
        :width="350"
        :content-class="$q.dark.isActive ? 'bg-transparent border-glass' : 'bg-transparent border-glass'"
      >
        <q-toolbar
          class="glass-premium text-bold"
          style="height: 64px"
        >
          Informações do Contato
          <q-space />
          <q-btn
            flat
            round
            icon="close"
            @click="drawerContact = false"
          />
        </q-toolbar>
        <q-separator />
        <q-scroll-area style="height: calc(100vh - 120px)">
          <div class="q-pa-sm">
            <q-card
              class="glass-premium btn-rounded border-glass"
              flat
            >
              <q-card-section class="text-center" v-if="ticketFocado.contact">
                <q-avatar
                  size="100px"
                  class="bg-grey-3"
                >
                  <q-img
                    v-if="ticketFocado.contact.profilePicUrl"
                    :src="ticketFocado.contact.profilePicUrl"
                  />
                  <q-icon
                    v-else
                    name="mdi-account"
                    size="80px"
                    color="grey-5"
                  />
                </q-avatar>
                <div class="text-h6 q-mt-md">
                  {{ ticketFocado.contact.name }}
                </div>
                <div class="text-caption text-grey-7">
                  {{ ticketFocado.contact.number }}
                </div>
                <q-btn
                  color="primary"
                  class="q-mt-md full-width btn-rounded"
                  flat
                  outline
                  icon="edit"
                  label="Editar Contato"
                  @click="handleEditarContato"
                />
              </q-card-section>
            </q-card>

            <q-card
              class="q-mt-sm glass-premium btn-rounded border-glass"
              flat
              v-if="ticketFocado.contact"
            >
              <q-card-section class="text-bold">
                Etiquetas
                <q-separator />
              </q-card-section>
              <q-card-section class="q-pa-sm">
                <q-select
                  v-model="ticketFocado.contact.tags"
                  multiple
                  :options="etiquetas"
                  use-chips
                  option-value="id"
                  option-label="tag"
                  emit-value
                  map-options
                  outlined
                  dense
                  @update:model-value="atualizarEtiquetasContato"
                />
              </q-card-section>
            </q-card>

            <q-card
              class="q-mt-sm glass-premium btn-rounded border-glass"
              flat
              v-if="cIsExtraInfo"
            >
              <q-card-section class="text-bold">
                Informações Extras
                <q-separator />
              </q-card-section>
              <q-card-section class="q-pa-none">
                <q-list separator>
                  <q-item
                    v-for="info in ticketFocado.contact.extraInfo"
                    :key="info.id"
                  >
                    <q-item-section>
                      <q-item-label caption>{{ info.name }}</q-item-label>
                      <q-item-label>{{ info.value }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>

            <!-- Carteira -->
            <q-card
              class="q-mt-sm glass-premium btn-rounded border-glass"
              flat
              v-if="ticketFocado.contact?.wallets?.length"
            >
              <q-card-section class="text-bold">
                Carteira
                <q-separator />
              </q-card-section>
              <q-card-section class="q-pa-sm">
                <q-chip
                  v-for="wallet in ticketFocado.contact.wallets"
                  :key="wallet.id"
                  dense
                  square
                  color="primary"
                  text-color="white"
                  class="q-ma-xs"
                >
                  {{ wallet.name }}
                </q-chip>
              </q-card-section>
            </q-card>

            <!-- Mensagens Agendadas -->
            <q-card
              class="q-mt-sm glass-premium btn-rounded border-glass"
              flat
              v-if="ticketFocado.scheduledMessages?.length"
            >
              <q-card-section class="text-bold">
                Mensagens Agendadas
                <q-separator />
              </q-card-section>
              <q-card-section class="q-pa-none">
                <q-list separator>
                  <q-item
                    v-for="(msg, idx) in ticketFocado.scheduledMessages.filter(m => !m.isDeleted)"
                    :key="idx"
                  >
                    <q-item-section>
                      <q-item-label caption>
                        <b>Agendado:</b> {{ formatarData(msg.scheduleDate, 'dd/MM/yyyy HH:mm') }}
                      </q-item-label>
                      <q-item-label lines="2">
                        {{ msg.mediaName || msg.body }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>
          </div>

        </q-scroll-area>
      </q-drawer>
    </q-layout>

    <ContatoModal
      v-model:modal-contato="modalContato"
      v-model:contact-id="selectedContactId"
    />
    <ModalNovoTicket v-model:modal-novo-ticket="modalNovoTicket" />
    <ModalUsuario
      v-model:modal-usuario="modalUsuario"
      :usuario-edicao="authStore.user"
      :is-profile="true"
    />
  </div>
</template>

<script setup>
// Nota: Imports de Vue, Router, Pinia, Quasar, Stores e Composables
// agora são automáticos via unplugin-auto-import e unplugin-vue-components configurados no quasar.config.js

const router = useRouter()
const route = useRoute()
const $q = useQuasar()

const ticketStore = useTicketStore()
const { setupSockets, disconnectSockets } = useTicketSockets()
const { ticketFocado } = storeToRefs(ticketStore)

const authStore = useAuthStore()
const { user } = storeToRefs(authStore)
const username = computed(() => user.value?.name || localStorage.getItem('username'))

const etiquetaStore = useEtiquetaStore()
const { etiquetas } = storeToRefs(etiquetaStore)

const filaStore = useFilaStore()
const { filas } = storeToRefs(filaStore)

const whatsappStore = useWhatsappStore()
const { whatsapps } = storeToRefs(whatsappStore)
const { listarWhatsapps } = useSessoesWhatsapp()

const cRouteContatos = computed(() => {
  return route.name === 'contatos'
})



const drawerTickets = ref(true)
const drawerContact = ref(false)
const selectedTab = ref('open')
const toolbarSearch = ref(true)
const modalUsuario = ref(false)
const modalNovoTicket = ref(false)
const modalContato = ref(false)
const selectedContactId = ref(null)

const {
  filtros: pesquisaTickets,
  hasFiltrosAtivos: cFiltroSelecionado,
  carregarFiltros,
  salvarFiltros,
  limparFiltros: limparFiltro
} = useTicketFilters()

const { editarContato } = useContatos()

// O estado pesquisaTickets agora vem do useTicketFilters()
// O cFiltroSelecionado também vem do useTicketFilters()

// Computed Style para altura dinámica
const style = computed(() => ({
  height: $q.screen.height + 'px'
}))

const cIsExtraInfo = computed(() => ticketFocado.value?.contact?.extraInfo?.length > 0)

// Contagem de tickets por status para os badges
const { tickets } = storeToRefs(ticketStore)
const ticketCounts = computed(() => {
  const list = Array.isArray(tickets.value) ? tickets.value : []
  return {
    open: list.filter(t => t.status === 'open' && !t.isGroup).length,
    pending: list.filter(t => t.status === 'pending' && !t.isGroup).length,
    closed: list.filter(t => t.status === 'closed' && !t.isGroup).length,
    groups: list.filter(t => t.isGroup).length
  }
})


const filtrarTickets = () => {
  pesquisaTickets.pageNumber = 1
  salvarFiltros()
}

const debouncedFiltrarTickets = useDebounceFn(filtrarTickets, 500)

const atualizarEtiquetasContato = async tagsIds => {
  try {
    const contact = { ...ticketFocado.value.contact, tags: tagsIds }
    await editarContato(contact.id, contact)
    ticketStore.updateTicketContact(contact)
  } catch (error) {
    console.error('Erro ao atualizar etiquetas do contato', error)
  }
}

const handleEditarContato = () => {
  selectedContactId.value = ticketFocado.value.contactId
  modalContato.value = true
}

const efetuarLogout = () => {
  authStore.handleLogout()
}

onMounted(() => {
  setupSockets()
  etiquetaStore.listarEtiquetas(true)
  filaStore.listarFilas()
  listarWhatsapps() // Carregar status dos canais
  carregarFiltros() // Carrega filtros salvos ao montar


  if ($q.screen.lt.md) {
    drawerTickets.value = false
  }
})


onUnmounted(() => {
  disconnectSockets()
})
</script>

<style lang="sass">
.WAL
  background-image: url('assets/wa-background.png')
  background-repeat: repeat
  background-size: contain
  width: 100%
  height: 100%

  &__layout
    margin: 0 auto
    z-index: 1000
    height: 100%
    width: 100%

  &__field.q-field--outlined .q-field__control:before
    border: none

  .q-drawer--standard
    .WAL__drawer-close
      display: none

.btn-rounded
  border-radius: 10px

.hide-scrollbar
  &::-webkit-scrollbar
    display: none
</style>
