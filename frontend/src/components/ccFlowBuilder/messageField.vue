<template>
  <div>
    <q-card
      flat
      class="q-pa-sm q-pb-md"
    >
      <q-card-section class="q-pa-none">
        <div class="flex flex-inline full-width items-center">
          <div
            class="flex flex-inline text-left"
            style="width: 40px"
          >
            <q-btn
              round
              flat
              dense
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
                  style="width: 40vw"
                  :showSearch="false"
                  :emojisByRow="20"
                  labelSearch="Localizar..."
                  lang="pt-BR"
                  @select="onInsertSelectEmoji"
                />
              </q-menu>
            </q-btn>
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
                    @click="onInsertSelectVariable(variavel.value)"
                    v-close-popup
                  >
                    <q-item-section>{{ variavel.label }}</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </div>
          <textarea
            ref="inputEnvioMensagem"
            style="min-height: 10vh; max-height: 30vh; flex: auto"
            class="q-pa-sm bg-white rounded-all"
            placeholder="Digite a mensagem"
            v-model="element.data.message"
          >
          </textarea>
        </div>
      </q-card-section>

      <!-- Seção de opções de mensagem -->
      <q-card-section class="q-pa-none q-mt-md">
        <div class="text-subtitle2 q-mb-sm row items-center justify-between">
          <span>Opções de Resposta</span>
          <div>
            <q-btn
              flat
              dense
              color="primary"
              icon="mdi-auto-fix"
              class="q-mr-sm"
              @click="extrairOpcoesDoTexto"
            >
              <q-tooltip>Extrair opções do texto automaticamente</q-tooltip>
            </q-btn>
            <q-btn
              flat
              dense
              color="negative"
              icon="mdi-delete-sweep"
              @click="limparTodasOpcoes"
              :disable="!element.data.options || element.data.options.length === 0"
            >
              <q-tooltip>Limpar todas as opções</q-tooltip>
            </q-btn>
          </div>
        </div>
        <div class="row q-col-gutter-sm">
          <div class="col-12">
            <q-input
              v-model="newOption"
              dense
              outlined
              rounded
              placeholder="Digite uma opção e pressione Enter"
              @keyup.enter="addOption"
            >
              <template v-slot:append>
                <q-btn
                  round
                  dense
                  flat
                  icon="mdi-plus"
                  @click="addOption"
                />
              </template>
            </q-input>
          </div>
          <div class="col-12">
            <div class="row q-col-gutter-sm">
              <div
                v-for="(option, index) in element.data.options"
                :key="index"
                class="col-auto"
              >
                <q-chip
                  removable
                  @remove="removeOption(index)"
                >
                  {{ option }}
                </q-chip>
              </div>
            </div>
          </div>
        </div>
      </q-card-section>

      <!-- Seção de delay -->
      <q-card-section class="q-pa-none q-mt-md">
        <div class="text-subtitle2 q-mb-sm">Delay da Mensagem</div>
        <q-input
          v-model.number="element.data.delay"
          type="number"
          dense
          outlined
          rounded
          suffix="ms"
          :min="0"
          :max="10000"
          @update:model-value="validateDelay"
        />
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { ref } from 'vue'
import EmojiPicker from 'vue3-emoji-picker'
import 'vue3-emoji-picker/css'

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

const onInsertSelectEmoji = emoji => {
  const tArea = inputEnvioMensagem.value
  const startPos = tArea.selectionStart
  const endPos = tArea.selectionEnd
  const cursorPos = startPos
  const tmpStr = tArea.value

  if (!emoji.i) return

  const txtContent = tmpStr.substring(0, startPos) + emoji.i + tmpStr.substring(endPos, tmpStr.length)
  props.element.data.message = txtContent

  setTimeout(() => {
    tArea.focus()
    tArea.selectionStart = tArea.selectionEnd = cursorPos + emoji.i.length
  }, 10)
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

<style lang="scss" scoped></style>
