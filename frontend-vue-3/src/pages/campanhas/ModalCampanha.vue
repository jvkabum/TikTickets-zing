<template>
  <q-dialog
    persistent
    v-model="modalCampanhaModel"
    @hide="fecharModal"
    @show="abrirModal"
  >
    <q-card
      class="q-pa-md glass-premium border-glass no-shadow rounded-all shadow-premium unified-modal-color"
      style="min-width: 70vw"
    >
      <q-card-section class="q-pa-none q-px-md">
        <div class="text-h5 text-bold text-primary q-mb-md">{{ campanhaEdicao.id ? 'Editar' : 'Criar' }} Campanha</div>
        <q-separator spaced />
        <div class="row q-mt-sm text-weight-medium">As mensagens sempre serão enviadas em horário comercial e dias úteis.</div>
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
          <div class="row items-center q-pt-none">
            <label class="text-heading text-bold">1ª Mensagem</label>
            <div class="col-xs-3 col-sm-2 col-md-1">
              <q-btn
                round
                flat
                class="q-ml-sm"
              >
                <q-icon
                  size="2em"
                  name="mdi-emoticon-happy-outline"
                />
                <q-tooltip> Emoji </q-tooltip>
                <q-menu
                  anchor="top right"
                  self="bottom middle"
                  :offset="[5, 40]"
                >
                  <EmojiPicker
                    :native="true"
                    :hide-search="false"
                    :disable-skin-tones="true"
                    @select="v => onInsertSelectEmoji(v, 'message1')"
                  />
                </q-menu>
              </q-btn>
            </div>
            <div class="col-xs-8 col-sm-10 col-md-11 q-pl-sm">
              <textarea
                ref="message1Ref"
                style="min-height: 12.5vh; max-height: 12.5vh"
                class="q-pa-sm bg-white full-width rounded-all"
                :class="{
                  'bg-red-1': !!errors.message1
                }"
                placeholder="Digite a mensagem"
                autogrow
                dense
                outlined
                v-model="message1"
                v-bind="message1Props"
              />
              <q-btn
                round
                flat
                dense
              >
                <q-icon
                  size="2em"
                  name="mdi-variable"
                />
                <q-tooltip> Variáveis </q-tooltip>
                <q-menu touch-position>
                  <q-list
                    dense
                    style="min-width: 100px"
                  >
                    <q-item
                      v-for="variavel in variaveis"
                      :key="variavel.label"
                      clickable
                      @click="onInsertSelectVariable(variavel.value, 'message1', 'message1')"
                      v-close-popup
                    >
                      <q-item-section>{{ variavel.label }}</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
              <q-separator class="q-my-md" />
            </div>
          </div>
          <div class="row items-center q-pt-none">
            <label class="text-heading text-bold">2ª Mensagem</label>
            <div class="col-xs-3 col-sm-2 col-md-1">
              <q-btn
                round
                flat
                class="q-ml-sm"
              >
                <q-icon
                  size="2em"
                  name="mdi-emoticon-happy-outline"
                />
                <q-tooltip> Emoji </q-tooltip>
                <q-menu
                  anchor="top right"
                  self="bottom middle"
                  :offset="[5, 40]"
                >
                  <EmojiPicker
                    :native="true"
                    :hide-search="false"
                    @select="v => onInsertSelectEmoji(v, 'message2')"
                  />
                </q-menu>
              </q-btn>
            </div>
            <div class="col-xs-8 col-sm-10 col-md-11 q-pl-sm">
              <textarea
                ref="message2Ref"
                style="min-height: 12.5vh; max-height: 12.5vh"
                class="q-pa-sm bg-white full-width rounded-all"
                placeholder="Digite a mensagem"
                autogrow
                dense
                outlined
                :class="{
                  'bg-red-1': !!errors.message2
                }"
                v-model="message2"
                v-bind="message2Props"
              />
              <q-btn
                round
                flat
                dense
              >
                <q-icon
                  size="2em"
                  name="mdi-variable"
                />
                <q-tooltip> Variáveis </q-tooltip>
                <q-menu touch-position>
                  <q-list
                    dense
                    style="min-width: 100px"
                  >
                    <q-item
                      v-for="variavel in variaveis"
                      :key="variavel.label"
                      clickable
                      @click="onInsertSelectVariable(variavel.value, 'message2', 'message2')"
                      v-close-popup
                    >
                      <q-item-section>{{ variavel.label }}</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
              <q-separator class="q-my-md" />
            </div>
          </div>
          <div class="row items-center q-pt-none">
            <label class="text-heading text-bold">3ª Mensagem</label>
            <div class="col-xs-3 col-sm-2 col-md-1">
              <q-btn
                round
                flat
                class="q-ml-sm"
              >
                <q-icon
                  size="2em"
                  name="mdi-emoticon-happy-outline"
                />
                <q-tooltip> Emoji </q-tooltip>
                <q-menu
                  anchor="top right"
                  self="bottom middle"
                  :offset="[5, 40]"
                >
                  <EmojiPicker
                    :native="true"
                    :hide-search="false"
                    @select="v => onInsertSelectEmoji(v, 'message3')"
                  />
                </q-menu>
              </q-btn>
            </div>
            <div class="col-xs-8 col-sm-10 col-md-11 q-pl-sm">
              <textarea
                ref="message3Ref"
                style="min-height: 12.5vh; max-height: 12.5vh"
                class="q-pa-sm bg-white full-width rounded-all"
                placeholder="Digite a mensagem"
                autogrow
                dense
                outlined
                :class="{
                  'bg-red-1': !!errors.message3
                }"
                v-model="message3"
                v-bind="message3Props"
              />
              <q-btn
                round
                flat
                dense
              >
                <q-icon
                  size="2em"
                  name="mdi-variable"
                />
                <q-tooltip> Variáveis </q-tooltip>
                <q-menu touch-position>
                  <q-list
                    dense
                    style="min-width: 100px"
                  >
                    <q-item
                      v-for="variavel in variaveis"
                      :key="variavel.label"
                      clickable
                      @click="onInsertSelectVariable(variavel.value, 'message3', 'message3')"
                      v-close-popup
                    >
                      <q-item-section>{{ variavel.label }}</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>
          </div>
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
import EmojiPicker from 'vue3-emoji-picker'
import 'vue3-emoji-picker/css'
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
const message1Ref = ref(null)
const message2Ref = ref(null)
const message3Ref = ref(null)

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
    sessionId: z.any().refine(val => !!val, 'Obrigatório'), // Adjust based on sessionId type
    delay: z.coerce.number().min(61, 'Deve ser no mínimo 61'),
    status: z.string().min(1, 'Obrigatório')
  })
)

