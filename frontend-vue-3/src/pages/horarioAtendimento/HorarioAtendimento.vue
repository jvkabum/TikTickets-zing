<template>
  <div v-if="userProfile === 'admin'">
    <q-card
      class="q-ma-sm"
      square
    >
      <div class="text-h5 q-pa-sm q-ma-sm">
        Horário de Atendimento
        <q-icon name="help">
          <q-tooltip content-class="bg-light-blue-1 text-black q-pa-sm shadow-4">
            <span class="text-weight-medium"> Tipos de horário: </span>
            <span class="row col">
              Aberto: Estabelecimento aberto durante todo o dia. Não será feito envio de mensagem de ausência;
            </span>
            <span class="row col">
              Fechado: Estabelecimento fechado durante todo o dia. Será feito envio de mensagem de ausência,
              independente do horário;
            </span>
            <span class="row col">
              Horário: Representa o horário de funcionamento do estabelecimento. O sistema enviará mensagem de ausênica
              quando mensagens forem recebidas fora dos horários estabelecidos.
            </span>
            <span class="row col">
              **Importante: A mensagem de ausência será enviada após o encerramento do atendimento automático.
            </span>
          </q-tooltip>
        </q-icon>

        <q-btn
          rounded
          color="positive"
          label="Salvar"
          class="float-right"
          @click="salvarHorariosAtendimento"
        />
      </div>
      <q-separator />
      <q-card-section>
        <div class="row q-col-gutter-sm">
          <div
            class="col-xs-12 col-sm-4 q-mt-sm"
            v-for="dia in businessHours"
            :key="dia.value"
          >
            <q-card
              square
              bordered
              flat
            >
              <div class="text-body1 text-bold bg-grey-3 q-pa-xs q-pl-sm">
                {{ dia.label }}
              </div>
              <q-separator />
              <q-card-section class="q-pt-none">
                <q-option-group
                  inline
                  class="row justify-between q-mb-md"
                  v-model="dia.type"
                  :options="optType"
                  color="primary"
                />

                <div class="row items-baseline q-gutter-sm">
                  <q-input
                    :disable="dia.type !== 'H'"
                    dense
                    rounded
                    outlined
                    class="col-grow"
                    error-message="Obrigatório"
                    hide-underline
                    type="time"
                    v-model="dia.hr1"
                  />
                  <h6>às</h6>
                  <q-input
                    :disable="dia.type !== 'H'"
                    dense
                    rounded
                    outlined
                    class="col-grow"
                    error-message="Obrigatório"
                    hide-underline
                    type="time"
                    v-model="dia.hr2"
                  />
                </div>
                <div class="row items-baseline q-gutter-sm">
                  <q-input
                    :disable="dia.type !== 'H'"
                    dense
                    rounded
                    outlined
                    class="col-grow"
                    error-message="Obrigatório"
                    hide-underline
                    type="time"
                    v-model="dia.hr3"
                  />
                  <h6>às</h6>
                  <q-input
                    :disable="dia.type !== 'H'"
                    dense
                    outlined
                    rounded
                    class="col-grow"
                    error-message="Obrigatório"
                    hide-underline
                    type="time"
                    v-model="dia.hr4"
                  />
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-card-section>
    </q-card>
    <q-card class="q-ma-sm q-mt-md full-full-height">
      <div class="text-h6 q-pa-sm q-ma-sm">
        Mensagem de Ausência
        <q-btn
          color="positive"
          label="Salvar"
          rounded
          class="float-right"
          @click="salvarMensagemAusencia"
        />
      </div>
      <q-card-section class="q-pt-none">
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
            <q-btn
              round
              flat
              dense
            >
              <q-icon
                size="2em"
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
          <div class="col-xs-8 col-sm-10 col-md-11 q-pl-sm">
            <textarea
              ref="inputEnvioMensagem"
              style="min-height: 9vh; max-height: 9vh"
              class="q-pa-sm bg-white rounded-all full-width"
              placeholder="Digite a mensagem"
              autogrow
              dense
              outlined
              @input="v => (messageBusinessHours = v.target.value)"
              :value="messageBusinessHours"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useHorarioAtendimentoStore } from 'src/stores/useHorarioAtendimentoStore'
import { nextTick, onMounted, ref } from 'vue'
import EmojiPicker from 'vue3-emoji-picker'
import 'vue3-emoji-picker/css'

const horarioAtendimentoStore = useHorarioAtendimentoStore()
const { listarHorariosAtendimento, atualizarHorariosAtendimento, atualizarMensagemAusencia } = horarioAtendimentoStore
const { businessHours, messageBusinessHours } = storeToRefs(horarioAtendimentoStore)

const userProfile = ref('user')
const inputEnvioMensagem = ref(null)

const optType = [
  { value: 'O', label: 'Aberto' },
  { value: 'C', label: 'Fechado' },
  { value: 'H', label: 'Horário' }
]

const variaveis = [
  { label: 'Nome', value: '{{name}}' },
  { label: 'Saudação', value: '{{greeting}}' }
]

const salvarHorariosAtendimento = async () => {
  await atualizarHorariosAtendimento(businessHours.value)
}

const salvarMensagemAusencia = async () => {
  await atualizarMensagemAusencia(messageBusinessHours.value)
}

const onInsertSelectEmoji = emoji => {
  const tArea = inputEnvioMensagem.value
  if (!tArea || !emoji.data) return

  const startPos = tArea.selectionStart
  const endPos = tArea.selectionEnd
  const tmpStr = messageBusinessHours.value || ''

  messageBusinessHours.value = tmpStr.substring(0, startPos) + emoji.data + tmpStr.substring(endPos)

  nextTick(() => {
    tArea.selectionStart = tArea.selectionEnd = startPos + emoji.data.length
    tArea.focus()
  })
}

const onInsertSelectVariable = variable => {
  const tArea = inputEnvioMensagem.value
  if (!tArea || !variable) return

  const startPos = tArea.selectionStart
  const endPos = tArea.selectionEnd
  const tmpStr = messageBusinessHours.value || ''

  messageBusinessHours.value = tmpStr.substring(0, startPos) + variable + tmpStr.substring(endPos)

  nextTick(() => {
    tArea.selectionStart = tArea.selectionEnd = startPos + variable.length
    tArea.focus()
  })
}

onMounted(() => {
  userProfile.value = localStorage.getItem('profile')
  listarHorariosAtendimento()
})
</script>

<style lang="scss" scoped></style>
