<template>
  <div>
    <q-card
      flat
      class="q-pa-sm q-pb-md"
    >
      <q-card-section class="q-pa-none">
        <div class="row full-width items-start no-wrap q-pa-sm">
          <!-- Coluna de Ferramentas -->
          <div class="column items-center q-gutter-y-sm q-mr-sm" style="width: 44px">
            <EmojiPickerComponent
              icon="face"
              height="300px"
              @select="onInsertSelectEmoji"
              flat
              round
              color="primary"
            />
            <q-btn
              round
              flat
              color="grey-8"
              size="13px"
              class="hover-bg-soft tool-btn-no-text"
            >
              <q-icon name="functions" size="20px" />
              <q-tooltip>Variáveis</q-tooltip>
              <q-menu touch-position transition-show="scale" transition-hide="scale">
                <q-list dense style="min-width: 156px" class="bg-white">
                  <q-item-label header class="text-caption text-bold text-primary">VARIÁVEIS DISPONÍVEIS</q-item-label>
                  <q-item
                    v-for="variavel in variaveis"
                    :key="variavel.label"
                    clickable
                    v-close-popup
                    @click="onInsertSelectVariable(variavel.value)"
                  >
                    <q-item-section avatar>
                      <q-icon name="add_circle" size="xs" color="primary" />
                    </q-item-section>
                    <q-item-section>{{ variavel.label }}</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </div>

          <!-- Campo de Texto Principal -->
          <q-input
            ref="inputEnvioMensagem"
            v-model="element.data.message"
            placeholder="Digite a mensagem..."
            type="textarea"
            autogrow
            outlined
            dense
            bg-color="transparent"
            class="full-width text-body2 custom-textarea-flow"
          />
        </div>
      </q-card-section>

      <!-- Seção de opções de mensagem -->
      <q-card-section class="q-pa-none q-mt-lg border-top-soft">
        <div class="row items-center justify-between q-mb-sm q-pt-sm">
          <div class="text-subtitle2 text-weight-bold text-primary flex items-center">
            <q-icon name="list" class="q-mr-xs" /> Opções de Resposta
          </div>
          <div class="q-gutter-x-xs">
            <q-btn
              flat
              round
              dense
              color="primary"
              icon="auto_fix_high"
              size="sm"
              @click="extrairOpcoesDoTexto"
            >
              <q-tooltip>Mágica: Extrair do texto</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              color="negative"
              icon="delete_outline"
              size="sm"
              @click="limparTodasOpcoes"
              :disable="!element.data.options || element.data.options.length === 0"
            >
              <q-tooltip>Limpar tudo</q-tooltip>
            </q-btn>
          </div>
        </div>

        <q-input
          v-model="newOption"
          dense
          outlined
          placeholder="Adicionar nova opção..."
          @keyup.enter="addOption"
          class="bg-soft-input q-mb-sm shadow-1"
        >
          <template v-slot:append>
            <q-btn
              icon="add_circle"
              flat
              round
              color="primary"
              @click="addOption"
            />
          </template>
        </q-input>

        <div class="row q-gutter-xs q-mb-md">
          <q-chip
            v-for="(option, index) in element.data.options"
            :key="index"
            removable
            dense
            color="primary"
            text-color="white"
            class="glow-primary-soft text-caption text-weight-medium"
            @remove="removeOption(index)"
          >
            {{ option }}
          </q-chip>
        </div>
      </q-card-section>

      <!-- Seção de delay -->
      <q-card-section class="q-pa-none q-mt-md q-pt-sm border-top-soft">
        <div class="row items-center justify-center q-gutter-x-sm">
          <div class="text-caption text-weight-bold text-grey-7">DELAY DA MENSAGEM:</div>
          <q-input
            v-model.number="element.data.delay"
            type="number"
            dense
            outlined
            suffix="ms"
            style="width: 100px"
            input-class="text-center text-weight-bold"
            @update:model-value="validateDelay"
          />
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import EmojiPickerComponent from 'src/components/EmojiPickerComponent.vue'
import useEmoji from 'src/composables/useEmoji'

const props = defineProps({
  element: {
    type: Object,
    required: true
  }
})

const $q = useQuasar()
const inputEnvioMensagem = ref(null)
const newOption = ref('')

const variaveis = [
  { label: 'Nome', value: '{{name}}' },
  { label: 'Saudação', value: '{{greeting}}' },
  { label: 'Protocolo', value: '{{protocol}}' }
]

const { insertEmoji } = useEmoji()

const onInsertSelectEmoji = emoji => {
  insertEmoji(emoji, inputEnvioMensagem.value, props.element.data.message, val => (props.element.data.message = val))
}

const onInsertSelectVariable = variable => {
  const tArea = inputEnvioMensagem.value
  const startPos = tArea.selectionStart
  const endPos = tArea.selectionEnd
  const cursorPos = startPos
  const tmpStr = tArea.value

  if (!variable) return

  const txtContent = tmpStr.substring(0, startPos) + variable + tmpStr.substring(endPos, tmpStr.length)
  props.element.data.message = txtContent

  setTimeout(() => {
    tArea.focus()
    tArea.selectionStart = tArea.selectionEnd = cursorPos + variable.length
  }, 10)
}

