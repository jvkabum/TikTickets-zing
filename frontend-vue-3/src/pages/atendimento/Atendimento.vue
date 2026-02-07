<template>
  <div
    class="WAL position-relative q-page"
    :style="style"
  >
    <q-layout
      class="WAL__layout no-shadow"
      container
      view="lHr LpR lFr"
      style="height: 100% !important; width: 100% !important"
    >
      <q-drawer
        v-model="drawerTickets"
        @hide="drawerTickets = false"
        show-if-above
        :overlay="$q.screen.lt.md"
        :persistent="!$q.screen.lt.md"
        :breakpoint="769"
        bordered
        :width="$q.screen.lt.md ? $q.screen.width : 350"
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
              <span class="text-uppercase text-weight-bold" style="font-size: 10px">ABERTO</span>
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
              <span class="text-uppercase text-weight-bold" style="font-size: 10px">PENDENTE</span>
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
              <span class="text-uppercase text-weight-bold" style="font-size: 10px">FECHADO</span>
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
              <span class="text-uppercase text-weight-bold" style="font-size: 10px">GRUPO</span>
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
              :key="tab"
              :status="tab"
              :active-tab="selectedTab"
              :search-params="pesquisaTickets"
              :filas="filas"
            />
          </q-tab-panel>
        </q-tab-panels>

        <!-- Barra inferior: Dark Mode + Status Canais -->
        <div
          class="absolute-bottom row justify-between items-center q-px-sm glass-premium"
          style="height: 80px; border-top: 1px solid rgba(255,255,255,0.2); border-radius: 0 !important; width: 100% !important"
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
                size="22px"
                class="q-mx-xs q-pa-none"
                :style="`opacity: ${item.status === 'CONNECTED' ? 1 : 0.3}`"
              >
                <q-avatar size="36px">
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
        v-show="ticketFocado.id && !cRouteContatos"
        v-model="ticketStore.drawerContact"
        side="right"
        bordered
        :width="350"
        :content-class="$q.dark.isActive ? 'bg-transparent border-glass' : 'bg-transparent border-glass'"
      >
        <q-toolbar
          class="glass-premium text-bold"
          style="min-height: 64px; height: 64px"
        >
          Dados do Contato
          <q-space />
          <q-btn
            flat
            rounded
            dense
            color="primary"
            label="Logs"
            icon="mdi-history"
            class="q-px-sm"
            @click="abrirModalLogs"
          />
          <q-btn
            flat
            round
            icon="close"
            class="q-ml-sm"
            @click="drawerContact = false"
          />
        </q-toolbar>
        <q-separator />
        <q-scroll-area style="height: calc(100vh - 120px)">
          <div class="q-pa-sm">
            <q-card
              class="glass-premium border-glass"
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

            <!-- Etiquetas Interativas -->
            <q-card
              class="q-mt-sm glass-premium border-glass overflow-hidden"
              flat
              v-if="ticketFocado.contact"
            >
              <q-card-section class="text-bold q-pb-none row items-center justify-between">
                <span>Etiquetas</span>
                <q-icon name="mdi-tag-multiple-outline" color="primary" />
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
                  borderless
                  dense
                  @update:model-value="handleTagSelecionada"
                  dropdown-icon="add"
                >
                  <template v-slot:selected-item="scope">
                    <q-chip
                      removable
                      dense
                      @remove="scope.removeAtIndex(scope.index)"
                      :tabindex="scope.tabindex"
                      class="q-ma-xs"
                      :style="`border: 1px solid ${scope.opt.color || '#ccc'}; color: ${scope.opt.color || 'primary'}`"
                      color="white"
                    >
                      <q-icon name="mdi-pound" size="xs" class="q-mr-xs" :style="`color: ${scope.opt.color}`" />
                      {{ scope.opt.tag }}
                    </q-chip>
                  </template>
                </q-select>
              </q-card-section>
            </q-card>

            <!-- Carteira (Wallets) -->
            <q-card
              class="q-mt-sm glass-premium border-glass"
              flat
              v-if="ticketFocado.contact"
            >
              <q-card-section class="text-bold q-pb-none row items-center justify-between">
                <span>Carteira</span>
                <q-icon name="mdi-wallet-outline" color="primary" />
              </q-card-section>
              <q-card-section class="q-pa-sm">
                <q-select
                  v-model="ticketFocado.contact.wallets"
                  multiple
                  :options="usuarios"
                  use-chips
                  option-value="id"
                  option-label="name"
                  emit-value
                  map-options
                  borderless
                  dense
                  @update:model-value="handleCarteiraDefinida"
                  dropdown-icon="add"
                  placeholder="Atribuir contato..."
                >
                  <template v-slot:selected-item="scope">
                    <q-chip
                      removable
                      dense
                      @remove="scope.removeAtIndex(scope.index)"
                      :tabindex="scope.tabindex"
                      class="q-ma-xs"
                      color="primary"
                      text-color="white"
                    >
                      {{ scope.opt.name }}
                    </q-chip>
                  </template>
                </q-select>
              </q-card-section>
            </q-card>

            <!-- Mensagens Agendadas -->
            <q-card
              class="q-mt-sm glass-premium btn-rounded border-glass"
              flat
              v-if="ticketFocado.scheduledMessages?.length"
            >
              <q-card-section class="text-bold row items-center justify-between">
                <span>Mensagens Agendadas</span>
                <q-icon name="mdi-clock-outline" color="primary" />
              </q-card-section>
              <q-separator />
              <q-card-section class="q-pa-none">
                <q-list separator>
                  <q-item
                    v-for="(msg, idx) in ticketFocado.scheduledMessages.filter(m => !m.isDeleted)"
                    :key="idx"
                  >
                    <q-item-section>
                      <q-item-label caption class="row justify-between items-center">
                        <b>{{ formatarData(msg.scheduleDate, 'dd/MM/yyyy HH:mm') }}</b>
                        <q-btn
                          flat
                          round
                          dense
                          color="negative"
                          icon="mdi-delete-outline"
                          size="sm"
                          @click="deletarMensagemAgendada(msg)"
                        />
                      </q-item-label>
                      <q-item-label lines="2">
                        {{ msg.mediaName || msg.body }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>

            <!-- Informações Extras (Legacy Refined) -->
            <q-card
              class="q-mt-sm glass-premium border-glass"
              flat
              v-if="cIsExtraInfo"
            >
              <q-card-section class="text-bold row items-center justify-between">
                <span>Outras Informações</span>
                <q-icon name="mdi-information-outline" color="primary" />
              </q-card-section>
              <q-separator />
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

    <!-- Modal de Logs (Timeline Estilo Drawer) -->
    <q-dialog
      v-model="exibirModalLogs"
      position="right"
      full-height
    >
      <q-card style="width: 450px; max-width: 90vw" class="glass-premium no-border-radius">
        <q-toolbar class="bg-primary text-white">
          <q-toolbar-title>Logs do Ticket #{{ ticketFocado.id }}</q-toolbar-title>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>

        <q-card-section class="q-pa-md">
          <q-scroll-area style="height: calc(100vh - 120px)">
            <q-timeline color="primary" class="q-px-md">
              <q-timeline-entry
                v-for="log in logsTicket"
                :key="log.id"
                :subtitle="formatarData(log.createdAt, 'dd/MM/yyyy HH:mm')"
                :icon="messagesLog[log.type]?.icon || 'mdi-information-outline'"
                :color="messagesLog[log.type]?.color || 'grey'"
              >
                <template v-slot:title>
                  <div class="text-bold text-body2">
                    {{ log.user?.name || 'Sistema/Bot' }}
                  </div>
                </template>
                <div>
                  {{ messagesLog[log.type]?.message || log.type }}
                  <div v-if="log.ticketId" class="text-caption text-grey">
                    Ticket #{{ log.ticketId }}
                  </div>
                </div>
              </q-timeline-entry>
            </q-timeline>
          </q-scroll-area>
        </q-card-section>
      </q-card>
    </q-dialog>
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
import { ConsultarLogsTicket, DeletarMensagem } from 'src/service/tickets'
import bus from 'src/utils/eventBus'

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

const usuarioStore = useUsuarioStore()
const { usuarios } = storeToRefs(usuarioStore)

const { listarContatos } = useContatos()
const apiDeletarMensagem = DeletarMensagem
const consultarLogsTicket = ConsultarLogsTicket

const cRouteContatos = computed(() => {
  return route.name === 'contatos'
})

const drawerTickets = ref(true)
const selectedTab = ref('open')
const toolbarSearch = ref(true)
const modalUsuario = ref(false)
const modalNovoTicket = ref(false)
const modalContato = ref(false)
const selectedContactId = ref(null)

const exibirModalLogs = ref(false)
const logsTicket = ref([])
const messagesLog = {
  access: { message: 'Acessou o ticket', color: 'blue', icon: 'mdi-account-check' },
  transfer: { message: 'Transferiu o ticket', color: 'orange', icon: 'mdi-swap-horizontal' },
  status: { message: 'Alterou o status', color: 'purple', icon: 'mdi-cached' },
  closed: { message: 'Encerrou o atendimento', color: 'negative', icon: 'mdi-close-circle-outline' },
  open: { message: 'Abriu o atendimento', color: 'positive', icon: 'mdi-check-circle-outline' },
  pending: { message: 'Marcou como pendente', color: 'warning', icon: 'mdi-alert-circle-outline' }
}

const {
  filtros: pesquisaTickets,
  hasFiltrosAtivos: cFiltroSelecionado,
  carregarFiltros,
  salvarFiltros,
  limparFiltros: limparFiltro
} = useTicketFilters()

const { editarContato, editarEtiquetasContato, editarCarteiraContato } = useContatos()

// O estado pesquisaTickets agora vem do useTicketFilters()
// O cFiltroSelecionado também vem do useTicketFilters()

// Computed Style para altura dinámica
const style = computed(() => ({
  height: $q.screen.height + 'px'
}))

const cIsExtraInfo = computed(() => {
  const info = ticketFocado.value?.contact?.extraInfo
  return Array.isArray(info) && info.length > 0
})

watch(() => ticketFocado.value?.scheduledMessages, (val) => {
  // Observando mudanças nas mensagens agendadas
}, { deep: true, immediate: true })

// Contagem de tickets por status para os badges
const { tickets, notifications, notificationsP, ticketsCount } = storeToRefs(ticketStore)
const ticketCounts = computed(() => {
  return {
    open: ticketsCount.value.open !== undefined ? ticketsCount.value.open : notifications.value.length,
    pending: ticketsCount.value.pending !== undefined ? ticketsCount.value.pending : notificationsP.value.length,
    closed: ticketsCount.value.closed,
    groups: ticketsCount.value.groups
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

const handleTagSelecionada = async tagsIds => {
  try {
    const { data } = await editarEtiquetasContato(ticketFocado.value.contact.id, tagsIds)
    ticketStore.updateTicketContact(data)
  } catch (error) {
    console.error('Erro ao atualizar etiquetas', error)
  }
}

const handleCarteiraDefinida = async walletsIds => {
  try {
    const { data } = await editarCarteiraContato(ticketFocado.value.contact.id, walletsIds)
    ticketStore.updateTicketContact(data)
  } catch (error) {
    console.error('Erro ao atualizar carteira', error)
  }
}

const abrirModalLogs = async () => {
  try {
    const { data } = await consultarLogsTicket({ ticketId: ticketFocado.value.id })
    logsTicket.value = data
    exibirModalLogs.value = true
  } catch (error) {
    console.error('Erro ao buscar logs', error)
  }
}

const deletarMensagemAgendada = async mensagem => {
  $q.dialog({
    title: 'Atenção!!',
    message: 'Deseja realmente deletar esta mensagem agendada?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await apiDeletarMensagem(mensagem)
      ticketStore.updateTicketScheduledMessages(ticketFocado.value.id, mensagem.id)
      $q.notify({ type: 'positive', message: 'Mensagem deletada!' })
    } catch (error) {
      console.error('Erro ao deletar mensagem agendada', error)
    }
  })
}

const efetuarLogout = () => {
  authStore.handleLogout()
}

const handleAcaoMenu = () => {
  drawerTickets.value = !drawerTickets.value
}

watch(() => ticketFocado.value.id, (newId) => {
  if (newId && $q.screen.lt.md) {
    drawerTickets.value = false
  }
})

const handleInfoContato = () => {
  console.log('DEBUG [Atendimento] EVENT: alternando drawerContact via Store. Anterior:', drawerContact.value)
  drawerContact.value = !drawerContact.value
}

onMounted(() => {
  setupSockets()
  etiquetaStore.listarEtiquetas(true)
  filaStore.listarFilas()
  listarWhatsapps() // Carregar status dos canais
  usuarioStore.listarUsuarios() // Carregar usuários para carteira
  carregarFiltros() // Carrega filtros salvos ao montar
  ticketStore.atualizarContadoresGerais(pesquisaTickets) // Sincroniza todos os números do topo com os filtros reais

  bus.on('infor-cabecalo-chat:acao-menu', handleAcaoMenu)
  
  if ($q.screen.lt.md) {
    // No celular, se não tiver ticket selecionado, abre o menu de conversas
    // Se tiver ticket, esconde o menu para mostrar o chat
    drawerTickets.value = !ticketFocado.value.id
  }
})


onUnmounted(() => {
  disconnectSockets()
  bus.off('infor-cabecalo-chat:acao-menu', handleAcaoMenu)
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
