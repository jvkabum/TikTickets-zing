<template>
  <q-dialog
    :model-value="modalWhatsapp"
    @hide="fecharModal"
    @show="abrirModal"
    persistent
  >
    <q-card
      class="q-pa-md"
      style="width: 500px"
    >
      <q-card-section>
        <div class="text-h6">
          <q-icon
            size="50px"
            class="q-mr-md"
            :name="whatsapp.type ? `img:${whatsapp.type}-logo.png` : 'mdi-alert'"
          />
          {{ whatsAppEdit.id ? 'Editar' : 'Adicionar' }}
          Canal
        </div>
      </q-card-section>
      <q-card-section>
        <div class="row">
          <div class="col-12 q-my-sm">
            <q-select
              :disable="!!whatsAppEdit.id"
              v-model="whatsapp.type"
              :options="optionsWhatsappsTypes"
              label="Tipo"
              emit-value
              map-options
              outlined
              rounded
              dense
            />
          </div>
          <div class="col-12">
            <q-input
              outlined
              rounded
              label="Nome"
              dense
              v-model="whatsapp.name"
              v-bind="nameProps"
              :error="!!errors.name"
              :error-message="errors.name"
            />
          </div>

          <div
            class="col-12 q-mt-md"
            v-if="whatsapp.type === 'telegram'"
          >
            <q-input
              outlined
              dense
              label="Token Telegram"
              rounded
              v-model="whatsapp.tokenTelegram"
            />
          </div>
          <div
            class="q-mt-md row full-width justify-center"
            v-if="whatsapp.type === 'instagram'"
          >
            <div class="col">
              <fieldset class="full-width q-pa-md rounded-all">
                <legend>Dados da conta do Instagram</legend>
                <div
                  class="col-12 q-mb-md"
                  v-if="whatsapp.type === 'instagram'"
                >
                  <q-input
                    outlined
                    dense
                    rounded
                    label="Usuário"
                    v-model="whatsapp.instagramUser"
                    hint="Seu usuário do Instagram (sem @)"
                  />
                </div>
                <div
                  v-if="whatsapp.type === 'instagram' && !isEdit"
                  class="text-center"
                >
                  <q-btn
                    color="positive"
                    icon="edit"
                    label="Nova senha"
                    rounded
                    @click="isEdit = !isEdit"
                  >
                    <q-tooltip> Alterar senha </q-tooltip>
                  </q-btn>
                </div>
                <div
                  class="col-12"
                  v-if="whatsapp.type === 'instagram' && isEdit"
                >
                  <q-input
                    outlined
                    rounded
                    label="Senha"
                    dense
                    :type="isPwd ? 'password' : 'text'"
                    v-model="whatsapp.instagramKey"
                    hint="Senha utilizada para logar no Instagram"
                    placeholder="*************"
                    :disable="!isEdit"
                  >
                    <template v-slot:after>
                      <q-btn
                        class="bg-padrao"
                        round
                        flat
                        color="negative"
                        icon="mdi-close"
                        @click="isEdit = !isEdit"
                      >
                        <q-tooltip> Cancelar alteração de senha </q-tooltip>
                      </q-btn>
                    </template>
                    <template v-slot:append>
                      <q-icon
                        :name="isPwd ? 'visibility_off' : 'visibility'"
                        class="cursor-pointer"
                        @click="isPwd = !isPwd"
                      />
                    </template>
                  </q-input>
                </div>
              </fieldset>
            </div>
          </div>
        </div>

        <div class="row q-my-md">
          <div class="col-12 relative-position">
            <label class="text-caption">Mensagem Despedida: </label>
            <textarea
              ref="inputFarewellMessage"
              style="min-height: 15vh; max-height: 15vh"
              class="q-pa-sm rounded-all bg-white full-width border-quasar"
              placeholder="Digite a mensagem"
              v-model="whatsapp.farewellMessage"
            >
            </textarea>
            <div class="absolute-top-right q-pa-xs">
              <q-btn
                rounded
                dense
                flat
                color="black"
              >
                <q-icon
                  size="1.5em"
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
              <q-btn
                rounded
                dense
                flat
                color="black"
              >
                <q-icon
                  size="1.5em"
                  name="mdi-variable"
                />
                <q-tooltip> Variáveis </q-tooltip>
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
          </div>
        </div>
      </q-card-section>
      <q-card-actions
        align="center"
        class="q-mt-md"
      >
        <q-btn
          rounded
          label="Sair"
          class="q-px-md q-mr-lg"
          color="negative"
          v-close-popup
        />
        <q-btn
          label="Salvar"
          color="positive"
          rounded
          class="q-px-md"
          @click="handleSave"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { toTypedSchema } from '@vee-validate/zod'
