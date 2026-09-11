<template>
  <q-dialog
    :model-value="modelValue"
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
    @update:model-value="val => $emit('update:modelValue', val)"
    persistent
  >
    <q-card class="media-editor-dialog column full-height no-scroll bg-zinc-950 text-white">
      <!-- Top Title Bar -->
      <q-bar class="bg-black text-white q-py-sm border-b-dark">
        <q-icon name="mdi-image-edit-outline" color="primary" size="22px" />
        <span class="text-weight-bold q-ml-xs text-body2">
          Editor de Mídia • {{ file ? file.name : '' }}
        </span>
        <q-space />
        <q-btn
          dense
          flat
          round
          icon="mdi-close"
          @click="handleCancel"
        >
          <q-tooltip>Cancelar</q-tooltip>
        </q-btn>
      </q-bar>

      <!-- Center Image Editor Area -->
      <div class="col overflow-hidden relative-position">
        <ImageEditor
          v-if="file"
          ref="imageEditorRef"
          :file="file"
        />
      </div>

      <!-- Bottom Actions Bar & Caption -->
      <div class="editor-bottom-bar row items-center q-px-md q-py-sm bg-black border-t-dark">
        <!-- Campo de Legenda -->
        <q-input
          v-model="caption"
          dense
          rounded
          outlined
          dark
          placeholder="Adicionar legenda para a foto..."
          class="col-grow q-mr-md"
          color="primary"
          bg-color="grey-10"
          @keydown.enter.exact.prevent="handleSend"
        >
          <template #prepend>
            <q-icon name="mdi-text" color="grey-5" />
          </template>
        </q-input>

        <!-- Botões de Ação -->
        <div class="row items-center q-gutter-x-sm">
          <q-btn
            flat
            no-caps
            label="Cancelar"
            color="grey-4"
            class="btn-rounded"
            @click="handleCancel"
          />

          <q-btn
            no-caps
            push
            rounded
            color="primary"
            class="grad-primary q-px-md"
            icon="mdi-send"
            label="Enviar agora"
            :loading="loading"
            @click="handleSend"
          />
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import ImageEditor from './ImageEditor.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  file: {
    type: File,
    default: null
  },
  initialCaption: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'send', 'cancel'])

const imageEditorRef = ref(null)
const caption = ref('')
const loading = ref(false)

watch(
  () => props.initialCaption,
  val => {
    caption.value = val || ''
  },
  { immediate: true }
)

const handleCancel = () => {
  emit('update:modelValue', false)
  emit('cancel')
}

const handleSend = async () => {
  if (!imageEditorRef.value) return
  loading.value = true
  try {
    const editedFile = await imageEditorRef.value.getEditedFile()
    emit('send', {
      editedFile,
      caption: caption.value.trim()
    })
    emit('update:modelValue', false)
  } catch (err) {
    console.error('[MediaEditorModal] Erro ao obter arquivo editado:', err)
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.media-editor-dialog {
  background-color: #09090b !important;
}

.border-b-dark {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.border-t-dark {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
