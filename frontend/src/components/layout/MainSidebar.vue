<template>
  <q-scroll-area class="fit">
    <q-list padding>
      <!-- Menu Geral -->
      <div v-if="userProfile === 'admin' || userProfile === 'user'">
        <EssentialLink
          v-for="item in menuGeral"
          :key="item.title"
          v-bind="item"
          :color="item.routeName === 'sessoes' && problemaConexao ? 'negative' : ''"
        />
      </div>

      <!-- Menu Admin -->
      <div v-if="userProfile === 'admin'">
        <q-separator spaced />
        <div class="q-mb-lg"></div>
        <template v-for="item in menuAdmin">
          <EssentialLink
            v-if="exibirMenuBeta(item)"
            :key="item.title"
            v-bind="item"
          />
        </template>
      </div>

      <!-- Menu Super -->
      <div v-if="userProfile === 'super'">
        <div class="q-mb-lg"></div>
        <template v-for="item in menuSuper">
          <EssentialLink
            v-if="exibirMenuBeta(item)"
            :key="item.title"
            v-bind="item"
          />
        </template>
      </div>
    </q-list>
  </q-scroll-area>
</template>

<script setup>
const props = defineProps({
  userProfile: { type: String, required: true },
  problemaConexao: { type: Boolean, default: false },
  usuario: { type: Object, default: () => ({}) }
})

const menuGeral = [
  { title: 'Painel de Controle', icon: 'mdi-home', routeName: 'home-dashboard' },
  { title: 'Chat', icon: 'mdi-whatsapp', routeName: 'atendimento', caption: 'Lista de atendimentos' },
  { title: 'Contatos', icon: 'mdi-contacts-outline', routeName: 'contatos', caption: 'Lista de contatos' }
]

const menuAdmin = [
  { title: 'Conexões', icon: 'mdi-cellphone-wireless', routeName: 'sessoes', caption: 'Canais de Comunicação' },
  { title: 'Painel Atendimentos', icon: 'mdi-view-dashboard-variant', routeName: 'painel-atendimentos', caption: 'Visão geral' },
  { title: 'Relatórios', icon: 'mdi-file-chart', routeName: 'relatorios' },
  { title: 'Usuários', icon: 'mdi-account-group', routeName: 'usuarios' },
  { title: 'Filas', icon: 'mdi-arrow-decision-outline', routeName: 'filas' },
  { title: 'Mensagens Rápidas', icon: 'mdi-reply-all-outline', routeName: 'mensagens-rapidas' },
  { title: 'Chatbot', icon: 'mdi-robot', routeName: 'chat-flow' },
  { title: 'Etiquetas', icon: 'mdi-tag-text', routeName: 'etiquetas' },
  { title: 'Horário de Atendimento', icon: 'mdi-calendar-clock', routeName: 'horarioAtendimento' },
  { title: 'Configurações', icon: 'mdi-cog', routeName: 'configuracoes' },
  { title: 'Campanha', icon: 'mdi-message-bookmark-outline', routeName: 'campanhas' },
  { title: 'API', icon: 'mdi-call-split', routeName: 'api-service', caption: 'Integração' }
]

const menuSuper = [
  { title: 'Empresas', icon: 'mdi-office-building', routeName: 'empresassuper' },
  { title: 'Usuários', icon: 'mdi-account-group', routeName: 'usuariossuper' },
  { title: 'Conexões', icon: 'mdi-cellphone-wireless', routeName: 'sessaosuper' }
]

const exibirMenuBeta = (item) => {
  if (!item.isBeta) return true
  return props.usuario?.email?.includes('@') || false
}
</script>
