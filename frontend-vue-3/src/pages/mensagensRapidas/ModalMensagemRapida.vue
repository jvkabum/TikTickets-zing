<template>
  <q-dialog
    :model-value="modalMensagemRapida"
    @hide="fecharModal"
    @show="abrirModal"
    @keyup.esc="fecharModal"
  >
    <q-card
      :style="$q.screen.width < 500 ? 'width: 95vw' : 'min-width: 500px; max-width: 700px'"
      class="q-pa-lg glass-premium border-glass no-shadow rounded-all shadow-premium unified-modal-color"
    >
      <div class="text-h5 text-bold text-primary">
        {{ mensagemRapida.id ? 'Editar' : 'Criar' }} Mensagem Rápida
        {{ mensagemRapida.id ? `(ID: ${mensagemRapida.id})` : '' }}
      </div>
      <q-separator spaced />
      <q-card-section class="q-pa-none">
        <div class="row q-my-sx">
          <div class="col flex justify-center">
            <div class="column items-center">
              <q-input
                style="width: 300px"
                outlined
                rounded
                dense
                v-model="key"
                v-bind="keyProps"
                label="Chave"
                :error="!!errors.key"
                :error-message="errors.key"
              />
              <p style="font-size: 14px; margin-top: 3px; text-align: center">
                chave é o atalho para pesquisa da mensagem.
              </p>
            </div>
          </div>
        </div>

        <!-- Ícones para Emojis e Variáveis -->
        <div class="row items-center">
          <div class="col-xs-3 col-sm-2 col-md-1">
            <!-- Emoji Icon -->
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
                <!-- <EmojiPicker
                  style="width: 40vw"
                  :showSearch="false"
                  :emojisByRow="20"
                  labelSearch="Localizar..."
                  lang="pt-BR"
                  @select="onInsertSelectEmoji"
                /> -->
              </q-menu>
            </q-btn>

            <!-- Variáveis Icon -->
            <q-btn
              round
              flat
              class="q-ml-sm"
            >
              <q-icon
                size="2em"
                name="mdi-code-braces"
              />
              <q-tooltip> Variáveis </q-tooltip>
              <q-menu
                anchor="top right"
                self="bottom middle"
                :offset="[5, 40]"
              >
                <q-list padding>
                  <q-item
                    v-for="variavel in variaveis"
                    :key="variavel.value"
                    clickable
                    @click="inserirVariavel(variavel.value)"
                  >
                    <q-item-section>{{ variavel.label }}</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </div>

          <!-- Textarea for Message -->
          <div class="col-xs-8 col-sm-10 col-md-11 q-pl-sm">
            <label class="text-caption">Mensagem:</label>
            <textarea
              ref="inputEnvioMensagem"
              style="min-height: 15vh; max-height: 25vh"
              class="q-pa-sm glass-input full-width rounded-all"
              placeholder="Digite a mensagem"
              autogrow
              dense
              outlined
              v-model="message"
              v-bind="messageProps"
            />
          </div>
        </div>

        <!-- Componente de Preview -->
        <MediaPreviewList
          v-if="mensagemRapida.medias && mensagemRapida.medias.length > 0"
          :medias="mensagemRapida.medias"
          @delete-media="handleDeleteMedia"
        />

        <input
          type="file"
          ref="fileInput"
          style="display: none"
          @change="onFileInputChange"
          multiple
          accept="apk/*,image/*,video/*,audio/*,application/pdf"
        />
      </q-card-section>

      <!-- Botões de ação -->
      <q-card-actions
        align="right"
        class="q-mt-md"
      >
        <q-btn
          round
          color="primary"
          icon="attach_file"
          class="q-mr-md"
          @click="fileInput.click()"
        >
          <q-tooltip>Anexar Arquivo</q-tooltip>
        </q-btn>
        <q-btn
          rounded
          label="Cancelar"
          color="negative"
          v-close-popup
          class="q-mr-md"
        />
        <q-btn
          rounded
          label="Salvar"
          color="positive"
          @click="handleMensagemRapida"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { toTypedSchema } from '@vee-validate/zod'
import MediaPreviewList from 'src/components/mensagensRapidas/MediaPreviewList.vue'
import { z } from 'zod'

const props = defineProps({
  modalMensagemRapida: {
    type: Boolean,
    default: false
  },
  mensagemRapidaEmEdicao: {
    type: Object,
    default: () => ({ id: null, key: '', message: '', medias: [] })
  }
})

const emit = defineEmits([
  'update:modalMensagemRapida',
  'update:mensagemRapidaEmEdicao',
  'mensagemRapida:criada',
  'mensagemRapida:editada'
])

