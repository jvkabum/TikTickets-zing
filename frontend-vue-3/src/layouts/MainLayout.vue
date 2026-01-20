<template>
  <q-layout view="hHh Lpr lFf">
    <q-header
      class="bg-white text-grey-8 q-py-xs"
      height-hint="58"
      bordered
    >
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          @click="leftDrawerOpen = !leftDrawerOpen"
          aria-label="Menu"
          icon="menu"
        >
          <q-tooltip>Menu</q-tooltip>
        </q-btn>

        <q-btn
          flat
          no-caps
          no-wrap
          dense
          class="q-ml-sm"
          v-if="$q.screen.gt.xs"
        >
          <q-img
            src="/logo.png"
            spinner-color="primary"
            style="height: 50px; width: 140px"
          />
        </q-btn>

        <q-space />

        <div class="q-gutter-sm row items-center no-wrap">
          <!-- Modulo de Notificações -->
          <NotificationMenu 
            v-if="userProfile === 'admin' || userProfile === 'user'"
            @abrir-ticket="ticket => abrirAtendimentoExistente(ticket.name, ticket)"
          />

          <!-- Modo Escuro -->
          <q-toggle
            size="xl"
            keep-color
            dense
            class="text-bold q-ml-xs"
            :icon-color="$q.dark.isActive ? 'black' : 'white'"
            :model-value="$q.dark.isActive"
            :color="$q.dark.isActive ? 'grey-3' : 'black'"
            checked-icon="mdi-white-balance-sunny"
            unchecked-icon="mdi-weather-sunny"
            @update:model-value="$setConfigsUsuario({ isDark: !$q.dark.isActive })"
          >
            <q-tooltip content-class="text-body1 hide-scrollbar">
              {{ $q.dark.isActive ? 'Desativar' : 'Ativar' }} Modo Escuro
            </q-tooltip>
          </q-toggle>

          <!-- Modulo de Usuário -->
          <UserMenu 
            @abrir-perfil="abrirModalUsuario"
            @logout="efetuarLogout"
            @update-usuario="atualizarUsuario"
          />
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :mini="miniState"
      @mouseover="miniState = false"
      @mouseout="miniState = true"
      mini-to-overlay
      content-class="bg-white text-grey-9"
    >
      <MainSidebar 
        :user-profile="userProfile"
        :problema-conexao="cProblemaConexao"
        :usuario="usuario"
      />
    </q-drawer>

    <q-page-container>
      <q-page class="q-pa-xs">
        <router-view />
      </q-page>
    </q-page-container>

    <audio
      ref="audioNotification"
      v-if="userProfile === 'admin' || userProfile === 'user'"
    >
      <source
        :src="alertSound"
        type="audio/mp3"
      />
    </audio>

    <ModalUsuario
      :isProfile="true"
      v-model:modalUsuario="modalUsuario"
      v-model:usuarioEdicao="usuario"
    />
  </q-layout>
</template>

<script setup>
import alertSound from 'src/assets/sound.mp3'
import bus from 'src/utils/eventBus'
import { socketIO } from 'src/utils/socket'

const $q = useQuasar()
const router = useRouter()
const authStore = useAuthStore()
const ticketStore = useTicketStore()
const whatsappStore = useWhatsappStore()
const usuarioStore = useUsuarioStore()

const { whatsapps } = storeToRefs(whatsappStore)
const { user: usuario } = storeToRefs(authStore)

const socket = socketIO()
const leftDrawerOpen = ref(false)
const miniState = ref(true)
const modalUsuario = ref(false)
const userProfile = ref(localStorage.getItem('profile'))

useSocketInitial()

const cProblemaConexao = computed(() => {
  return whatsapps.value.some(w => ['PAIRING', 'TIMEOUT', 'DISCONNECTED'].includes(w.status))
})

const listarWhatsapps = async () => {
  const { data } = await ListarWhatsapps()
  whatsappStore.setWhatsapps(data)
}

const abrirModalUsuario = () => {
  modalUsuario.value = true
}

const efetuarLogout = async () => {
  try {
    await RealizarLogout(usuario.value)
    authStore.logout()
    localStorage.removeItem('queues')
    localStorage.removeItem('filtrosAtendimento')
    router.go({ name: 'login', replace: true })
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Não foi possível realizar logout' })
  }
}

const listarConfiguracoes = async () => {
  const { data } = await ListarConfiguracoes()
  localStorage.setItem('configuracoes', JSON.stringify(data))
}

const conectarSocket = u => {
  socket.on(`${u.tenantId}:chat:updateOnlineBubbles`, data => {
    usuarioStore.setUsersApp(data)
  })
}

const atualizarUsuario = () => {
  const u = JSON.parse(localStorage.getItem('usuario'))
  authStore.user = u
  if (u.status === 'offline') {
    socket.emit(`${u.tenantId}:setUserIdle`)
  }
  if (u.status === 'online') {
    socket.emit(`${u.tenantId}:setUserActive`)
  }
}

const consultarTickets = async () => {
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
    const { data } = await ConsultarTickets(params)
    ticketStore.updateNotifications(data)
  } catch (err) {
    console.error(err)
  }

  const params2 = { ...params, status: ['pending'], withUnreadMessages: false }
  try {
    const { data } = await ConsultarTickets(params2)
    ticketStore.updateNotificationsP(data)
  } catch (err) {
    console.error(err)
  }
}

const abrirChatContato = ticket => {
  if ($q.screen.lt.md && ticket.status !== 'pending') {
    bus.emit('infor-cabecalo-chat:acao-menu')
  }
  if (
    ticket.status !== 'pending' &&
    (ticket.id !== ticketStore.ticketFocado.id || router.currentRoute.value.name !== 'chat')
  ) {
    ticketStore.setHasMore(true)
    ticketStore.setTicketFocado(ticket)
  }
}

const abrirAtendimentoExistente = (contato, ticket) => {
  $q.dialog({
    title: 'Atenção!!',
    message: `${contato} possui um atendimento em curso (Atendimento: ${ticket.id}). Deseja abrir o atendimento?`,
    cancel: { label: 'Não', color: 'primary', push: true },
    ok: { label: 'Sim', color: 'negative', push: true },
    persistent: true
  }).onOk(() => {
    abrirChatContato(ticket)
  })
}

onMounted(async () => {
  atualizarUsuario()
  await listarWhatsapps()
  await listarConfiguracoes()
  await consultarTickets()
  if ('Notification' in window) {
    Notification.requestPermission()
  }
  userProfile.value = localStorage.getItem('profile')
  conectarSocket(usuario.value)
})

onUnmounted(() => {
  socket.disconnect()
})
</script>

<style scoped>
.q-img__image {
  background-size: contain;
}
</style>
