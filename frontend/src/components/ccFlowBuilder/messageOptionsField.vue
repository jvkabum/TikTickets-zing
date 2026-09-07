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
            <EmojiPickerComponent
              height="450px"
              @select="onInsertSelectEmoji"
            />
          </div>
          <q-input
            ref="inputEnvioMensagem"
            style="min-height: 10vh; flex: auto"
            class="q-pa-sm rounded-all"
            placeholder="Digite a mensagem"
            v-model="element.data.message"
            autogrow
            type="textarea"
            filled
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
import EmojiPickerComponent from 'src/components/EmojiPickerComponent.vue'
import useEmoji from 'src/composables/useEmoji'

const props = defineProps({
  element: {
    type: Object,
    required: true
  }
})

const inputEnvioMensagem = ref(null)
const { insertEmoji } = useEmoji()

const onInsertSelectEmoji = emoji => {
  insertEmoji(emoji, inputEnvioMensagem.value, props.element.data.message, val => (props.element.data.message = val))
}
</script>

<style lang="scss" scoped></style>

