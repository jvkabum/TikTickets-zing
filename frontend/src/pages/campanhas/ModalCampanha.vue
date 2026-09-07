<template>
  <q-dialog
    v-model="modalCampanhaModel"
    @hide="fecharModal"
    @show="abrirModal"
  >
    <q-card
      class="glass-premium border-glass no-shadow rounded-all shadow-premium unified-modal-color column no-wrap"
      style="min-width: 75vw; max-height: 95vh;"
    >
      <!-- Cabeçalho Fixo -->
      <q-card-section class="q-pa-md bg-transparent">
        <div class="row items-center justify-between">
          <div class="text-h5 text-bold text-primary">{{ campanhaEdicao.id ? 'Editar' : 'Criar' }} Campanha</div>
          <q-btn icon="close" flat round dense v-close-popup />
        </div>
        <q-separator spaced />
        <div class="text-weight-medium q-mt-xs">As mensagens sempre serão enviadas em horário comercial e dias úteis.</div>
      </q-card-section>

      <!-- Conteúdo com Scroll -->
      <q-card-section class="col scroll q-pa-md">
        <div class="row q-col-gutter-md">
          <!-- Configurações Gerais -->
          <div class="col-12">
            <div class="row q-gutter-sm">
              <q-input
                outlined dense rounded
                style="width: 400px"
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
                rounded dense outlined
                emit-value map-options
                label="Enviar por"
                color="primary"
                v-model="sessionId"
                v-bind="sessionIdProps"
                :options="cSessions"
                option-value="id"
                option-label="name"
                :error="!!errors.sessionId"
                :error-message="errors.sessionId"
                style="width: 220px"
              />
              <q-input
                rounded outlined dense
                style="width: 140px"
                v-model="delay"
                v-bind="delayProps"
                input-class="text-right"
                suffix="seg"
                label="Delay"
                :error="!!errors.delay"
                :error-message="errors.delay"
              />
              <q-select
                outlined dense rounded
                label="Status"
                v-model="status"
                v-bind="statusProps"
                :options="[
                  { label: 'Pendente', value: 'pending' },
                  { label: 'Programada', value: 'scheduled' }
                ]"
                :error="!!errors.status"
                :error-message="errors.status"
                style="width: 180px"
              />
            </div>
          </div>

          <!-- Mensagens e Preview -->
          <div class="col-12 col-md-7">
            <div class="column q-gutter-y-md">
              <CampaignMessageInput
                label="1ª Mensagem"
                v-model="message1"
                v-model:media="media1"
                :variaveis="variaveis"
                :error="!!errors.message1"
                :error-message="errors.message1"
              />
              <CampaignMessageInput
                label="2ª Mensagem"
                v-model="message2"
                v-model:media="media2"
                :variaveis="variaveis"
                :error="!!errors.message2"
                :error-message="errors.message2"
              />
              <CampaignMessageInput
                label="3ª Mensagem"
                v-model="message3"
                v-model:media="media3"
                :variaveis="variaveis"
                :error="!!errors.message3"
                :error-message="errors.message3"
              />
            </div>
          </div>

          <div class="col-12 col-md-5">
            <q-card
              flat bordered
              class="full-width glass-premium shadow-premium border-glass no-shadow"
              style="min-height: 500px"
            >
              <q-card-section class="column items-center">
                <q-option-group
                  class="q-mb-md"
                  inline dense
                  v-model="messagemPreview"
                  :options="optRadio"
                  color="primary"
                />
                <cMolduraCelular :key="cKey" style="transform: scale(1.0); transform-origin: top center; margin-top: 5px;">
                  <MensagemChat
                    :isLineDate="false"
                    size="8"
                    class="full-width"
                    :mensagens="cMessages"
                  />
                </cMolduraCelular>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-card-section>

      <!-- Rodapé Fixo -->
      <q-card-actions align="center" class="q-pa-md bg-transparent">
        <q-btn
          label="Cancelar"
          color="negative"
          v-close-popup
          class="q-px-lg"
          rounded
          outline
        />
        <q-btn
          rounded
          label="Salvar Campanha"
          color="positive"
          icon="save"
          class="q-px-xl shadow-premium"
          @click="handleCampanha"
          :loading="loading"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { toTypedSchema } from '@vee-validate/zod'
import { parseISO, startOfDay } from 'date-fns'
import { notificarErro } from 'src/utils/helpersNotifications'
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

const isValidDate = dateString => {
  const date = parseISO(dateString)
  return startOfDay(date).getTime() >= startOfDay(new Date()).getTime()
}

const validationSchema = toTypedSchema(
  z.object({
    name: z.string().min(1, 'Obrigatório'),
    start: z.string().min(1, 'Obrigatório').refine(isValidDate, 'Não pode ser inferior ao dia atual'),
    message1: z.string().min(1, 'Obrigatório'),
    message2: z.string().min(1, 'Obrigatório'),
    message3: z.string().min(1, 'Obrigatório'),
    sessionId: z.any().refine(val => !!val, 'Obrigatório'),
    delay: z.coerce.number().min(61, 'Deve ser no mínimo 61'),
    status: z.string().min(1, 'Obrigatório'),
    media1: z.any().nullable().optional(),
    media2: z.any().nullable().optional(),
    media3: z.any().nullable().optional()
  })
)