import EmojiPicker from 'vue3-emoji-picker'
import 'vue3-emoji-picker/css'
import { z } from 'zod'

const props = defineProps({
  modalWhatsapp: {
    type: Boolean,
    default: false
  },
  whatsAppEdit: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modalWhatsapp', 'update:whatsAppEdit', 'recarregar-lista'])

const $q = useQuasar()
const { saveWhatsapp } = useSessoesWhatsapp()

const isPwd = ref(true)
const isEdit = ref(false)
const inputFarewellMessage = ref(null)

const validationSchema = toTypedSchema(
  z.object({
    name: z.string().min(3, 'Mínimo 3 caracteres').max(50, 'Máximo 50 caracteres'),
    type: z.string(),
    tokenTelegram: z.string().optional(),
    instagramUser: z.string().optional(),
    instagramKey: z.string().optional(),
    farewellMessage: z.string().optional()
  })
)

const { handleSubmit, errors, defineField, setValues, resetForm } = useForm({
  validationSchema,
  initialValues: {
    name: '',
    type: 'whatsapp',
    tokenTelegram: '',
    instagramUser: '',
    instagramKey: '',
    farewellMessage: ''
  }
})

const [name, nameProps] = defineField('name')
const [type] = defineField('type')
const [tokenTelegram] = defineField('tokenTelegram')
const [instagramUser] = defineField('instagramUser')
const [instagramKey] = defineField('instagramKey')
const [farewellMessage] = defineField('farewellMessage')

// Reactive object for binding other fields not explicitly validated or needed in initialValues
const whatsapp = reactive({
  name,
  type,
  tokenTelegram,
  instagramUser,
  instagramKey,
  farewellMessage
})

const optionsWhatsappsTypes = [
  { label: 'Whatsapp', value: 'whatsapp' },
  { label: 'Telegram', value: 'telegram' }
]

const variaveis = [
  { label: 'Nome', value: '{{name}}' },
  { label: 'Saudação', value: '{{greeting}}' },
  { label: 'Protocolo', value: '{{protocol}}' }
]

const onInsertSelectEmoji = emoji => {
  const tArea = inputFarewellMessage.value
  if (!tArea || !emoji.i) return

  const startPos = tArea.selectionStart
  const endPos = tArea.selectionEnd
  const tmpStr = tArea.value

  const newText = tmpStr.substring(0, startPos) + emoji.i + tmpStr.substring(endPos)
  setValues({ farewellMessage: newText })

  nextTick(() => {
    tArea.selectionStart = tArea.selectionEnd = startPos + emoji.i.length
    tArea.focus()
  })
}

const onInsertSelectVariable = variable => {
  const tArea = inputFarewellMessage.value
  if (!tArea || !variable) return

  const startPos = tArea.selectionStart
  const endPos = tArea.selectionEnd
  const tmpStr = tArea.value

  const newText = tmpStr.substring(0, startPos) + variable + tmpStr.substring(endPos)
  setValues({ farewellMessage: newText })

  nextTick(() => {
    tArea.selectionStart = tArea.selectionEnd = startPos + variable.length
    tArea.focus()
  })
}

const fecharModal = () => {
  resetForm()
  emit('update:whatsAppEdit', {})
  emit('update:modalWhatsapp', false)
}

const abrirModal = () => {
  if (props.whatsAppEdit.id) {
    setValues({
      name: props.whatsAppEdit.name || '',
      type: props.whatsAppEdit.type || 'whatsapp',
      tokenTelegram: props.whatsAppEdit.tokenTelegram || '',
      instagramUser: props.whatsAppEdit.instagramUser || '',
      instagramKey: props.whatsAppEdit.instagramKey || '',
      farewellMessage: props.whatsAppEdit.farewellMessage || ''
    })
  } else {
    resetForm()
  }
}

const handleSave = handleSubmit(async values => {
  const success = await saveWhatsapp({
    ...values,
    id: props.whatsAppEdit.id
  })

  if (success) {
    fecharModal()
  }
})
</script>

<style lang="scss" scoped>
.border-quasar {
  border: 1px solid rgba(0, 0, 0, 0.24);
  border-radius: 4px;
  outline: none;
  transition: border-color 0.3s;
  &:focus {
    border-color: var(--q-primary);
  }
}
</style>
