<template>
  <div class="row items-center no-wrap">
    <!-- Status Online/Offline Indicator (Header) -->
    <q-avatar
      :color="usuario.status === 'offline' ? 'negative' : 'positive'"
      text-color="white"
      size="25px"
      :icon="usuario.status === 'offline' ? 'mdi-account-off' : 'mdi-account-check'"
      rounded
      class="q-ml-lg"
    >
      <q-tooltip>
        {{ usuario.status === 'offline' ? 'Usuário Offline' : 'Usuário Online' }}
      </q-tooltip>
    </q-avatar>

    <q-btn
      round
      flat
      class="q-mx-sm q-ml-md"
    >
      <q-avatar size="32px" color="primary" text-color="white" class="text-bold shadow-2">
        {{ iniciais }}
      </q-avatar>
      <q-menu>
        <q-list style="min-width: 200px">
          <q-item-label header>
            Olá! <b> {{ username }} </b>
          </q-item-label>

          <cStatusUsuario
            @update:usuario="atualizarStatusLocal"
            :usuario="usuario"
          />
          
          <q-item
            clickable
            v-close-popup
            @click="emit('abrir-perfil')"
          >
            <q-item-section avatar>
              <q-icon name="mdi-account-circle" />
            </q-item-section>
            <q-item-section>Perfil</q-item-section>
          </q-item>

          <q-item
            clickable
            v-close-popup
            @click="confirmarLogout"
          >
            <q-item-section avatar>
              <q-icon name="mdi-logout" color="negative" />
            </q-item-section>
            <q-item-section class="text-negative">Sair</q-item-section>
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
</template>

<script setup>
import { computed, defineEmits } from 'vue'
import { useQuasar } from 'quasar'
import { storeToRefs } from 'pinia'
import { useAuthStore } from 'src/stores/useAuthStore'

const authStore = useAuthStore()
const { user: usuario } = storeToRefs(authStore)
const $q = useQuasar()

const emit = defineEmits(['abrir-perfil', 'logout', 'update-usuario'])

const username = computed(() => usuario.value?.name || 'Usuário')
const iniciais = computed(() => {
  const name = username.value || ''
  return name.charAt(0).toUpperCase() || 'U'
})

const atualizarStatusLocal = () => {
  emit('update-usuario')
}

const confirmarLogout = () => {
  $q.dialog({
    title: 'Sair',
    message: 'Deseja realmente sair do sistema?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    emit('logout')
  })
}
</script>