const addOption = () => {
  if (newOption.value.trim()) {
    if (!props.element.data.options) {
      props.element.data.options = []
    }
    props.element.data.options.push(newOption.value.trim())
    updateMessageWithOptions()
    newOption.value = ''
  }
}

const removeOption = index => {
  if (Array.isArray(props.element.data.options)) {
    props.element.data.options.splice(index, 1)
    updateMessageWithOptions()
  }
}

const updateMessageWithOptions = () => {
  if (!props.element.data.options || props.element.data.options.length === 0) {
    return
  }

  let message = props.element.data.message || ''

  const optionPatterns = [
    /\n\n\*Opções disponíveis:\*\n([\s\S]*?)(\n_Digite o número ou o texto da opção desejada_)?$/,
    /^\*Opções disponíveis:\*\n([\s\S]*?)(\n_Digite o número ou o texto da opção desejada_)?$/
  ]

  for (const pattern of optionPatterns) {
    message = message.replace(pattern, '')
  }

  message = message.replace(/\n+$/, '')
  if (message && !message.endsWith('\n')) message += '\n'
  if (message) message += '\n'

  message += '*Opções disponíveis:*\n'
  props.element.data.options.forEach((option, index) => {
    message += `${index + 1}️⃣ *${option}*\n`
  })
  message += '\n_Digite o número ou o texto da opção desejada_'

  props.element.data.message = message
}

const validateDelay = value => {
  if (value < 0) props.element.data.delay = 0
  if (value > 10000) props.element.data.delay = 10000
}

const extrairOpcoesDoTexto = () => {
  const texto = props.element.data.message || ''
  if (!texto.trim()) {
    $q.notify({
      type: 'warning',
      message: 'Digite uma mensagem antes de extrair opções',
      position: 'top',
      timeout: 2000
    })
    return
  }

  const opcoesEncontradas = []
  const padraoNumerado = /^\s*(?:\d+[.)]|\(\d+\))\s*(.*?)$/gm
  let match
  while ((match = padraoNumerado.exec(texto)) !== null) {
    if (match[1] && match[1].trim()) opcoesEncontradas.push(match[1].trim())
  }

  const padraoMarcadores = /^\s*[-*•]\s*(.*?)$/gm
  while ((match = padraoMarcadores.exec(texto)) !== null) {
    if (match[1] && match[1].trim()) opcoesEncontradas.push(match[1].trim())
  }

  const padraoOpcaoExplicita = /\b(?:opção|opcao|option)\s*(?:\d+|[a-z])[:]?\s*(.*?)(?:\n|$)/gim
  while ((match = padraoOpcaoExplicita.exec(texto)) !== null) {
    if (match[1] && match[1].trim()) opcoesEncontradas.push(match[1].trim())
  }

  const opcoesUnicas = [...new Set(opcoesEncontradas)]

  if (opcoesUnicas.length > 0) {
    props.element.data.options = opcoesUnicas
    updateMessageWithOptions()

    $q.notify({
      type: 'positive',
      message: `${opcoesUnicas.length} opções encontradas e adicionadas automaticamente`,
      position: 'top',
      timeout: 2000
    })
  } else {
    $q.notify({
      type: 'warning',
      message: 'Nenhuma opção encontrada no texto',
      position: 'top',
      timeout: 2000
    })
  }
}

const limparTodasOpcoes = () => {
  $q.dialog({
    title: 'Atenção',
    message: 'Deseja realmente remover todas as opções?',
    cancel: { label: 'Não', color: 'primary', flat: true },
    ok: { label: 'Sim', color: 'negative', flat: true },
    persistent: true
  }).onOk(() => {
    props.element.data.options = []
    let message = props.element.data.message || ''
    const optionPatterns = [
      /\n\n\*Opções disponíveis:\*\n([\s\S]*?)(\n_Digite o número ou o texto da opção desejada_)?$/,
      /^\*Opções disponíveis:\*\n([\s\S]*?)(\n_Digite o número ou o texto da opção desejada_)?$/
    ]

    for (const pattern of optionPatterns) {
      message = message.replace(pattern, '')
    }
    message = message.replace(/\n+$/, '')
    props.element.data.message = message

    $q.notify({
      type: 'positive',
      message: 'Todas as opções foram removidas',
      position: 'top',
      timeout: 2000
    })
  })
}
</script>

<style lang="scss" scoped>
.custom-textarea-flow {
  :deep(textarea) {
    line-height: 1.5;
    padding: 8px !important;
  }
}

.tool-btn-no-text {
  font-size: 0 !important;
  color: transparent !important;
  :deep(.q-btn__content) {
    font-size: 0 !important;
    i {
      font-size: 20px !important;
      color: inherit;
    }
  }
}

.hover-bg-soft:hover {
  background: rgba(var(--q-primary), 0.1) !important;
}

.bg-soft-input {
  background: rgba(0, 0, 0, 0.03);
}

.border-top-soft {
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.glow-primary-soft {
  box-shadow: 0 0 8px rgba(var(--q-primary), 0.2);
}

.bg-surface {
  background: white;
}

body.body--dark {
  .bg-soft-input {
    background: rgba(255, 255, 255, 0.05);
  }
  .border-top-soft {
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
}
</style>

