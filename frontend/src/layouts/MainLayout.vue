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
          <div v-if="userProfile === 'admin' || userProfile === 'user'">
            <q-btn
              round
              dense
              flat
              color="grey-8"
              icon="notifications"
            >
              <q-badge
                color="red"
                text-color="white"
                floating
                v-if="parseInt(notifications.count) + parseInt(notifications_p.count) > 0"
              >
                {{ parseInt(notifications.count) + parseInt(notifications_p.count) }}
              </q-badge>
              <q-menu>
                <q-list style="min-width: 300px">
                  <q-item v-if="parseInt(notifications.count) + parseInt(notifications_p.count) == 0">
                    <q-item-section style="cursor: pointer"> Nada de novo por aqui! </q-item-section>
                  </q-item>
                  <q-item v-if="parseInt(notifications_p.count) > 0">
                    <q-item-section
                      avatar
                      @click="() => $router.push({ name: 'atendimento' })"
                      style="cursor: pointer"
                    >
                      <q-avatar
                        style="width: 60px; height: 60px"
                        color="blue"
                        text-color="white"
                      >
                        {{ notifications_p.count }}
                      </q-avatar>
                    </q-item-section>
                    <q-item-section
                      @click="() => $router.push({ name: 'atendimento' })"
                      style="cursor: pointer"
                    >
                      Clientes pendentes na fila
                    </q-item-section>
                  </q-item>
                  <q-item
                    v-for="ticket in notifications.tickets"
                    :key="ticket.id"
                    style="border-bottom: 1px solid #ddd; margin: 5px"
                  >
                    <q-item-section
                      avatar
                      @click="abrirAtendimentoExistente(ticket.name, ticket)"
                      style="cursor: pointer"
                    >
                      <q-avatar style="width: 60px; height: 60px">
                        <img :src="ticket.profilePicUrl" />
                      </q-avatar>
                    </q-item-section>
                    <q-item-section
                      @click="abrirAtendimentoExistente(ticket.name, ticket)"
                      style="cursor: pointer"
                    >
                      <q-list>
                        <q-item style="text-align: center; font-size: 17px; font-weight: bold; min-height: 0">{{
                          ticket.name
                        }}</q-item>
                        <q-item style="min-height: 0; padding-top: 0"
                          ><b>Mensagem: </b> {{ ticket.lastMessage }}</q-item
                        >
                      </q-list>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
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
                  {{ $q.dark.isActive ? 'Desativar' : 'Ativar' }} Modo Escuro (Dark Mode)
                </q-tooltip>
              </q-toggle>
              <q-tooltip>Notificações</q-tooltip>
            </q-btn>
            <q-avatar
              :color="usuario.status === 'offline' ? 'negative' : 'positive'"
              text-color="white"
              size="25px"
              :icon="usuario.status === 'offline' ? 'mdi-account-off' : 'mdi-account-check'"
              rounded
              class="q-ml-lg"
            >
              <q-tooltip>
                {{ usuario.status === 'offline' ? 'Usuário Offiline' : 'Usuário Online' }}
              </q-tooltip>
            </q-avatar>
          </div>
          <q-btn
            round
            flat
            class="bg-padrao text-bold q-mx-sm q-ml-lg"
          >
            <q-avatar size="26px">
              {{ $iniciaisString(username) }}
            </q-avatar>
            <q-menu>
              <q-list style="min-width: 100px">
                <q-item-label header>
                  Olá! <b> {{ username }} </b>
                </q-item-label>

                <cStatusUsuario
                  @update:usuario="atualizarUsuario"
                  :usuario="usuario"
                />
                <q-item
                  clickable
                  v-close-popup
                  @click="abrirModalUsuario"
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
                <q-item>
                  <q-item-section>
                    <cSystemVersion />
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>

            <q-tooltip>Usuário</q-tooltip>
          </q-btn>
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
      <q-scroll-area class="fit">
        <q-list
          padding
          :key="userProfile"
        >
          <div v-if="userProfile === 'admin' || userProfile === 'user'">
            <EssentialLink
              v-for="item in menuData"
              :key="item.title"
              v-bind="item"
            />
          </div>
          <div v-if="userProfile === 'admin'">
            <q-separator spaced />
            <div class="q-mb-lg"></div>
            <template v-for="item in menuDataAdmin">
              <EssentialLink
                v-if="exibirMenuBeta(item)"
                :key="item.title"
                v-bind="item"
              />
            </template>
          </div>
          <div v-if="userProfile === 'super'">
            <!-- <q-separator spaced /> -->
            <div class="q-mb-lg"></div>
            <template v-for="item in menuDataSuper">
              <EssentialLink
                v-if="exibirMenuBeta(item)"
                :key="item.title"
                v-bind="item"
              />
            </template>
          </div>
        </q-list>
      </q-scroll-area>
      <div
        class="absolute-bottom text-center row justify-start"
        :class="{ 'bg-grey-3': $q.dark.isActive }"
        style="height: 40px"
      ></div>
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
import { format } from 'date-fns'
import { storeToRefs } from 'pinia'
import { useQuasar } from 'quasar'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import alertSound from 'src/assets/sound.mp3'
import { ListarConfiguracoes } from 'src/service/configuracoes'
import { RealizarLogout } from 'src/service/login'
import { ListarWhatsapps } from 'src/service/sessoesWhatsapp'
import { ConsultarTickets } from 'src/service/tickets'
import bus from 'src/utils/eventBus'
import { socketIO } from 'src/utils/socket'

import { useSocketInitial } from 'src/composables/useSocketInitial'
import { useAuthStore } from 'src/stores/useAuthStore'
import { useTicketStore } from 'src/stores/useTicketStore'
import { useUsuarioStore } from 'src/stores/useUsuarioStore'
import { useWhatsappStore } from 'src/stores/useWhatsappStore'

