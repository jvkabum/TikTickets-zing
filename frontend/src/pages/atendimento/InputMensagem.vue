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
      class="q-pa-sm glass-premium row col-12 justify-center border-glass"
    >
      <cDateTimePick
        style="width: 300px"
        label="Data/Hora Agendamento"
        v-model="scheduleDate"
      />
    </div>

    <!-- Main Input Bar -->
    <div
      style="min-height: 80px; border-radius: 20px 20px 0 0; border-top: 1px solid rgba(var(--q-primary), 0.1)"
      class="row q-pb-md q-pt-sm glass-premium justify-start items-center text-grey-9 relative-position no-wrap q-px-md no-shadow"
    >
      <template v-if="!isRecordingAudio">
        <!-- Attachments & Emojis Buttons (Desktop) -->
        <div
          class="row no-wrap q-gutter-xs items-center"
        >
          <q-btn
            flat
            dense
            icon="mdi-paperclip"
            @click="abrirEnvioArquivo"
            class="btn-rounded"
            :color="$q.dark.isActive ? 'white' : 'grey-8'"
          >
            <q-tooltip>Anexar arquivo</q-tooltip>
          </q-btn>
          <EmojiPickerComponent
            :color="$q.dark.isActive ? 'white' : 'grey-8'"
            class="btn-rounded"
            height="450px"
            @select="onInsertSelectEmoji"
          />
          <q-btn
            flat
            dense
            icon="mdi-message-video"
            @click="handlSendLinkVideo"
            class="btn-rounded"
            :color="$q.dark.isActive ? 'white' : 'grey-8'"
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
          class="col-grow row items-center q-gutter-sm glass-premium q-pa-xs btn-rounded border-glass"
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
          placeholder="Digita sua mensagem"
          outlined
          dense
          rounded
          autogrow
          class="col-grow q-mx-xs"
          :bg-color="$q.dark.isActive ? 'grey-10' : 'grey-2'"
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
          :color="$q.dark.isActive ? 'white' : 'black'"
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
      class="absolute-full flex flex-center glass-premium z-max border-glass"
      style="border-radius: 20px 20px 0 0"
    >
      <q-btn
        push
        rounded
        class="grad-success"
        color="positive"
        icon="mdi-send-circle"
        label="Aceitar atendimento"
        @click="iniciarAtendimento(ticketFocado)"
        style="width: 280px; height: 50px"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { LocalStorage, uid } from 'quasar'
import { storeToRefs } from 'pinia'
import { useAuthStore } from 'src/stores/useAuthStore'
import { useTicketStore } from 'src/stores/useTicketStore'
import { useTicketActions } from './useTicketActions'
import { notificarErro } from 'src/utils/helpersNotifications'
import MicRecorder from 'mic-recorder-to-mp3'
import RecordingTimer from './RecordingTimer.vue'
import bus from 'src/utils/eventBus'
import EmojiPickerComponent from 'src/components/EmojiPickerComponent.vue'
import useEmoji from 'src/composables/useEmoji'

const props = defineProps({
  replyingMessage: { type: Object, default: null },
  mensagensRapidas: { type: Array, default: () => [] },
  isScheduleDate: { type: Boolean, default: false }
})

const emit = defineEmits(['update:replyingMessage'])

const ticketStore = useTicketStore()
const { ticketFocado } = storeToRefs(ticketStore)
const authStore = useAuthStore()
const { user } = storeToRefs(authStore)
const { iniciarAtendimento } = useTicketActions()

// Instância lazy para garantir que o boot/audio.js já tenha rodado
let Mp3Recorder = null
const initRecorder = () => {
  if (!Mp3Recorder) {
    Mp3Recorder = new MicRecorder({ bitRate: 128 })
  }
}

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

const { insertEmoji } = useEmoji()

const onInsertSelectEmoji = emoji => {
  insertEmoji(emoji, inputRef.value, textChat.value, val => (textChat.value = val))
}

const mensagemRapidaSelecionada = m => {
  textChat.value = m.message
  visualizarMensagensRapidas.value = false
  nextTick(() => inputRef.value.focus())
}

const handleSartRecordingAudio = async () => {
  try {
    initRecorder()
    await navigator.mediaDevices.getUserMedia({ audio: true })
    await Mp3Recorder.start()
    isRecordingAudio.value = true
  } catch (e) {
    console.error('Erro ao iniciar gravação:', e)
    notificarErro('Erro ao acessar microfone. Verifique as permissões.')
  }
}

const handleStopRecordingAudio = async () => {
  loading.value = true
  try {
    const [, blob] = await Mp3Recorder.stop().getMp3()
    if (blob.size < 10000) {
      loading.value = false
      isRecordingAudio.value = false
      return
    }

    const formData = new FormData()
    const filename = `${new Date().getTime()}.mp3`
    
    // Alinhamento exato com o frontend antigo: BLOB direto com nome
    formData.append('medias', blob, filename)
    formData.append('body', filename)
    formData.append('fromMe', true)
    formData.append('id', uid())
    
    if (scheduleDate.value) formData.append('scheduleDate', scheduleDate.value)

    await ticketStore.enviarMensagem(ticketFocado.value.id, formData)
    
    textChat.value = ''
    arquivos.value = []
    isRecordingAudio.value = false
  } catch (e) {
    console.error('Erro ao processar áudio MP3:', e)
    notificarErro('Erro ao enviar áudio. Tente novamente.')
  } finally {
    loading.value = false
  }
}

const handleCancelRecordingAudio = () => {
  if (Mp3Recorder) {
    Mp3Recorder.stop()
    isRecordingAudio.value = false
  }
}

const enviarMensagem = async () => {
  if (props.isScheduleDate && !scheduleDate.value) return notificarErro('Informe a data do agendamento')

  loading.value = true
  try {
    const formData = new FormData()

    if (arquivos.value.length) {
      // ORDEM CRÍTICA PARA O BACKEND: medias -> body -> fromMe -> id
      arquivos.value.forEach(f => formData.append('medias', f))
      formData.append('body', arquivos.value[0].name)
      formData.append('fromMe', true)
      formData.append('id', uid())
    } else {
      let body = textChat.value.trim()
      if (sign.value) body = `*${user.value.name}*\n${body}`
      formData.append('body', body)
      formData.append('fromMe', true)
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
  initRecorder()
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