const { handleSubmit, errors, defineField, setValues, resetForm } = useForm({
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
  if (arquivos.value && arquivos.value.type) {
    const blob = new Blob([arquivos.value], { type: arquivos.value.type })
    messages.push({
      ...messageTemplate,
      id: 'mediaUrl',
      mediaUrl: window.URL.createObjectURL(blob),
      body: arquivos.value.name,
      mediaType: arquivos.value.type.substr(0, arquivos.value.type.indexOf('/'))
    })
  } else if (campanhaState.mediaUrl) {
    messages.push({
      ...messageTemplate,
      id: 'mediaUrl',
      mediaUrl: campanhaState.mediaUrl,
      body: '',
      mediaType: 'chat'
    })
  }

  const el = messagemPreview.value
  let bodyValue = ''
  if (el === 'message1') bodyValue = message1.value
  if (el === 'message2') bodyValue = message2.value
  if (el === 'message3') bodyValue = message3.value

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

const onInsertSelectVariable = (variable, textAreaRefName, fieldName) => {
  const refs = {
    message1: message1Ref,
    message2: message2Ref,
    message3: message3Ref
  }
  const tArea = refs[textAreaRefName].value
  if (!tArea || !variable) return

  const startPos = tArea.selectionStart
  const endPos = tArea.selectionEnd
  const originalText = tArea.value

  const newText = originalText.substring(0, startPos) + variable + originalText.substring(endPos)

  const fieldSetters = {
    message1: v => (message1.value = v),
    message2: v => (message2.value = v),
    message3: v => (message3.value = v)
  }
  fieldSetters[fieldName](newText)

  nextTick(() => {
    const newCursorPos = startPos + variable.length
    tArea.setSelectionRange(newCursorPos, newCursorPos)
    tArea.focus()
  })
}

const onInsertSelectEmoji = (emoji, textAreaRefName) => {
  const refs = {
    message1: message1Ref,
    message2: message2Ref,
    message3: message3Ref
  }
  const tArea = refs[textAreaRefName].value
  if (!tArea || !emoji.i) return

  const startPos = tArea.selectionStart
  const endPos = tArea.selectionEnd
  const tmpStr = tArea.value

  const newText = tmpStr.substring(0, startPos) + emoji.i + tmpStr.substring(endPos)

  const fieldSetters = {
    message1: v => (message1.value = v),
    message2: v => (message2.value = v),
    message3: v => (message3.value = v)
  }
  fieldSetters[textAreaRefName](newText)

  nextTick(() => {
    tArea.selectionStart = tArea.selectionEnd = startPos + emoji.i.length
    tArea.focus()
  })
}

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
