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
              <q-tooltip>
                Emoji
              </q-tooltip>
              <q-menu
                anchor="top right"
                self="bottom middle"
                :offset="[5, 40]"
              >
                <VEmojiPicker
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
              <q-tooltip>
                Variáveis
              </q-tooltip>
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
            autogrow
            dense
            outlined
            @input="(v) => $attrs.element.data.message = v.target.value"
            :value="$attrs.element.data.message"
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
              color="negative"
              icon="mdi-delete-sweep"
              @click="limparTodasOpcoes"
              :disable="!$attrs.element.data.options || $attrs.element.data.options.length === 0"
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
                v-for="(option, index) in $attrs.element.data.options"
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
          v-model.number="$attrs.element.data.delay"
          type="number"
          dense
          outlined
          rounded
          suffix="ms"
          :min="0"
          :max="10000"
          @input="validateDelay"
        />
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import { VEmojiPicker } from 'v-emoji-picker'

export default {
  name: 'MessageField',
  components: { VEmojiPicker },
  data () {
    return {
      variaveis: [
        { label: 'Nome', value: '{{name}}' },
        { label: 'Saudação', value: '{{greeting}}' },
        { label: 'Protocolo', value: '{{protocol}}' }
      ],
      newOption: '',
      txtContent: ''
    }
  },
  methods: {
    onInsertSelectEmoji (emoji) {
      const self = this
      var tArea = this.$refs.inputEnvioMensagem
      // get cursor's position:
      var startPos = tArea.selectionStart,
        endPos = tArea.selectionEnd,
        cursorPos = startPos,
        tmpStr = tArea.value
      // filter:
      if (!emoji.data) {
        return
      }
      // insert:
      self.txtContent = this.$attrs.element.data.message
      self.txtContent = tmpStr.substring(0, startPos) + emoji.data + tmpStr.substring(endPos, tmpStr.length)
      this.$attrs.element.data.message = self.txtContent
      // move cursor:
      setTimeout(() => {
        tArea.selectionStart = tArea.selectionEnd = cursorPos + emoji.data.length
      }, 10)
    },
    onInsertSelectVariable (variable) {
      console.log('onInsertSelectVariable', variable)
      const self = this
      var tArea = this.$refs.inputEnvioMensagem
      // get cursor's position:
      var startPos = tArea.selectionStart,
        endPos = tArea.selectionEnd,
        cursorPos = startPos,
        tmpStr = tArea.value
      // filter:
      if (!variable) {
        return
      }
      // insert:
      self.txtContent = this.$attrs.element.data.message
      self.txtContent = tmpStr.substring(0, startPos) + variable + tmpStr.substring(endPos, tmpStr.length)
      this.$attrs.element.data.message = self.txtContent
      // move cursor:
      setTimeout(() => {
        tArea.selectionStart = tArea.selectionEnd = cursorPos + 1
      }, 10)
    },
    addOption () {
      if (this.newOption.trim()) {
        if (!this.$attrs.element.data.options) {
          this.$set(this.$attrs.element.data, 'options', [])
        }
        this.$attrs.element.data.options.push(this.newOption.trim())
        this.updateMessageWithOptions()
        this.newOption = ''
      }
    },
    removeOption (index) {
      if (Array.isArray(this.$attrs.element.data.options)) {
        this.$attrs.element.data.options.splice(index, 1)
        this.updateMessageWithOptions()
      }
    },
    updateMessageWithOptions () {
      if (!this.$attrs.element.data.options || this.$attrs.element.data.options.length === 0) return

      let message = this.$attrs.element.data.message || ''

      // Remover qualquer lista de opções e texto de instruções existente
      const optionPatterns = [
        /\n\n\*Opções disponíveis:\*\n([\s\S]*?)(\n_Digite o número ou o texto da opção desejada_)?$/,
        /^\*Opções disponíveis:\*\n([\s\S]*?)(\n_Digite o número ou o texto da opção desejada_)?$/
      ]

      for (const pattern of optionPatterns) {
        message = message.replace(pattern, '')
      }

      // Limpar linhas em branco extras ao final
      message = message.replace(/\n+$/, '')

      // Adicionar uma quebra de linha se a mensagem não terminar com uma
      if (message && !message.endsWith('\n')) {
        message += '\n'
      }

      // Adicionar uma linha em branco antes das opções se houver mensagem
      if (message) {
        message += '\n'
      }

      // Adicionar as opções numeradas
      message += '*Opções disponíveis:*\n'
      this.$attrs.element.data.options.forEach((option, index) => {
        message += `${index + 1}️⃣ *${option}*\n`
      })
      message += '\n_Digite o número ou o texto da opção desejada_'

      this.$attrs.element.data.message = message
    },
    validateDelay (value) {
      if (value < 0) {
        this.$attrs.element.data.delay = 0
      } else if (value > 10000) {
        this.$attrs.element.data.delay = 10000
      }
    },
    extrairOpcoesDoTexto () {
      const texto = this.$attrs.element.data.message || ''
      if (!texto.trim()) {
        this.$q.notify({
          type: 'warning',
          message: 'Digite uma mensagem antes de extrair opções',
          position: 'top',
          timeout: 2000
        })
        return
      }

      // Array para armazenar as opções encontradas
      const opcoesEncontradas = []

      // Buscar por diferentes padrões de listas

      // Padrão 1: Linhas que começam com número seguido de ponto ou parêntese
      // Ex: 1. Opção Um, 2. Opção Dois, (1) Opção Um, etc.
      const padraoNumerado = /^\s*(?:\d+[.)]|\(\d+\))\s*(.*?)$/gm
      let match
      while ((match = padraoNumerado.exec(texto)) !== null) {
        if (match[1] && match[1].trim()) {
          opcoesEncontradas.push(match[1].trim())
        }
      }

      // Padrão 2: Linhas que começam com marcadores
      // Ex: - Opção Um, * Opção Dois, • Opção Três, etc.
      const padraoMarcadores = /^\s*[-*•]\s*(.*?)$/gm
      while ((match = padraoMarcadores.exec(texto)) !== null) {
        if (match[1] && match[1].trim()) {
          opcoesEncontradas.push(match[1].trim())
        }
      }

      // Padrão 3: Buscar por Opção 1:, Opção 2:, etc.
      const padraoOpcaoExplicita = /\b(?:opção|opcao|option)\s*(?:\d+|[a-z])[:]?\s*(.*?)(?:\n|$)/gmi
      while ((match = padraoOpcaoExplicita.exec(texto)) !== null) {
        if (match[1] && match[1].trim()) {
          opcoesEncontradas.push(match[1].trim())
        }
      }

      // Remover duplicatas
      const opcoesUnicas = [...new Set(opcoesEncontradas)]

      // Se encontrou opções, adiciona ao array de opções
      if (opcoesUnicas.length > 0) {
        // Limpar opções existentes
        if (!this.$attrs.element.data.options) {
          this.$set(this.$attrs.element.data, 'options', [])
        } else {
          this.$attrs.element.data.options = []
        }

        // Adicionar novas opções
        opcoesUnicas.forEach(opcao => {
          this.$attrs.element.data.options.push(opcao)
        })

        // Atualizar a mensagem com as opções
        this.updateMessageWithOptions()

        this.$q.notify({
          type: 'positive',
          message: `${opcoesUnicas.length} opções encontradas e adicionadas automaticamente`,
          position: 'top',
          timeout: 2000
        })
      } else {
        this.$q.notify({
          type: 'warning',
          message: 'Nenhuma opção encontrada no texto',
          position: 'top',
          timeout: 2000
        })
      }
    },
    limparTodasOpcoes () {
      // Confirmar antes de limpar
      this.$q.dialog({
        title: 'Atenção',
        message: 'Deseja realmente remover todas as opções?',
        cancel: {
          label: 'Não',
          color: 'primary',
          flat: true
        },
        ok: {
          label: 'Sim',
          color: 'negative',
          flat: true
        },
        persistent: true
      }).onOk(() => {
        this.$attrs.element.data.options = []

        // Limpar a parte de opções da mensagem
        let message = this.$attrs.element.data.message || ''

        // Remover qualquer lista de opções e texto de instruções existente
        const optionPatterns = [
          /\n\n\*Opções disponíveis:\*\n([\s\S]*?)(\n_Digite o número ou o texto da opção desejada_)?$/,
          /^\*Opções disponíveis:\*\n([\s\S]*?)(\n_Digite o número ou o texto da opção desejada_)?$/
        ]

        for (const pattern of optionPatterns) {
          message = message.replace(pattern, '')
        }

        // Limpar linhas em branco extras ao final
        message = message.replace(/\n+$/, '')

        this.$attrs.element.data.message = message

        this.$q.notify({
          type: 'positive',
          message: 'Todas as opções foram removidas',
          position: 'top',
          timeout: 2000
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
