<template>
  <div class="relative-position">
    <!-- Quick Messages Menu -->
    <q-menu
      v-model="visualizarMensagensRapidas"
      square
      no-focus
      no-parent-event
      class="no-shadow"
      fit
      :offset="[0, 5]"
      persistent
      max-height="400px"
    >
      <q-list
        separator
        v-if="cMensagensRapidas.length"
      >
        <q-item
          v-for="resposta in cMensagensRapidas"
          :key="resposta.key"
          clickable
          v-close-popup
          @click="mensagemRapidaSelecionada(resposta)"
        >
          <q-item-section>
            <q-item-label class="text-bold">{{ resposta.key }}</q-item-label>
            <q-item-label
              caption
              lines="2"
              >{{ resposta.message }}</q-item-label
            >
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

    <!-- Header Actions (Schedule) -->
    <div
      v-if="isScheduleDate"
      class="q-pa-sm bg-grey-1 row col-12 justify-center"
    >
      <cDateTimePick
        style="width: 300px"
        label="Data/Hora Agendamento"
        v-model="scheduleDate"
      />
    </div>

    <!-- Main Input Bar -->
    <div
      style="min-height: 80px; border-radius: 16px; border-top: 1px solid rgba(0,0,0,0.05)"
      class="row q-pb-md q-pt-sm glass justify-start items-center text-grey-9 relative-position no-wrap q-px-md"
    >
      <template v-if="!isRecordingAudio">
        <!-- Attachments & Emojis Buttons (Desktop) -->
        <div
          class="row no-wrap q-gutter-xs"
          v-if="!$q.screen.xs"
        >
          <q-btn
            flat
            dense
            icon="mdi-paperclip"
            @click="abrirEnvioArquivo"
            class="btn-rounded"
          >
            <q-tooltip>Anexar arquivo</q-tooltip>
          </q-btn>
          <q-btn
            flat
            dense
            icon="mdi-emoticon-happy-outline"
            class="btn-rounded"
          >
            <q-tooltip>Emojis</q-tooltip>
            <q-menu
              anchor="top right"
              self="bottom middle"
            >
                <!-- <EmojiPicker
                  :native="true"
                  @select="onInsertSelectEmoji"
                /> -->
            </q-menu>
          </q-btn>
          <q-btn
            flat
            dense
            icon="mdi-message-video"
            @click="handlSendLinkVideo"
            class="btn-rounded"
          >
            <q-tooltip>Videoconferência</q-tooltip>
          </q-btn>
        </div>

        <q-toggle
          v-model="sign"
          keep-color
          dense
          class="q-mx-sm"
          color="primary"
          @update:model-value="handleSign"
        >
          <q-tooltip>Assinatura {{ sign ? 'Ativa' : 'Inativa' }}</q-tooltip>
        </q-toggle>

        <!-- Preview Inline -->
        <div
          v-if="arquivos.length"
          class="col-grow row items-center q-gutter-sm bg-grey-2 q-pa-xs btn-rounded"
        >
          <q-chip
            v-for="(file, index) in arquivos"
            :key="index"
            removable
            @remove="arquivos.splice(index, 1)"
            color="primary"
            text-color="white"
            dense
          >
            {{ file.name }}
          </q-chip>
        </div>

        <!-- Text Area -->
        <q-input
          v-else
          ref="inputRef"
          v-model="textChat"
          placeholder="Digite sua mensagem"
          outlined
          dense
          rounded
          autogrow
          class="col-grow q-mx-xs"
          bg-color="grey-2"
          @keydown.enter.exact.prevent="handleEnter"
          @paste="handleInputPaste"
          input-style="max-height: 200px"
        >
          <template #append>
            <q-btn
              flat
              round
              dense
              icon="mdi-message-flash-outline"
              @click="visualizarMensagensRapidas = !visualizarMensagensRapidas"
            >
              <q-tooltip>Mensagens Rápidas</q-tooltip>
            </q-btn>
          </template>
        </q-input>

        <!-- Hidden File Picker -->
        <q-file
          ref="filePickerRef"
          v-model="arquivos"
          multiple
          append
          style="display: none"
          accept=".txt,.xml,.jpg,.png,image/jpeg,.pdf,.doc,.docx,.mp4,.ogg,.mp3,.xls,.xlsx,.jpeg,.rar,.zip,.ppt,.pptx"
          @rejected="onRejectedFiles"
        />

        <!-- Send / Mic Buttons -->
        <q-btn
          v-if="textChat || arquivos.length"
          flat
          round
          icon="mdi-send"
          color="primary"
          @click="enviarMensagem"
          :loading="loading"
        />
        <q-btn
          v-else
          flat
          round
          icon="mdi-microphone"
          @click="handleSartRecordingAudio"
        />
      </template>

      <!-- Recording State -->
      <template v-else>
        <div class="full-width flex items-center justify-between q-px-md">
          <q-btn
            flat
            round
            icon="mdi-close"
            color="negative"
            @click="handleCancelRecordingAudio"
          />
          <RecordingTimer class="text-bold" />
          <q-btn
            flat
            round
            icon="mdi-send-circle-outline"
            color="positive"
            @click="handleStopRecordingAudio"
            :loading="loading"
          />
        </div>
      </template>
    </div>

    <!-- Start Service Bar (Pending Tickets) -->
    <div
      v-if="ticketFocado.status === 'pending'"
      class="absolute-full flex flex-center bg-white z-max"
    >
      <q-btn
        push
        rounded
        color="positive"
        icon="mdi-send-circle"
        label="Aceitar atendimento"
        @click="iniciarAtendimento(ticketFocado)"
        style="width: 250px"
      />
    </div>
  </div>
