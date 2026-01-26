<template>
  <q-dialog
    persistent
    :model-value="modalFilaUsuario"
    @hide="fecharModal"
    @show="abrirModal"
  >
    <q-card style="width: 400px" class="glass-premium border-glass no-shadow rounded-all shadow-premium unified-modal-color">
      <q-card-section class="q-pa-none">
        <div class="full-width text-h5 text-bold text-primary q-pa-md">Filas Usuário</div>
        <q-separator spaced />
        <div
          style="font-size: 1.1em"
          class="text-weight-bold row col q-px-md q-pt-sm text-dark-theme"
        >
          Nome: {{ usuarioSelecionado.name }}
        </div>
        <div
          style="font-size: 1em"
          class="text-caption text-weight-bold row col q-px-md q-mb-sm"
        >
          Email: {{ usuarioSelecionado.email }}
        </div>
      </q-card-section>
      <q-card-section>
        <template
          v-for="fila in filas"
          :key="fila.id"
        >
          <div class="row col">
            <q-checkbox
              :disable="!fila.isActive"
              v-model="filasUsuario"
              :label="`${fila.queue} ${!fila.isActive ? '(Inativo)' : ''}`"
              :val="fila.id"
            />
          </div>
        </template>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          label="Sair"
          class="q-px-md q-mr-sm"
          color="negative"
          rounded
          v-close-popup
        />
        <q-btn
          label="Salvar"
          class="q-px-md"
          color="primary"
          rounded
          @click="handleFilaUsuario"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>

const props = defineProps({
  modalFilaUsuario: {
    type: Boolean,
    default: false
  },
  usuarioSelecionado: {
    type: Object,
    default: () => ({ id: null })
  },
  filas: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modalFilaUsuario', 'update:usuarioSelecionado', 'modalFilaUsuario:sucesso'])

const $q = useQuasar()
const usuarioStore = useUsuarioStore()
const filasUsuario = ref([])

const abrirModal = () => {
  if (props.usuarioSelecionado.id) {
    filasUsuario.value = props.usuarioSelecionado.queues?.map(f => f.id) || []
  }
}

const fecharModal = () => {
  emit('update:usuarioSelecionado', {})
  emit('update:modalFilaUsuario', false)
  filasUsuario.value = []
}

const handleFilaUsuario = async () => {
  try {
    const payload = {
      ...props.usuarioSelecionado,
      queues: [...filasUsuario.value]
    }
    const data = await usuarioStore.updateUsuarios(payload.id, payload)
    emit('modalFilaUsuario:sucesso', data)
    $q.notify({
      type: 'positive',
      progress: true,
      position: 'top',
      message: 'Filas do usuário editadas com sucesso!',
      actions: [{ icon: 'close', round: true, color: 'white' }]
    })
    fecharModal()
  } catch (error) {
    console.error(error)
  }
}
</script>


