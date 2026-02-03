<template>
  <div class="row items-start no-wrap full-width q-pa-sm">
    <!-- Coluna de Ações à Esquerda -->
    <div class="column q-gutter-sm items-center q-pr-md" style="width: 50px">
      <EmojiPickerComponent
        height="400px"
        @select="onSelectEmoji"
      />
      
      <q-btn
        round
        flat
        dense
        color="primary"
        icon="mdi-variable"
      >
        <q-tooltip>Variáveis</q-tooltip>
        <q-menu touch-position>
          <q-list dense style="min-width: 150px">
            <q-item
              v-for="(variavel, index) in variaveis"
              :key="index"
              clickable
              v-close-popup
              @click="onInsertVariable(variavel.value)"
            >
              <q-item-section>{{ variavel.label }}</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>

      <q-btn
        round
        flat
        dense
        color="primary"
        icon="mdi-paperclip"
        @click="triggerFilePicker"
      >
        <q-tooltip>Anexar Mídia</q-tooltip>
      </q-btn>
      <input
        type="file"
        ref="fileInput"
        style="display: none"
        @change="handleFileChange"
        accept=".jpg, .png, image/jpeg, .pdf, .doc, .docx, .mp4, .xls, .xlsx, .jpeg, .zip, .ppt, .pptx, image/*"
      />
    </div>

    <!-- Campo de Texto -->
    <div class="col-grow">
      <q-input
        ref="inputRef"
        :model-value="modelValue"
        @update:model-value="val => emit('update:modelValue', val)"
        type="textarea"
        filled
        autogrow
        :placeholder="placeholder"
        class="full-width rounded-all box-shadow-small"
        style="min-height: 120px"
        :error="error"
        :error-message="errorMessage"
      >
        <template v-if="media" v-slot:append>
          <div class="column items-end justify-center full-height q-pr-xs">
            <q-chip
              removable
              @remove="handleRemoveMedia"
              color="primary"
              text-color="white"
              dense
              outline
              class="q-ma-none shadow-1"
              style="max-width: 160px"
            >
              <q-icon name="mdi-attachment" class="q-mr-xs" />
              <div class="ellipsis">{{ cMediaName }}</div>
            </q-chip>
          </div>
        </template>
      </q-input>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import EmojiPickerComponent from "src/components/EmojiPickerComponent.vue";
import useEmoji from "src/composables/useEmoji";

const props = defineProps({
  modelValue: {
    type: String,
    default: ""
  },
  media: {
    type: [Object, File, String],
    default: null
  },
  label: {
    type: String,
    default: "Mensagem"
  },
  placeholder: {
    type: String,
    default: "Digite a mensagem"
  },
  variaveis: {
    type: Array,
    default: () => []
  },
  error: {
    type: Boolean,
    default: false
  },
  errorMessage: {
    type: String,
    default: ""
  }
});

const emit = defineEmits(["update:modelValue", "update:media"]);

const inputRef = ref(null);
const fileInput = ref(null);

const triggerFilePicker = () => {
  if (fileInput.value) {
    fileInput.value.click();
  }
};

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    emit("update:media", file);
  }
  // Reset input for same file selection
  event.target.value = "";
};

const handleRemoveMedia = () => {
  emit("update:media", null);
};

const cMediaName = computed(() => {
  if (!props.media) return "";
  if (props.media instanceof File) return props.media.name;
  if (typeof props.media === "string") {
    const split = props.media.split("/");
    return split[split.length - 1];
  }
  return "Arquivo selecionado";
});

const insertAtCursor = (text) => {
  const qInput = inputRef.value;
  if (!qInput) return;

  const el = qInput.nativeEl || (qInput.$refs && qInput.$refs.input);
  if (!el) return;

  const start = el.selectionStart || 0;
  const end = el.selectionEnd || 0;
  const currentValue = props.modelValue || "";

  const newValue =
    currentValue.substring(0, start) + text + currentValue.substring(end);

  emit("update:modelValue", newValue);

  // Restaurar foco e posição do cursor após atualização
  setTimeout(() => {
    el.focus();
    el.setSelectionRange(start + text.length, start + text.length);
  }, 0);
};

const { insertEmoji } = useEmoji();

const onSelectEmoji = (emoji) => {
  insertEmoji(
    emoji,
    inputRef.value,
    props.modelValue,
    (val) => emit("update:modelValue", val)
  );
};

const onInsertVariable = (variable) => {
  insertAtCursor(variable);
};
</script>

<style scoped>
:deep(.q-field--filled .q-field__control) {
  background: rgba(255, 255, 255, 0.4) !important;
  backdrop-filter: blur(4px);
  border-radius: 12px !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  transition: all 0.3s ease;
}

:deep(.q-field--filled.q-field--focused .q-field__control) {
  background: rgba(255, 255, 255, 0.6) !important;
  border-color: var(--q-primary) !important;
  box-shadow: 0 0 10px rgba(var(--q-primary), 0.1);
}

body.body--dark :deep(.q-field--filled .q-field__control) {
  background: rgba(15, 23, 42, 0.3) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}

body.body--dark :deep(.q-field--filled.q-field--focused .q-field__control) {
  background: rgba(15, 23, 42, 0.5) !important;
}

.box-shadow-small {
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
</style>