</template>

<script setup>
import { notificarErro } from 'src/utils/helpersNotifications'
import { useTicketActions } from './useTicketActions'
import bus from 'src/utils/eventBus'

const props = defineProps({
  replyingMessage: { type: Object, default: null },
  mensagensRapidas: { type: Array, default: () => [] },
  isScheduleDate: { type: Boolean, default: false }
})

const emit = defineEmits(['update:replyingMessage'])

const ticketStore = useTicketStore()
const { ticketFocado } = storeToRefs(ticketStore)
const { iniciarAtendimento } = useTicketActions()

const inputRef = ref(null)
const filePickerRef = ref(null)
const loading = ref(false)
const textChat = ref('')
const arquivos = ref([])
const sign = ref(LocalStorage.getItem('sign') || false)
const scheduleDate = ref(null)
const isRecordingAudio = ref(false)
const visualizarMensagensRapidas = ref(false)

const cMensagensRapidas = computed(() => {
  let search = textChat.value.toLowerCase()
  if (search.startsWith('/')) search = search.substring(1)
  return !search ? props.mensagensRapidas : props.mensagensRapidas.filter(r => r.key.toLowerCase().includes(search))
})

const handleEnter = () => {
  if (textChat.value.trim().length) enviarMensagem()
}

const handleInputPaste = e => {
  const file = e.clipboardData?.files[0]
  if (file) arquivos.value = [file]
}

const abrirEnvioArquivo = () => filePickerRef.value.pickFiles()

const onInsertSelectEmoji = emoji => {
  const input = inputRef.value.$refs.input
  const start = input.selectionStart
  const end = input.selectionEnd
  textChat.value = textChat.value.substring(0, start) + emoji.i + textChat.value.substring(end)
  nextTick(() => {
    input.selectionStart = input.selectionEnd = start + emoji.i.length
    input.focus()
  })
}

const mensagemRapidaSelecionada = m => {
  textChat.value = m.message
  visualizarMensagensRapidas.value = false
  nextTick(() => inputRef.value.focus())
}

const handleSartRecordingAudio = async () => {
  try {
    await navigator.mediaDevices.getUserMedia({ audio: true })
    
    // Lazy load MicRecorder para evitar erro com lamejs
    if (!Mp3Recorder) {
      const MicRecorder = (await import('mic-recorder-to-mp3')).default
      Mp3Recorder = new MicRecorder({ bitRate: 128 })
    }
    
    await Mp3Recorder.start()
    isRecordingAudio.value = true
  } catch (e) {
    console.error('Erro ao iniciar gravação:', e)
    notificarErro('Erro ao acessar microfone')
  }
}

const handleStopRecordingAudio = async () => {
  loading.value = true
  try {
    const [, blob] = await Mp3Recorder.stop().getMp3()
    if (blob.size < 1000) return (isRecordingAudio.value = false)

    const formData = new FormData()
    formData.append('medias', blob, `${Date.now()}.mp3`)
    formData.append('fromMe', 'true')
    if (scheduleDate.value) formData.append('scheduleDate', scheduleDate.value)

    await ticketStore.enviarMensagem(ticketFocado.value.id, formData)
    isRecordingAudio.value = false
  } catch (e) {
    notificarErro('Erro ao enviar áudio', e)
  } finally {
    loading.value = false
  }
}

const handleCancelRecordingAudio = () => {
  Mp3Recorder.stop()
  isRecordingAudio.value = false
}

const enviarMensagem = async () => {
  if (props.isScheduleDate && !scheduleDate.value) return notificarErro('Informe a data do agendamento')

  loading.value = true
  try {
    const formData = new FormData()
    formData.append('fromMe', 'true')

    if (arquivos.value.length) {
      arquivos.value.forEach(f => formData.append('medias', f))
    } else {
      let body = textChat.value.trim()
      if (sign.value) body = `*${LocalStorage.getItem('username')}*\n${body}`
      formData.append('body', body)
      if (props.replyingMessage) formData.append('quotedMsg', JSON.stringify(props.replyingMessage))
    }

    if (scheduleDate.value) formData.append('scheduleDate', scheduleDate.value)

    await ticketStore.enviarMensagem(ticketFocado.value.id, formData)
    textChat.value = ''
    arquivos.value = []
    emit('update:replyingMessage', null)
    nextTick(() => inputRef.value?.focus())
  } catch (e) {
    notificarErro('Erro ao enviar mensagem', e)
  } finally {
    loading.value = false
  }
}

const handlSendLinkVideo = async () => {
  const link = `https://meet.jit.si/${uid()}`
  textChat.value = link
  await enviarMensagem()
  window.open(link, '_blank')
}

const onRejectedFiles = () => notificarErro('Arquivos inválidos ou muito grandes (Max 15MB)')

const handleSign = val => LocalStorage.set('sign', val)

onMounted(() => {
  bus.on('mensagem-chat:focar-input-mensagem', () => inputRef.value?.focus())
})

onUnmounted(() => {
  bus.off('mensagem-chat:focar-input-mensagem')
})

watch(
  () => textChat.value,
  val => {
    if (val.startsWith('/')) visualizarMensagensRapidas.value = true
  }
)
</script>

<style lang="sass" scoped>
.btn-rounded
  border-radius: 8px
</style>
