<template>
  <div>
    <q-header class="bg-white text-grey-10 no-border-radius">
      <q-toolbar style="min-height: 60px; height: 60px;" class="no-border-radius q-pa-none ">
        <q-btn flat
          dense
          round
          icon="mdi-menu"
          v-if="$q.screen.lt.md"
          class="q-mx-xs-none q-ml-md"
          :color="$q.dark.isActive ? 'white' : ''"
          @click="$root.$emit('infor-cabecalo-chat:acao-menu')" />
        <q-item clickable
          v-ripple
          class="q-ma-none q-pa-none full"
          style="min-height: 60px; height: 60px; width: 300px;"
          @click="$root.$emit('update-ticket:info-contato')">
          <q-item-section avatar
            class="q-pl-sm">
            <q-btn round
              flat>
              <q-avatar class="bg-grey blur-effect">
                <q-img :src="Value(cticket.contact, 'profilePicUrl')">
                </q-img>
              </q-avatar>
            </q-btn>
          </q-item-section>
          <q-item-section id="InfoCabecalhoChat">
            <q-item-label class="text-bold blur-effect">
              {{ Value(cticket.contact, 'name') }}
              <q-skeleton v-if="!Value(cticket.contact, 'name')"
                animation="none"
                style="width: 230px" />
            </q-item-label>
            <q-item-label caption
              lines="1"
              style="margin-top: 2px !important;"
              :style="$q.screen.width < 500 ? 'max-width: 170px' : ''">
              <span v-if="Value(cticket.user, 'name')"> Atribuido à: {{ Value(cticket.user, 'name') }} </span>
              <q-skeleton v-else
                type="text"
                class="text-caption"
                animation="none"
                style="width: 150px" />
            </q-item-label>
            <q-item-label lines="1"
              style="margin-top: 0px !important;">
              <span v-if="Value(cticket.contact, 'name')"
                class=""
                style="font-size: 11px"> Ticket: {{ cticket.id }}</span>
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-space />
        <div class="q-gutter-xs q-pr-sm"
          v-if="Value(cticket.contact, 'name')">
          <template v-if="!$q.screen.xs">
            <q-btn @click="$emit('updateTicket:reabrir')"
              flat
              autofocus
              icon="mdi-reload"
              color="primary"
              class="bg-padrao btn-rounded"
              :disable="cticket.status == 'open'">
              <q-tooltip content-class="bg-primary text-bold">
                Reabrir Ticket
              </q-tooltip>
            </q-btn>
            <q-btn @click="$emit('abrir:modalAgendamentoMensagem')"
              v-if="ticketFocado.channel !== 'instagram' && ticketFocado.channel !== 'telegram'"
              flat
              icon="mdi-message-text-clock-outline"
              color="primary"
              class="bg-padrao btn-rounded"
              :disable="cticket.status == 'closed'">
              <q-tooltip content-class="bg-primary text-bold">
                Agendamento de mensagem
              </q-tooltip>
            </q-btn>
            <q-btn @click="$emit('updateTicket:retornar')"
              flat
              icon="mdi-replay"
              color="primary"
              class="bg-padrao btn-rounded"
              :disable="cticket.status == 'closed'">
              <q-tooltip content-class="bg-primary text-bold">
                Retornar Ticket para a Fila
              </q-tooltip>
            </q-btn>
            <q-btn @click="$emit('updateTicket:resolver')"
             color="green"
             flat
             class="bg-padrao btn-rounded"
             icon="mdi-comment-check"
             label="Resolver"
             :disable="cticket.status == 'closed'">
            <q-tooltip content-class="bg-primary text-bold">
              Resolver
            </q-tooltip>
            </q-btn>

            <q-btn @click="listarFilas"
              flat
              color="primary"
              class="bg-padrao btn-rounded"
              :disable="cticket.status == 'closed'">
              <q-icon name="mdi-transfer" />
              <q-tooltip content-class="bg-primary text-bold">
                Transferir
              </q-tooltip>
            </q-btn>
          </template>
          <template v-else>
            <q-fab :disable="cticket.status == 'closed'"
              color="primary"
              flat
              dense
              class="bg-padrao text-bold "
              icon="keyboard_arrow_left"
              direction="down"
              padding="5px"
              label="Ações"
              :class="{
                'bg-black': $q.dark.isActive

              }">
              <q-fab-action @click="$emit('updateTicket:resolver')"
                color="primary"
                flat
                class="bg-padrao q-pa-xs "
                icon="mdi-comment-check"
                :class="{
                  'bg-black': $q.dark.isActive

                }">
                <q-tooltip content-class="bg-primary text-bold">
                  Resolver
                </q-tooltip>
              </q-fab-action>
              <q-fab-action @click="$emit('updateTicket:retornar')"
                flat
                icon="mdi-replay"
                color="primary"
                class="bg-padrao q-pa-xs "
                :class="{
                  'bg-black': $q.dark.isActive

                }">
                <q-tooltip content-class="bg-primary text-bold">
                  Retornar Ticket para a Fila
                </q-tooltip>
              </q-fab-action>

              <q-fab-action @click="listarFilas"
                flat
                color="primary"
                class="bg-padrao q-pa-xs "
                :class="{
                  'bg-black-dark': $q.dark.isActive
                }">
                <q-icon name="mdi-transfer" />
                <q-tooltip content-class="bg-primary text-bold">
                  Transferir
                </q-tooltip>
              </q-fab-action>
              <q-fab-action @click="$emit('abrir:modalAgendamentoMensagem')"
                v-if="this.ticketFocado.channel !== 'waba'"
                flat
                color="primary"
                class="bg-padrao q-pa-xs "
                :class="{
                  'bg-black': $q.dark.isActive

                }">
                <q-icon name="mdi-message-text-clock-outline" />
                <q-tooltip content-class="bg-primary text-bold">
                  Agendamento de mensagem
                </q-tooltip>
              </q-fab-action>
            </q-fab>
          </template>

          <!-- <q-btn
            round
            flat
            icon="mdi-text-box-search-outline"
          />
          <q-btn
            round
            flat
          >
            <q-icon
              name="mdi-attachment"
              class="rotate-135"
            />
          </q-btn>
          <q-btn
            round
            flat
            icon="mdi-dots-vertical"
          >
            <q-menu
              auto-close
              :offset="[110, 0]"
            >
              <q-list style="min-width: 150px">
                <q-item clickable>
                  <q-item-section>Contact data</q-item-section>
                </q-item>
                <q-item clickable>
                  <q-item-section>Block</q-item-section>
                </q-item>
                <q-item clickable>
                  <q-item-section>Select messages</q-item-section>
                </q-item>
                <q-item clickable>
                  <q-item-section>Silence</q-item-section>
                </q-item>
                <q-item clickable>
                  <q-item-section>Clear messages</q-item-section>
                </q-item>
                <q-item clickable>
                  <q-item-section>Erase messages</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn> -->
        </div>
      </q-toolbar>
      <q-separator />
    </q-header>

    <q-dialog v-model="modalTransferirTicket"
      @hide="modalTransferirTicket = false"
      persistent>
      <q-card class="q-pa-md"
        style="width: 500px">
        <q-card-section>
          <div class="text-h6">Selecione o destino:</div>
        </q-card-section>
        <q-card-section>
          <q-select square
            outlined
            v-model="filaSelecionada"
            :options="filas"
            emit-value
            map-options
            option-value="id"
            option-label="queue"
            label="Fila de destino" />
        </q-card-section>
        <q-card-section>
          <q-select square
            outlined
            v-model="usuarioSelecionado"
            :options="usuarios.filter(filterUsers)"
            emit-value
            map-options
            option-value="id"
            option-label="name"
            label="Usuário destino" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            label="Sair"
            color="negative"
            v-close-popup
            class="q-mr-lg" />
          <q-btn
            label="Salvar"
            color="primary"
            @click="confirmarTransferenciaTicket" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
