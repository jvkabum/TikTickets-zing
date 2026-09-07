<template>
  <q-btn
    flat
    dense
    :round="round"
    :icon="icon"
    :class="btnClass"
    :color="color"
  >
    <q-tooltip>{{ tooltip }}</q-tooltip>
    <q-menu
      anchor="top left"
      self="bottom left"
      :offset="[0, 15]"
      style="z-index: 9999"
      @show="onShow"
      @hide="onHide"
    >
      <div
        :style="{ width: width, height: height, contain: 'strict', overflow: 'hidden', willChange: 'contents', transform: 'translateZ(0)' }"
        class="row items-center justify-center relative-position"
      >
        <q-spinner
          v-if="!showEmojiPicker"
          color="primary"
          size="3em"
        />
        <keep-alive>
          <EmojiPicker
            v-if="showEmojiPicker"
            :native="true"
            :theme="theme"
            :hide-search="hideSearch"
            :emojis-by-row="emojisByRow"
            @select="onSelect"
            :style="{ width: width, height: height }"
          />
        </keep-alive>
      </div>
    </q-menu>
  </q-btn>
</template>

<script setup>
import EmojiPicker from 'vue3-emoji-picker'
import 'vue3-emoji-picker/css'
import { ref } from 'vue'

defineProps({
  icon: { type: String, default: 'mdi-emoticon-happy-outline' },
  tooltip: { type: String, default: 'Emojis' },
  round: { type: Boolean, default: true },
  btnClass: { type: String, default: 'btn-rounded' },
  color: { type: String, default: '' },
  // Props do Picker
  width: { type: String, default: '350px' },
  height: { type: String, default: '450px' },
  theme: { type: String, default: 'light' },
  hideSearch: { type: Boolean, default: true },
  emojisByRow: { type: Number, default: 10 }
})


const emit = defineEmits(['select'])
const showEmojiPicker = ref(false)
const hasLoaded = ref(false)

const onShow = () => {
  if (hasLoaded.value) {
    // Se já carregou antes, mostra mais rápido (mas ainda nextTick para não bloquear render do menu)
    requestAnimationFrame(() => {
      showEmojiPicker.value = true
    })
  } else {
    // Primeira vez: espera animação completa do menu para evitar jank
    setTimeout(() => {
      requestAnimationFrame(() => {
        showEmojiPicker.value = true
        hasLoaded.value = true
      })
    }, 350)
  }
}

const onHide = () => {
  // Não resetamos hasLoaded, mantendo o "cache" lógico
  showEmojiPicker.value = false
}

const onSelect = (emoji) => {
  emit('select', emoji)
}
</script>