const { handleSubmit, errors, defineField, setValues, resetForm, values: formValues } = useForm({
  validationSchema
})

const [name, nameProps] = defineField('name')
const [start, startProps] = defineField('start')
const [message1, message1Props] = defineField('message1')
const [message2, message2Props] = defineField('message2')
const [message3, message3Props] = defineField('message3')
const [sessionId, sessionIdProps] = defineField('sessionId')
const [delay, delayProps] = defineField('delay')
const [status, statusProps] = defineField('status')
const [media1, media1Props] = defineField('media1')
const [media2, media2Props] = defineField('media2')
const [media3, media3Props] = defineField('media3')

// State for non-form fields matching exact previous behavior
const campanhaState = reactive({
  id: null,
  mediaUrl: null
})

const modalCampanhaModel = computed({
  get: () => props.modalCampanha,
  set: v => emit('update:modalCampanha', v)
})

const handleResetMedia = () => {
  campanhaState.mediaUrl = null
  arquivos.value = []
}

const cSessions = computed(() => {
  return whatsapps.value.filter(w => w.type === 'whatsapp' && !w.isDeleted)
})

const cKey = computed(() => {
  return (message1.value || '') + (message2.value || '') + (message3.value || '')
})

const cArquivoName = computed(() => {
  if (!campanhaState.mediaUrl) return ''
  const split = campanhaState.mediaUrl.split('/')
  return split[split.length - 1]
})

const cMessages = computed(() => {
  const messages = []
  const el = messagemPreview.value
  let currentMedia = null
  let bodyValue = ''

  if (el === 'message1') {
    currentMedia = media1.value
    bodyValue = message1.value
  } else if (el === 'message2') {
    currentMedia = media2.value
    bodyValue = message2.value
  } else if (el === 'message3') {
    currentMedia = media3.value
    bodyValue = message3.value
  }

  if (currentMedia) {
    if (currentMedia instanceof File) {
      const blob = new Blob([currentMedia], { type: currentMedia.type })
      messages.push({
        ...messageTemplate,
        id: 'mediaUrl',
        mediaUrl: window.URL.createObjectURL(blob),
        body: currentMedia.name,
        mediaType: currentMedia.type.split('/')[0]
      })
    } else if (typeof currentMedia === 'string') {
      messages.push({
        ...messageTemplate,
        id: 'mediaUrl',
        mediaUrl: currentMedia,
        body: '',
        mediaType: 'chat'
      })
    }
  }

  if (bodyValue) {
    messages.push({
      ...messageTemplate,
      id: el,
      body: bodyValue
    })
  }
  return messages
})

const messageTemplate = {
  mediaUrl: null,
  id: null,
  ack: 3,
  read: true,
  fromMe: true,
  body: null,
  mediaType: 'chat',
  isDeleted: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  quotedMsgId: null,
  delay: 61,
  ticketId: 0,
  contactId: null,
  userId: null,
  contact: null,
  quotedMsg: null
}

// Redundant functions removed (moved to CampaignMessageInput)

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
    status: 'pending',
    media1: null,
    media2: null,
    media3: null
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
    setValues({
      name: props.campanhaEdicao.name,
      start: props.campanhaEdicao.start,
      message1: props.campanhaEdicao.message1,
      message2: props.campanhaEdicao.message2,
      message3: props.campanhaEdicao.message3,
      sessionId: props.campanhaEdicao.sessionId,
      delay: props.campanhaEdicao.delay || 10,
      status: props.campanhaEdicao.status,
      media1: props.campanhaEdicao.mediaUrl,
      media2: props.campanhaEdicao.mediaUrl2,
      media3: props.campanhaEdicao.mediaUrl3
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
    // Append form values (everything except media files first)
    const dataToSend = { ...values }
    delete dataToSend.media1
    delete dataToSend.media2
    delete dataToSend.media3

    Object.keys(dataToSend).forEach(key => {
      if (dataToSend[key] !== null && dataToSend[key] !== undefined) {
        medias.append(key, dataToSend[key])
      }
    })

    if (campanhaState.id) {
      medias.append('id', campanhaState.id)
    }

    // Attach media files in order for the backend 'medias' array
    if (values.media1 instanceof File) medias.append('medias', values.media1)
    if (values.media2 instanceof File) medias.append('medias', values.media2)
    if (values.media3 instanceof File) medias.append('medias', values.media3)

    // Handle existing media URLs (strings) to avoid losing them
    if (typeof values.media1 === 'string') medias.append('mediaUrl', values.media1)
    if (typeof values.media2 === 'string') medias.append('mediaUrl2', values.media2)
    if (typeof values.media3 === 'string') medias.append('mediaUrl3', values.media3)

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