const userId = +localStorage.getItem('userId')
import { mapGetters } from 'vuex'
import { ListarUsuarios } from 'src/service/user'
import { ListarFilas } from 'src/service/filas'
import { AtualizarTicket } from 'src/service/tickets'
export default {
  name: 'InfoCabecalhoMensagens',
  data () {
    return {
      modalTransferirTicket: false,
      usuarioSelecionado: null,
      filaSelecionada: null,
      usuarios: [],
      filas: []
    }
  },
  computed: {
    ...mapGetters([
      'ticketFocado'
    ]),
    cticket () {
      const infoDefault = {
        contact: { profilePicUrl: '', name: '' },
        user: { name: '' }
      }
      return Object.keys(this.ticketFocado).includes('contact') ? this.ticketFocado : infoDefault
    }
  },
  methods: {
    Value (obj, prop) {
      try {
        return obj[prop]
      } catch (error) {
        return ''
      }
    },
    filterUsers (element, index, array) {
      const fila = this.filaSelecionada
      if (fila == null) return true
      const queues_valid = element.queues.filter(function (element, index, array) {
        return (element.id == fila)
      })
      return (queues_valid.length > 0)
    },
    async listarFilas () {
      try {
        const { data } = await ListarFilas()
        this.filas = data.filter(fila => fila.isActive)
        this.modalTransferirTicket = true
        this.listarUsuarios()
      } catch (error) {
        console.error(error)
        this.$notificarErro('Problema ao carregar filas', error)
      }
    },
    async listarUsuarios () {
      try {
        const { data } = await ListarUsuarios()
        this.usuarios = data.users
        this.modalTransferirTicket = true
      } catch (error) {
        console.error(error)
        this.$notificarErro('Problema ao carregar usuários', error)
      }
    },
    async confirmarTransferenciaTicket () {
      if (!this.filaSelecionada) return
      // if (!this.usuarioSelecionado) return
      console.log('usuario selecionado: ' + this.usuarioSelecionado)
      console.log('usuario atual do ticket: ' + this.ticketFocado.userId)
      if (this.ticketFocado.userId === this.usuarioSelecionado && this.ticketFocado.userId != null) {
        this.$q.notify({
          type: 'info',
          message: 'Ticket já pertence ao usuário selecionado.',
          progress: true,
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
        return
      }
      if (this.ticketFocado.userId === userId && userId === this.usuarioSelecionado) {
        this.$q.notify({
          type: 'info',
          message: 'Ticket já pertence ao seu usuário',
          progress: true,
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
        return
      }

      if (this.ticketFocado.queueId === this.filaSelecionada && this.ticketFocado.userId === this.usuarioSelecionado) {
        this.$q.notify({
          type: 'info',
          message: 'Ticket já pertence a esta fila e usuário',
          progress: true,
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
        return
      }
      await AtualizarTicket(this.ticketFocado.id, {
        userId: this.usuarioSelecionado,
        queueId: this.filaSelecionada,
        status: this.usuarioSelecionado == null ? 'pending' : 'open',
        isTransference: 1
      })
      this.$q.notify({
        type: 'positive',
        message: 'Ticket transferido.',
        progress: true,
        actions: [{
          icon: 'close',
          round: true,
          color: 'white'
        }]
      })
      this.modalTransferirTicket = false
      this.$store.commit('TICKET_FOCADO', {})
    }
  }
}
</script>