const $q = useQuasar()
const mensagemRapidaStore = useMensagemRapidaStore()
const { criarMensagemRapida, alterarMensagemRapida, deletarImagemMensagemRapida } = mensagemRapidaStore

const loading = ref(false)
const fileInput = ref(null)
const inputEnvioMensagem = ref(null)

const validationSchema = toTypedSchema(
  z.object({
    key: z.string().min(1, 'A chave é obrigatória'),
    message: z.string().optional(),
    medias: z.array(z.any()).optional()
  })
)

const { handleSubmit, errors, defineField, setValues, resetForm } = useForm({
  validationSchema,
  initialValues: {
    key: '',
    message: '',
    medias: []
  }
})

const [key, keyProps] = defineField('key')
const [message, messageProps] = defineField('message')

const mensagemRapida = reactive({
  id: null,
  medias: []
})

const variaveis = [
  { label: 'Nome', value: '{{name}}' },
  { label: 'Saudação', value: '{{greeting}}' },
  { label: 'Protocolo', value: '{{protocol}}' }
]

const onInsertSelectEmoji = emoji => {
  const tArea = inputEnvioMensagem.value
  if (!tArea || !emoji.data) return

  const startPos = tArea.selectionStart
  const endPos = tArea.selectionEnd
  const tmpStr = message.value || ''

  const newMessage = tmpStr.substring(0, startPos) + emoji.data + tmpStr.substring(endPos)
  setValues({ message: newMessage })

  nextTick(() => {
    tArea.selectionStart = tArea.selectionEnd = startPos + emoji.data.length
    tArea.focus()
  })
}

const inserirVariavel = variavel => {
  setValues({ message: (message.value || '') + ' ' + variavel })
}

const onFileAdded = files => {
  mensagemRapida.medias = [...mensagemRapida.medias, ...files]
}

const onFileInputChange = event => {
  const files = Array.from(event.target.files)
  onFileAdded(files)
  event.target.value = null
}

const handleDeleteMedia = async ({ media, index }) => {
  try {
    if (mensagemRapida.id && typeof media === 'string') {
      await deletarImagemMensagemRapida(mensagemRapida.id, media)
    }
    mensagemRapida.medias.splice(index, 1)
    $q.notify({ type: 'positive', message: 'Mídia excluída com sucesso!' })
  } catch (error) {
    console.error('Erro ao excluir a imagem:', error)
    $q.notify({ type: 'negative', message: 'Erro ao excluir mídia.' })
  }
}

const resetarModal = () => {
  resetForm()
  mensagemRapida.id = null
  mensagemRapida.medias = []
  setValues({ key: '', message: '' })
}

const fecharModal = () => {
  resetarModal()
  emit('update:mensagemRapidaEmEdicao', { id: null })
  emit('update:modalMensagemRapida', false)
}

const abrirModal = () => {
  if (props.mensagemRapidaEmEdicao.id) {
    mensagemRapida.id = props.mensagemRapidaEmEdicao.id
    mensagemRapida.medias = props.mensagemRapidaEmEdicao.medias || []
    setValues({
      key: props.mensagemRapidaEmEdicao.key,
      message: props.mensagemRapidaEmEdicao.message || ''
    })
  } else {
    resetarModal()
  }
}

const handleMensagemRapida = handleSubmit(async values => {
  const formData = new FormData()
  formData.append('key', values.key)
  formData.append('message', values.message || '')

  if (mensagemRapida.medias) {
    mensagemRapida.medias.forEach(file => {
      formData.append('medias', file)
    })
  }

  loading.value = true
  try {
    if (mensagemRapida.id) {
      const data = await alterarMensagemRapida(mensagemRapida.id, formData)
      emit('mensagemRapida:editada', { ...data })
      $q.notify({
        type: 'info',
        message: 'Mensagem Rápida editada!',
        position: 'top'
      })
    } else {
      const data = await criarMensagemRapida(formData)
      emit('mensagemRapida:criada', data)
      $q.notify({
        type: 'positive',
        message: 'Mensagem rápida criada!',
        position: 'top'
      })
    }
    fecharModal()
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
})
</script>

<style lang="scss" scoped>
.glass-input {
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(0, 0, 0, 0.1);
  outline: none;
  transition: all 0.3s;
  &:focus {
    border-color: var(--q-primary);
    background: rgba(255, 255, 255, 0.8);
  }
  body.body--dark & {
    background: rgba(100, 150, 255, 0.05);
    border-color: rgba(135, 150, 255, 0.2);
    color: white;
    &:focus {
       background: rgba(100, 150, 255, 0.1);
       border-color: var(--q-primary);
    }
  }
}

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
