<template>
  <div class="row items-center q-pt-none">
    <label class="text-heading text-bold">{{ label }}</label>
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
            @select="onSelectEmoji"
          />
        </q-menu>
      </q-btn>
    </div>
    <div class="col-xs-3 col-sm-2 col-md-1">
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
          <q-list dense>
            <q-item
              v-for="(variavel, index) in variaveis"
              :key="index"
              clickable
              @click="onInsertVariable(variavel.value)"
            >
              <q-item-section>{{ variavel.label }}</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </div>
    <div class="col-xs-8 col-sm-10 col-md-11 q-pl-sm">
      <textarea
        ref="inputRef"
        style="min-height: 12.5vh; max-height: 12.5vh"
        class="q-pa-sm bg-white full-width rounded-all"
        :placeholder="placeholder"
        :value="modelValue"
        @input="onInput"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import EmojiPicker from 'vue3-emoji-picker'
import 'vue3-emoji-picker/css'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: 'Mensagem'
  },
  placeholder: {
    type: String,
    default: 'Digite a mensagem'
  },
  variaveis: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue'])

const inputRef = ref(null)

const onInput = (event) => {
  emit('update:modelValue', event.target.value)
}

const insertAtCursor = (text) => {
  const input = inputRef.value
  if (!input) return

  const start = input.selectionStart
  const end = input.selectionEnd
  const currentValue = props.modelValue || ''

  const newValue = currentValue.substring(0, start) + text + currentValue.substring(end)
  
  emit('update:modelValue', newValue)

  // Restaurar foco e posição do cursor após atualização
  setTimeout(() => {
    input.focus()
    input.setSelectionRange(start + text.length, start + text.length)
  }, 0)
}

const onSelectEmoji = (emoji) => {
  insertAtCursor(emoji.i)
}

const onInsertVariable = (variable) => {
  insertAtCursor(variable)
}
</script>

<style scoped>
textarea {
  resize: none;
  border: 1px solid #ddd;
  transition: border-color 0.3s;
}
textarea:focus {
  border-color: var(--q-primary);
  outline: none;
}
</style>
