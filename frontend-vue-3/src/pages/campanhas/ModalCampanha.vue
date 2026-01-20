<template>
  <q-dialog
    persistent
    v-model="modalCampanhaModel"
    @hide="fecharModal"
    @show="abrirModal"
  >
    <q-card
      class="q-pa-sm"
      style="min-width: 70vw"
    >
      <q-card-section class="q-pa-none q-px-md">
        <div class="text-h6 text-bold">{{ campanhaEdicao.id ? 'Editar' : 'Criar' }} Campanha</div>
        <div class="row">As mensagens sempre serão enviadas em horário comercial e dias úteis.</div>
      </q-card-section>
      <q-card-section class="q-pb-none">
        <div class="row q-gutter-sm">
          <q-input
            outlined
            dense
            rounded
            style="width: 500px"
            v-model="name"
            v-bind="nameProps"
            label="Nome da Campanha"
            :error="!!errors.name"
            :error-message="errors.name"
          />
          <cDateTimePick
            style="width: 200px"
            label="Data/Hora início"
            v-model="start"
            v-bind="startProps"
            :error="!!errors.start"
            :error-message="errors.start"
          />
          <q-select
            rounded
            dense
            outlined
            emit-value
            map-options
            label="Enviar por"
            color="primary"
            v-model="sessionId"
            v-bind="sessionIdProps"
            :options="cSessions"
            :input-debounce="700"
            option-value="id"
            option-label="name"
            input-style="width: 280px; max-width: 280px;"
            :error="!!errors.sessionId"
            :error-message="errors.sessionId"
            style="width: 250px"
          />
          <q-input
            rounded
            outlined
            dense
            style="width: 160px"
            v-model="delay"
            v-bind="delayProps"
            input-class="text-right"
            suffix="segundos"
            label="Delay"
            :error="!!errors.delay"
            :error-message="errors.delay"
          />
          <q-select
            outlined
            dense
            rounded
            label="Status"
            v-model="status"
            v-bind="statusProps"
            :options="[
              { label: 'Pendente', value: 'pending' },
              { label: 'Programada', value: 'scheduled' }
            ]"
            :error="!!errors.status"
            :error-message="errors.status"
            style="width: 200px"
          />
          <q-file
            dense
            rounded
            v-if="!campanhaState.mediaUrl"
            :loading="loading"
            label="Mídia composição mensagem"
            ref="PickerFileMessage"
            v-model="arquivos"
            class="col-grow"
            bg-color="blue-grey-1"
            input-style="max-height: 30vh"
            outlined
            clearable
            autogrow
            append
            :max-files="1"
            counter
            :max-file-size="10485760"
            :max-total-size="30485760"
            accept=".jpg, .png, image/jpeg, .pdf, .doc, .docx, .mp4, .xls, .xlsx, .jpeg, .zip, .ppt, .pptx, image/*"
            @rejected="onRejectedFiles"
            style="width: 350px"
          />
          <q-input
            v-if="campanhaState.mediaUrl"
            readonly
            rounded
            label="Mídia composição mensagem"
            :value="cArquivoName"
            class="col-grow"
            bg-color="blue-grey-1"
            input-style="max-height: 30vh"
            outlined
            autogrow
            append
            counter
            style="width: 350px"
          >
            <template v-slot:append>
              <q-btn
                round
                dense
                flat
                icon="close"
                @click="handleResetMedia"
              />
            </template>
          </q-input>
        </div>
      </q-card-section>
      <q-card-section class="row q-pt-sm q-gutter-sm justify-center">
        <div style="min-width: 400px">
          <!-- 1ª Mensagem -->
          <CampaignMessageInput
             label="1ª Mensagem"
             placeholder="Digite a mensagem"
             v-model="message1"
             :variaveis="variaveis"
             :class="{ 'bg-red-1': !!errors.message1 }"
           />
           <q-separator class="q-my-md" />

          <!-- 2ª Mensagem -->
          <CampaignMessageInput
             label="2ª Mensagem"
             placeholder="Digite a mensagem"
             v-model="message2"
             :variaveis="variaveis"
             :class="{ 'bg-red-1': !!errors.message2 }"
           />
           <q-separator class="q-my-md" />

          <!-- 3ª Mensagem -->
          <CampaignMessageInput
             label="3ª Mensagem"
             placeholder="Digite a mensagem"
             v-model="message3"
             :variaveis="variaveis"
             :class="{ 'bg-red-1': !!errors.message3 }"
           />
        </div>
        <div style="width: 500px">
          <q-card
            bordered
            flat
            class="full-width"
          >
            <div class="text-body1 text-bold q-pa-sm full-width text-center bg-grey-3">Visualização</div>
            <q-card-section class="row justify-center">
              <q-option-group
                class="q-mb-sm"
                inline
                dense
                v-model="messagemPreview"
                :options="optRadio"
                color="primary"
              />
              <cMolduraCelular
                class="row justify-center"
                :key="cKey"
              >
                <MensagemChat
                  :isLineDate="false"
                  size="8"
                  class="full-width rounded-all"
                  :mensagens="cMessages"
                />
              </cMolduraCelular>
            </q-card-section>
          </q-card>
        </div>
      </q-card-section>
      <q-card-section>
        <div class="row justify-center">
          <q-btn
            label="Cancelar"
            color="negative"
            v-close-popup
            class="q-mr-md"
            rounded
          />
          <q-btn
            rounded
            label="Salvar"
            color="positive"
            icon="save"
            @click="handleCampanha"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { toTypedSchema } from '@vee-validate/zod'
