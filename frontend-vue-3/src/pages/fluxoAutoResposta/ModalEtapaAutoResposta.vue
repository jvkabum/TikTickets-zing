<template>
  <q-dialog
    persistent
    :value="modalEtapaAutoResposta"
    @hide="fecharModal"
    @show="abrirModal"
  >
    <q-card
      style="width: 600px"
      class="q-pa-lg"
    >
      <q-card-section>
        <div class="text-caption">Auto Resposta: {{ autoReply.name }}</div>
        <div class="text-h6">
          {{ etapaAutoRespostaEdicao.id ? 'Editar' : 'Criar' }} Etapa
          {{ etapaAutoRespostaEdicao.id ? `(ID: ${etapaAutoRespostaEdicao.id})` : '' }}
        </div>
      </q-card-section>
      <q-card-section class="q-pa-none">
        <div class="row items-center">
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
            <label class="text-caption">Mensagem da Etapa:</label>
            <div class="row col q-mt-md">
              <q-input
                class="full-width"
                square
                outlined
                v-model="reply"
                v-bind="replyProps"
                type="textarea"
                label="Mensagem de retorno"
                :error="!!errors.reply"
                :error-message="errors.reply"
              />
            </div>
          </div>
        </div>
        <div class="row col q-mt-md">
          <q-checkbox
            v-model="initialStep"
            v-bind="initialStepProps"
            label="Etapa Inicial"
          />
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
          @click="handleEtapaAutoResposta"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { toTypedSchema } from '@vee-validate/zod'
import { useAutoRespostaStore } from 'src/stores/useAutoRespostaStore'
import { useForm } from 'vee-validate'
import { reactive } from 'vue'
import EmojiPicker from 'vue3-emoji-picker'
import 'vue3-emoji-picker/css'
import { z } from 'zod'

const props = defineProps({
  modalEtapaAutoResposta: {
    type: Boolean,
    default: false
  },
  etapaAutoRespostaEdicao: {
    type: Object,
    default: () => ({ id: null })
  },
  autoReply: {
    type: Object,
    default: () => ({ id: null })
  }
})

const emit = defineEmits(['update:modalEtapaAutoResposta', 'update:etapaAutoRespostaEdicao'])

const $q = useQuasar()

const autoRespostaStore = useAutoRespostaStore()
const { criarEtapa, editarEtapa } = autoRespostaStore

const validationSchema = toTypedSchema(
  z.object({
    reply: z.string().min(1, 'Mensagem de retorno é obrigatória'),
    initialStep: z.boolean().optional()
  })
)

const { handleSubmit, errors, defineField, setValues, resetForm } = useForm({
  validationSchema,
  initialValues: {
    reply: '',
    initialStep: false
  }
})

const [reply, replyProps] = defineField('reply')
const [initialStep, initialStepProps] = defineField('initialStep')

const etapa = reactive({
  id: null
})

const onInsertSelectEmoji = emoji => {
  if (!emoji.i) return
  // Insert emoji at end or replace specific logic if user wants cursor insertion.
  // Implementing simple append for now or standard cursor logic if possible.
  // Since VeeValidate v-model is bound, we update `reply` value.
  const currentText = reply.value || ''
  reply.value = currentText + emoji.i
}

const fecharModal = () => {
  resetForm()
  etapa.id = null
  emit('update:etapaAutoRespostaEdicao', { id: null })
  emit('update:modalEtapaAutoResposta', false)
}

const abrirModal = () => {
  if (props.etapaAutoRespostaEdicao.id) {
    etapa.id = props.etapaAutoRespostaEdicao.id
    setValues({
      reply: props.etapaAutoRespostaEdicao.reply,
      initialStep: props.etapaAutoRespostaEdicao.initialStep
    })
  } else {
    resetForm()
    etapa.id = null
  }
}

const verificarEtapaInicial = dataParams => {
  // Check in store usually, but here we check the props passed usually populated.
  // The prop `autoReply` has the steps.
  const isInitialExists = props.autoReply.stepsReply
    ? props.autoReply.stepsReply.find(s => s.initialStep && s.id !== dataParams.id)
    : null

  if (isInitialExists && dataParams.initialStep) {
    $q.notify({
      type: 'negative',
      progress: true,
      timeout: 10000,
      position: 'top',
      closeBtn: true,
      actions: [{ icon: 'close', round: true, color: 'white' }],
      message: `Cada Auto Resposta poderá ter apenas uma etapa inicial. A etapa de "ID: ${isInitialExists.id}" já é a inicial.`
    })
    throw new Error('Etapa Inicial duplicada')
  }
}

const handleEtapaAutoResposta = handleSubmit(async values => {
  const dataToSave = {
    ...values,
    id: etapa.id,
    idAutoReply: props.autoReply.id
  }

  try {
    verificarEtapaInicial(dataToSave)
    if (etapa.id) {
      await editarEtapa(dataToSave)
    } else {
      await criarEtapa(dataToSave)
    }
    fecharModal()
  } catch (error) {
    console.error(error)
  }
})
</script>

<style lang="scss" scoped></style>
