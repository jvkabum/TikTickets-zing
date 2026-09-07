<template>
  <q-menu
    v-model="show"
    square
    no-focus
    no-parent-event
    class="no-shadow"
    fit
    :offset="[0, 5]"
    persistent
    max-height="400px"
    :target="target"
  >
    <q-list
      separator
      v-if="filteredMessages.length"
    >
      <q-item
        v-for="resposta in filteredMessages"
        :key="resposta.key"
        clickable
        v-close-popup
        @click="emit('select', resposta)"
      >
        <q-item-section>
          <q-item-label class="text-bold">{{ resposta.key }}</q-item-label>
          <q-item-label
            caption
            lines="2"
          >{{ resposta.message }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
    <q-list v-else>
      <q-item>
        <q-item-section>
          <q-item-label class="text-negative">Nada por aqui!</q-item-label>
          <q-item-label caption>Cadastre mensagens rápidas na administração.</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-menu>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  messages: {
    type: Array,
    default: () => []
  },
  searchText: {
    type: String,
    default: ''
  },
  target: {
    type: [Object, String],
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'select'])

const show = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})

const filteredMessages = computed(() => {
  let search = props.searchText.toLowerCase()
  if (search.startsWith('/')) search = search.substring(1)
  return !search
    ? props.messages
    : props.messages.filter(r => r.key.toLowerCase().includes(search))
})
</script>