import { parseISO, startOfDay } from 'date-fns'
import { notificarErro } from 'src/utils/helpersNotifications'
import CampaignMessageInput from 'src/components/campanhas/CampaignMessageInput.vue'
import { z } from 'zod'

const props = defineProps({
  modalCampanha: {
    type: Boolean,
    default: false
  },
  campanhaEdicao: {
    type: Object,
    default: () => ({ id: null })
  }
})

const emit = defineEmits([
  'update:modalCampanha',
  'update:campanhaEdicao',
  'modal-campanha:criada',
  'modal-campanha:editada'
])

const $q = useQuasar()
const whatsappStore = useWhatsappStore()
const { whatsapps } = storeToRefs(whatsappStore)
const campanhaStore = useCampanhaStore()
const { criarCampanha, alterarCampanha } = campanhaStore

const variaveis = [
  { label: 'Nome', value: '{{name}}' },
  { label: 'Saudação', value: '{{greeting}}' }
]

const optRadio = [
  { label: 'Msg.1', value: 'message1' },
  { label: 'Msg. 2', value: 'message2' },
  { label: 'Msg. 3', value: 'message3' }
]

const messagemPreview = ref('message1')
const loading = ref(false)
const arquivos = ref([])
// const message1Ref = ref(null) // Não precisamos mais refs aqui
// const message2Ref = ref(null)
// const message3Ref = ref(null)

const resetarCampanha = () => {
  resetForm()
  campanhaState.id = null
  campanhaState.mediaUrl = null
  arquivos.value = []
  // Set default values
  setValues({
    name: '',
    start: '',
    message1: '',
    message2: '',
    message3: '',
    sessionId: null,
    delay: 61,
    status: 'pending'
  })
}

const fecharModal = () => {
  resetarCampanha()
  emit('update:campanhaEdicao', { id: null })
  emit('update:modalCampanha', false)
}

const abrirModal = () => {
  if (props.campanhaEdicao.id) {
    campanhaState.id = props.campanhaEdicao.id
    campanhaState.mediaUrl = props.campanhaEdicao.mediaUrl
    setValues({
      name: props.campanhaEdicao.name,
      start: props.campanhaEdicao.start,
      message1: props.campanhaEdicao.message1,
      message2: props.campanhaEdicao.message2,
      message3: props.campanhaEdicao.message3,
      sessionId: props.campanhaEdicao.sessionId,
      delay: props.campanhaEdicao.delay || 10, // Adjust default if needed
      status: props.campanhaEdicao.status
    })
  } else {
    resetarCampanha()
  }
}

const onRejectedFiles = () => {
  $q.notify({
    html: true,
    message: `Ops... Ocorreu um erro! <br>
    <ul>
      <li>Arquivo deve ter no máximo 10MB.</li>
      <li>Priorize o envio de imagem ou vídeo.</li>
    </ul>`,
    type: 'negative',
    progress: true,
    position: 'top',
    actions: [{ icon: 'close', round: true, color: 'white' }]
  })
}

const handleCampanha = handleSubmit(async values => {
  if (
    values.message1 === values.message2 ||
    values.message1 === values.message3 ||
    (values.message2 && values.message2 === values.message3)
  ) {
    $q.notify({
      type: 'negative',
      message: 'As mensagens não podem ser iguais'
    })
    return
  }

  try {
    loading.value = true
    const medias = new FormData()
    // Append form values
    Object.keys(values).forEach(key => {
      if (values[key] !== null && values[key] !== undefined) {
        medias.append(key, values[key])
      }
    })
    // Append extra state if needed
    if (campanhaState.id) {
      medias.append('id', campanhaState.id)
    }
    if (campanhaState.mediaUrl) {
      medias.append('mediaUrl', campanhaState.mediaUrl)
    }

    if (arquivos.value && !Array.isArray(arquivos.value)) {
      medias.append('medias', arquivos.value)
    }

    if (campanhaState.id) {
      const data = await alterarCampanha(medias)
      emit('modal-campanha:editada', data)
      $q.notify({ type: 'info', message: 'Campanha editada!', position: 'top' })
    } else {
      const data = await criarCampanha(medias)
      emit('modal-campanha:criada', data)
      $q.notify({
        type: 'positive',
        message: 'Campanha criada!',
        position: 'top'
      })
    }
    fecharModal()
  } catch (error) {
    console.error(error)
    notificarErro('Algum problema ao processar campanha', error)
  } finally {
    loading.value = false
  }
})
</script>

<style lang="scss">
border-error {
  border: 3px solid red;
  background: red !important;
}
</style>
