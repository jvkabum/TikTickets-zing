<template>
  <q-dialog
    :model-value="modalNovoTicket"
    persistent
    @hide="fecharModal"
  >
    <q-card
      class="q-pa-md btn-rounded"
      style="width: 500px"
    >
      <q-card-section>
        <div class="text-h6">Criar Ticket</div>
        <div class="text-caption">Localize um contato para iniciar o atendimento.</div>
      </q-card-section>

      <q-card-section>
        <q-select
          ref="selectContatoRef"
          autofocus
          outlined
          rounded
          hide-dropdown-icon
          :loading="loading"
          v-model="contatoSelecionado"
          :options="contatosOptions"
          @filter="localizarContato"
          use-input
          fill-input
          hide-selected
          option-label="name"
          label="Localizar Contato"
          hint="Digite nome ou número do contato"
          class="q-mb-md"
        >
          <template #before-options>
            <q-btn
              color="primary"
              flat
              class="full-width no-border-radius"
              icon="add"
              label="Novo Contato"
              @click="modalContato = true"
            />
          </template>
          <template #option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section>
                <q-item-label>{{ scope.opt.name }}</q-item-label>
                <q-item-label caption>{{ scope.opt.number }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          label="Cancelar"
          color="negative"
          flat
          v-close-popup
        />
        <q-btn
          label="Iniciar"
          color="primary"
          unelevated
          @click="criarTicket"
          :loading="loading"
          :disable="!contatoSelecionado"
        />
      </q-card-actions>
    </q-card>

    <ContatoModal
      v-model:modalContato="modalContato"
      @contatoModal:contato-criado="contatoCriadoNovoTicket"
    />
  </q-dialog>
</template>

<script setup>
import { ListarContatos } from 'src/service/contatos'
import { CriarTicket } from 'src/service/tickets'
import { useTicketStore } from 'src/stores/useTicketStore'
import { notificarErro, notificarSucesso } from 'src/utils/helpersNotifications'
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import ContatoModal from '../contatos/ContatoModal.vue'

const props = defineProps({
  modalNovoTicket: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modalNovoTicket'])

const router = useRouter()
const ticketStore = useTicketStore()

const contatoSelecionado = ref(null)
const contatosOptions = ref([])
const modalContato = ref(false)
const loading = ref(false)

const fecharModal = () => {
  contatoSelecionado.value = null
  emit('update:modalNovoTicket', false)
}

const localizarContato = async (val, update, abort) => {
  if (val.length < 2) {
    if (contatosOptions.value.length) update(() => {})
    abort()
    return
  }
  loading.value = true
  try {
    const { data } = await ListarContatos({ searchParam: val })
    update(() => {
      contatosOptions.value = data.contacts
    })
  } catch (e) {
    abort()
  } finally {
    loading.value = false
  }
}

const contatoCriadoNovoTicket = contato => {
  contatoSelecionado.value = contato
  criarTicket()
}

const criarTicket = async () => {
  if (!contatoSelecionado.value?.id) return
  loading.value = true
  try {
    const userId = localStorage.getItem('userId')
    const { data: ticket } = await CriarTicket({
      contactId: contatoSelecionado.value.id,
      isActiveDemand: true,
      userId,
      status: 'open'
    })

    notificarSucesso(`Atendimento Iniciado: ${ticket.contact.name}`)
    ticketStore.setTicketFocado(ticket)
    fecharModal()

    if (router.currentRoute.value.name !== 'atendimento') {
      router.push({ name: 'atendimento' })
    }
  } catch (e) {
    notificarErro('Ocorreu um erro ao iniciar o atendimento', e)
  } finally {
    loading.value = false
  }
}

watch(
  () => props.modalNovoTicket,
  val => {
    if (!val) {
      contatoSelecionado.value = null
      contatosOptions.value = []
    }
  }
)
</script>

<style lang="sass" scoped>
.btn-rounded
  border-radius: 8px
</style>
