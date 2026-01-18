<template>
  <q-dialog
    :value="modalAcaoEtapa"
    @hide="fecharModal"
    @show="abrirModal"
    persistent
    position="top"
  >
    <q-card
      style="width: 600px"
      class="q-pa-lg"
    >
      <q-card-section>
        <div class="text-h6">{{ acaoEtapaEdicao.id ? 'Editar' : 'Criar' }} Ação Etapa</div>
      </q-card-section>
      <q-card-section>
        <div class="row">
          <div class="col">
            <q-input
              dense
              square
              outlined
              v-model="words"
              v-bind="wordsProps"
              label="Chave"
              :error="!!errors.words"
              :error-message="errors.words"
            />
          </div>
        </div>
        <div class="row q-mt-md">
          <div class="col">
            <q-option-group
              inline
              v-model="action"
              v-bind="actionProps"
              :options="optionsAcao"
              color="primary"
            />
          </div>
        </div>
        <div class="row q-mt-md">
          <div class="col">
            <q-select
              v-if="action === 0"
              dense
              outlined
              class="full-width"
              v-model="nextStepId"
              v-bind="nextStepIdProps"
              :options="autoReply.stepsReply"
              option-label="id"
              option-value="id"
              label="Etapa"
              map-options
              emit-value
              clearable
              :error="!!errors.nextStepId"
              :error-message="errors.nextStepId"
            />
            <q-select
              v-if="action === 1"
              dense
              outlined
              class="full-width"
              v-model="queueId"
              v-bind="queueIdProps"
              :options="filas"
              option-label="queue"
              option-value="id"
              label="Fila"
              map-options
              emit-value
              clearable
              :error="!!errors.queueId"
              :error-message="errors.queueId"
            />
            <q-select
              v-if="action === 2"
              dense
              outlined
              class="full-width"
              v-model="userIdDestination"
              v-bind="userIdDestinationProps"
              :options="usuarios"
              option-label="name"
              option-value="id"
              label="Usuário"
              map-options
              emit-value
              clearable
              :error="!!errors.userIdDestination"
              :error-message="errors.userIdDestination"
            />
          </div>
        </div>
        <div class="row items-center q-mt-md">
          <div class="col-xs-3 col-sm-2 col-md-1">
            <q-btn
              round
              flat
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
          <div class="col-xs-8 col-sm-10 col-md-11 q-pl-sm">
            <label class="text-caption">Mensagem retorno:</label>
            <q-input
              class="full-width"
              square
              outlined
              v-model="replyDefinition"
              v-bind="replyDefinitionProps"
              type="textarea"
              label="Mensagem de retorno"
              autogrow
              dense
            />
          </div>
        </div>
      </q-card-section>
      <q-card-actions
        align="right"
        class="q-mt-md"
      >
        <q-btn
          flat
          label="Cancelar"
          color="negative"
          v-close-popup
          class="q-mr-md"
        />
        <q-btn
          flat
          label="Salvar"
          color="primary"
          @click="handleAcaoEtapa"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { toTypedSchema } from '@vee-validate/zod'
import { useAutoRespostaStore } from 'src/stores/useAutoRespostaStore'
import { useForm } from 'vee-validate'
import { reactive, watch } from 'vue'
import EmojiPicker from 'vue3-emoji-picker'
import 'vue3-emoji-picker/css'
import { z } from 'zod'

const props = defineProps({
  modalAcaoEtapa: {
    type: Boolean,
    default: false
  },
  acaoEtapaEdicao: {
    type: Object,
    default: () => ({ id: null })
  },
  etapaAutoResposta: {
    type: Object,
    default: () => ({ id: null })
  },
  filas: {
    type: Array,
    default: () => []
  },
  usuarios: {
    type: Array,
    default: () => []
  },
  autoReply: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modalAcaoEtapa', 'update:acaoEtapaEdicao'])

const autoRespostaStore = useAutoRespostaStore()
const { criarAcao, editarAcao } = autoRespostaStore

const userId = +localStorage.getItem('userId')

const validationSchema = toTypedSchema(
  z
    .object({
      words: z.string().min(1, 'Chave é obrigatória'),
      action: z.number(),
      queueId: z.number().nullable().optional(),
      userIdDestination: z.number().nullable().optional(),
      nextStepId: z.number().nullable().optional(),
      replyDefinition: z.string().nullable().optional()
    })
    .superRefine((data, ctx) => {
      if (data.action === 0 && !data.nextStepId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Selecione a etapa',
          path: ['nextStepId']
        })
      }
      if (data.action === 1 && !data.queueId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Selecione a fila',
          path: ['queueId']
        })
      }
      if (data.action === 2 && !data.userIdDestination) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Selecione o usuário',
          path: ['userIdDestination']
        })
      }
    })
)

const { handleSubmit, errors, defineField, setValues, resetForm, values } = useForm({
  validationSchema,
  initialValues: {
    words: '',
    action: 0,
    queueId: null,
    userIdDestination: null,
    nextStepId: null,
    replyDefinition: ''
  }
})

const [words, wordsProps] = defineField('words')
const [action, actionProps] = defineField('action')
const [queueId, queueIdProps] = defineField('queueId')
const [userIdDestination, userIdDestinationProps] = defineField('userIdDestination')
const [nextStepId, nextStepIdProps] = defineField('nextStepId')
const [replyDefinition, replyDefinitionProps] = defineField('replyDefinition')

const acaoEtapa = reactive({
  id: null
})

const optionsAcao = [
  { value: 0, label: 'Proxima Etapa' },
  { value: 1, label: 'Enviar para Fila' },
  { value: 2, label: 'Enviar para usuário' }
]

watch(action, () => {
  // Clear other fields when action changes?
  // But defineField is reactive, so we can manual setValues or let user clear
  // Might be good UX to clear irrelevant fields, but keeping it simple for now as original did manual clear on @input
})

// Original clear logic in template was on @input, I'll rely on user or store to handle,
// or I can add watchers:
watch(action, val => {
  if (val === 0) {
    queueId.value = null
    userIdDestination.value = null
  }
  if (val === 1) {
    nextStepId.value = null
    userIdDestination.value = null
  }
  if (val === 2) {
    nextStepId.value = null
    queueId.value = null
  }
})

const onInsertSelectEmoji = emoji => {
  if (!emoji.i) return
  const currentText = replyDefinition.value || ''
  replyDefinition.value = currentText + emoji.i
}

const fecharModal = () => {
  resetForm()
  acaoEtapa.id = null
  emit('update:acaoEtapaEdicao', { id: null })
  emit('update:modalAcaoEtapa', false)
}

const abrirModal = () => {
  if (props.acaoEtapaEdicao.id) {
    acaoEtapa.id = props.acaoEtapaEdicao.id
    setValues({
      words: props.acaoEtapaEdicao.words,
      action: props.acaoEtapaEdicao.action,
      queueId: props.acaoEtapaEdicao.queueId,
      userIdDestination: props.acaoEtapaEdicao.userIdDestination,
      nextStepId: props.acaoEtapaEdicao.nextStepId,
      replyDefinition: props.acaoEtapaEdicao.replyDefinition
    })
  } else {
    resetForm()
    acaoEtapa.id = null
  }
}

const handleAcaoEtapa = handleSubmit(async values => {
  const params = {
    ...values,
    id: acaoEtapa.id,
    userId,
    stepReplyId: props.etapaAutoResposta.id
  }

  try {
    if (params.id) {
      await editarAcao(params)
    } else {
      await criarAcao(params)
    }
    fecharModal()
  } catch (error) {
    console.error(error)
  }
})
</script>

<style lang="scss" scoped></style>
