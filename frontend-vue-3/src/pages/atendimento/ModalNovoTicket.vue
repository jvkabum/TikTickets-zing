<template>
  <q-dialog
    :model-value="modalNovoTicket"
    persistent
    @hide="fecharModal"
  >
    <q-card
      class="q-pa-md glass-premium border-glass no-shadow rounded-all shadow-premium unified-modal-color"
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
import ContatoModal from '../contatos/ContatoModal.vue'
import { notificarErro, notificarSucesso } from 'src/utils/helpersNotifications'

import { useAuthStore } from 'src/stores/useAuthStore'

const contatoStore = useContatoStore()
const ticketStore = useTicketStore()

const props = defineProps({
  modalNovoTicket: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modalNovoTicket'])

const router = useRouter()

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
    const data = await contatoStore.listarContatos({ searchParam: val })
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
    const authStore = useAuthStore()
    const ticket = await ticketStore.criarTicket({
      contactId: contatoSelecionado.value.id,
      isActiveDemand: true,
      userId: authStore.user.id,
      channel: 'whatsapp',
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

<style lang="scss" scoped>
.unified-modal-color {
  background: #1e293b !important;
}

.unified-modal-color :deep(.q-card__section),
.unified-modal-color :deep(.q-table),
.unified-modal-color :deep(.q-table__container),
.unified-modal-color :deep(.q-table__middle),
.unified-modal-color :deep(.q-table__top),
.unified-modal-color :deep(.q-table__bottom),
.unified-modal-color :deep(.q-card__actions) {
  background: transparent !important;
}
</style>