import cStatusUsuario from 'src/components/cStatusUsuario.vue'
import cSystemVersion from 'src/components/cSystemVersion.vue'
import EssentialLink from 'src/components/EssentialLink.vue'
import ModalUsuario from 'src/pages/usuarios/ModalUsuario.vue'

const $q = useQuasar()
const router = useRouter()
const authStore = useAuthStore()
const ticketStore = useTicketStore()
const whatsappStore = useWhatsappStore()
const usuarioStore = useUsuarioStore()

const { notifications, notificationsP: notifications_p } = storeToRefs(ticketStore)
const { whatsapps } = storeToRefs(whatsappStore)
const { user: usuario } = storeToRefs(authStore)

const socket = socketIO()
const leftDrawerOpen = ref(false)
const miniState = ref(true)
const modalUsuario = ref(false)
const username = ref(localStorage.getItem('username'))
const userProfile = ref(localStorage.getItem('profile'))
const domainExperimentalsMenus = ['@']

useSocketInitial()

const objMenu = [
  {
    title: 'Painel de Controle',
    caption: '',
    icon: 'mdi-home',
    routeName: 'home-dashboard'
  },
  {
    title: 'Chat',
    caption: 'Lista de atendimentos',
    icon: 'mdi-whatsapp',
    routeName: 'atendimento'
  },
  {
    title: 'Contatos',
    caption: 'Lista de contatos',
    icon: 'mdi-contacts-outline',
    routeName: 'contatos'
  }
]

const objMenuAdmin = [
  {
    title: 'Conexões',
    caption: 'Canais de Comunicação',
    icon: 'mdi-cellphone-wireless',
    routeName: 'sessoes'
  },
  {
    title: 'Painel Atendimentos',
    caption: 'Visão geral dos atendimentos',
    icon: 'mdi-view-dashboard-variant',
    routeName: 'painel-atendimentos'
  },
  {
    title: 'Relatórios',
    caption: 'Relatórios gerais',
    icon: 'mdi-file-chart',
    routeName: 'relatorios'
  },
  {
    title: 'Usuários ',
    caption: 'Admin de usuários',
    icon: 'mdi-account-group',
    routeName: 'usuarios'
  },
  {
    title: 'Filas',
    caption: 'Cadastro de Filas',
    icon: 'mdi-arrow-decision-outline',
    routeName: 'filas'
  },
  {
    title: 'Mensagens Rápidas',
    caption: 'Mensagens pré-definidas',
    icon: 'mdi-reply-all-outline',
    routeName: 'mensagens-rapidas'
  },
  {
    title: 'Chatbot',
    caption: 'Robô de atendimento',
    icon: 'mdi-robot',
    routeName: 'chat-flow'
  },
  {
    title: 'Etiquetas',
    caption: 'Cadastro de etiquetas',
    icon: 'mdi-tag-text',
    routeName: 'etiquetas'
  },
  {
    title: 'Horário de Atendimento',
    caption: 'Horário de funcionamento',
    icon: 'mdi-calendar-clock',
    routeName: 'horarioAtendimento'
  },
  {
    title: 'Configurações',
    caption: 'Configurações gerais',
    icon: 'mdi-cog',
    routeName: 'configuracoes'
  },
  {
    title: 'Campanha',
    caption: 'Campanhas de envio',
    icon: 'mdi-message-bookmark-outline',
    routeName: 'campanhas'
  },
  {
    title: 'API',
    caption: 'Integração sistemas externos',
    icon: 'mdi-call-split',
    routeName: 'api-service'
  }
]

const superMenu = [
  {
    title: 'Empresas',
    caption: 'Admin das Empresas',
    icon: 'mdi-office-building',
    routeName: 'empresassuper'
  },
  {
    title: 'Usuários',
    caption: 'Admin de usuários',
    icon: 'mdi-account-group',
    routeName: 'usuariossuper'
  },
  {
    title: 'Conexões',
    caption: 'Canais de Comunicação',
    icon: 'mdi-cellphone-wireless',
    routeName: 'sessaosuper'
  }
]

const menuData = ref(objMenu)
const menuDataAdmin = ref(objMenuAdmin)
const menuDataSuper = ref(superMenu)

const cProblemaConexao = computed(() => {
  return whatsapps.value.some(w => ['PAIRING', 'TIMEOUT', 'DISCONNECTED'].includes(w.status))
})

const cQrCode = computed(() => {
  return whatsapps.value.some(w => w.status === 'qrcode' || w.status === 'DESTROYED')
})

const cOpening = computed(() => {
  return whatsapps.value.some(w => w.status === 'OPENING')
})

const cUsersApp = computed(() => usuarioStore.usersApp)

const cObjMenu = computed(() => {
  if (cProblemaConexao.value) {
    return objMenu.map(menu => {
      if (menu.routeName === 'sessoes') {
        return { ...menu, color: 'negative' }
      }
      return menu
    })
  }
  return objMenu
})

const exibirMenuBeta = itemMenu => {
  if (!itemMenu?.isBeta) return true
  return usuario.value?.email?.includes('@') || false
}

const listarWhatsapps = async () => {
  const { data } = await ListarWhatsapps()
  whatsappStore.setWhatsapps(data)
}

const handlerNotifications = data => {
  const { message, contact, ticket } = data
  const options = {
    body: `${message.body} - ${format(new Date(), 'HH:mm')}`,
    icon: contact.profilePicUrl,
    tag: ticket.id,
    renotify: true
  }
  const notification = new Notification(`Mensagem de ${contact.name}`, options)
  notification.onclick = e => {
    e.preventDefault()
    window.focus()
    abrirChatContato(ticket)
    router.push({ name: 'atendimento' })
  }
  // Audio element is in template ref
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
