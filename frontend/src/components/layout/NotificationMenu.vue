<template>
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
      v-if="totalNotifications > 0"
    >
      {{ totalNotifications }}
    </q-badge>
    <q-menu>
      <q-list style="min-width: 300px">
        <q-item v-if="totalNotifications === 0">
          <q-item-section style="cursor: pointer"> Nada de novo por aqui! </q-item-section>
        </q-item>
        
        <!-- Notificações Pendentes -->
        <q-item v-if="parseInt(notificationsP.count) > 0">
          <q-item-section
            avatar
            @click="irParaAtendimento"
            style="cursor: pointer"
          >
            <q-avatar
              style="width: 60px; height: 60px"
              color="blue"
              text-color="white"
            >
              {{ notificationsP.count }}
            </q-avatar>
          </q-item-section>
          <q-item-section
            @click="irParaAtendimento"
            style="cursor: pointer"
          >
            Clientes pendentes na fila
          </q-item-section>
        </q-item>

        <!-- Tickets Específicos -->
        <q-item
          v-for="ticket in notifications.tickets"
          :key="ticket.id"
          style="border-bottom: 1px solid #ddd; margin: 5px"
        >
          <q-item-section
            avatar
            @click="abrirTicket(ticket)"
            style="cursor: pointer"
          >
            <q-avatar style="width: 60px; height: 60px">
              <img :src="ticket.profilePicUrl" />
            </q-avatar>
          </q-item-section>
          <q-item-section
            @click="abrirTicket(ticket)"
            style="cursor: pointer"
          >
            <q-list>
              <q-item style="text-align: center; font-size: 17px; font-weight: bold; min-height: 0">
                {{ ticket.name }}
              </q-item>
              <q-item style="min-height: 0; padding-top: 0">
                <b>Mensagem: </b> {{ ticket.lastMessage }}
              </q-item>
            </q-list>
          </q-item-section>
        </q-item>
      </q-list>
    </q-menu>
    <q-tooltip>Notificações</q-tooltip>
  </q-btn>
</template>

<script setup>
import { computed, defineEmits } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useTicketStore } from 'src/stores/useTicketStore'

const ticketStore = useTicketStore()
const { notifications, notificationsP } = storeToRefs(ticketStore)
const router = useRouter()

const totalNotifications = computed(() => {
  return (parseInt(notifications.value.count) || 0) + (parseInt(notificationsP.value.count) || 0)
})

const irParaAtendimento = () => {
  router.push({ name: 'atendimento' })
}

const abrirTicket = (ticket) => {
  emit('abrir-ticket', ticket)
}

const emit = defineEmits(['abrir-ticket'])
</script>
