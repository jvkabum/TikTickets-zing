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
          </div>
          <textarea
            ref="inputEnvioMensagem"
            style="min-height: 10vh; max-height: 15vh; flex: auto"
            class="q-pa-sm bg-white"
            placeholder="Digite a mensagem"
            v-model="element.data.message"
          />
        </div>
        <div class="row col q-py-sm q-mb-md">
          <q-select
            v-model="element.data.values"
            use-input
            outlined
            use-chips
            multiple
            color="primary"
            hide-dropdown-icon
            input-debounce="0"
            new-value-mode="add-unique"
            class="full-width"
            label="Opções"
            filled
            dense
            hint="Opções serão tratados como Lista/Botões ou texto simples dependendo do suporte do canal de destino."
          />
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import EmojiPicker from 'vue3-emoji-picker'
import 'vue3-emoji-picker/css'

const props = defineProps({
  element: {
    type: Object,
    required: true
  }
})

const inputEnvioMensagem = ref(null)

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
</script>

<style lang="scss" scoped></style>
