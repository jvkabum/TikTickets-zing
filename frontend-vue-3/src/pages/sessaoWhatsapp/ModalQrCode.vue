<template>
  <q-dialog
    :model-value="abrirModalQR"
    @hide="fecharModalQrModal"
    persistent
  >
    <q-card style="min-width: 400px">
      <q-card-section>
        <div class="text-h6 text-primary">
          Leia o QrCode para iniciar a sessão
          <q-btn
            round
            flat
            class="float-right"
            color="negative"
            icon="mdi-close"
            @click="fecharModalQrModal"
          />
        </div>
      </q-card-section>
      <q-card-section
        class="text-center"
      >
        <div class="qr-code-container">
        <QrcodeVue
          v-if="cQrcode && props.channel.status !== 'PAIRING'"
          :value="cQrcode"
          :size="300"
          level="H"
        />
        </div>
        <div
          v-if="props.channel.status === 'PAIRING'"
          class="column items-center justify-center q-pa-xl"
        >
          <q-icon
            name="mdi-check-circle"
            color="positive"
            size="5rem"
          />
          <div class="text-h6 text-bold text-primary q-mt-md">
            QR Code lido com sucesso!
          </div>
          <div class="text-subtitle1 text-grey-8">
            Estabilizando sua conexão...
          </div>
          <q-spinner-dots
            color="primary"
            size="3rem"
            class="q-mt-md"
          />
        </div>
        <span v-else-if="!cQrcode && props.channel.status !== 'PAIRING'"> Aguardando o Qr Code </span>
        <!-- Temporizador para expiração do QR code -->
        <div
          v-if="cQrcode && props.channel.status !== 'PAIRING'"
          class="qr-timer q-mt-sm"
        >
          <q-linear-progress
            size="10px"
            :value="timeProgressValue"
            :color="timeProgressColor"
            track-color="grey-3"
          />
          <div
            class="text-caption q-mt-xs"
            :class="qrTimerClass"
          >
            {{ timeoutMessage }}
          </div>
        </div>
      </q-card-section>
      <q-card-section class="text-center">
        <div class="row items-center justify-center q-mb-md text-grey-8">
          Caso tenha problema com a leitura, solicite um novo Qr Code
        </div>
        <div class="row col-12 justify-center">
          <q-btn
            color="primary"
            glossy
            ripple
            outline
            label="Novo QR Code"
            @click="solicitarQrCode"
            icon="watch_later"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import QrcodeVue from 'qrcode.vue'

const props = defineProps({
  abrirModalQR: {
    type: Boolean,
    default: false
  },
  channel: {
    type: Object,
    default: () => ({
      id: null,
      qrcode: '',
      qrTimestamp: null,
      status: ''
    })
  }
})

const emit = defineEmits(['update:abrirModalQR', 'gerar-novo-qrcode'])

const $q = useQuasar()
const { handleRequestNewQrCode } = useSessoesWhatsapp()

const qrTimer = ref(null)
const qrExpirationTime = ref(60)
const timeElapsed = ref(0)



const timeProgressValue = computed(() => {
  return 1 - timeElapsed.value / qrExpirationTime.value
})

const timeProgressColor = computed(() => {
  if (timeElapsed.value > qrExpirationTime.value * 0.75) return 'red'
  if (timeElapsed.value > qrExpirationTime.value * 0.5) return 'orange'
  return 'green'
})

const timeoutMessage = computed(() => {
  const timeLeft = Math.max(0, qrExpirationTime.value - timeElapsed.value)
  if (timeLeft === 0) return 'QR Code expirado! Solicitando um novo...'
  return `Tempo restante: ${timeLeft} segundos`
})

const qrTimerClass = computed(() => {
  if (timeElapsed.value > qrExpirationTime.value * 0.75) return 'text-red'
  if (timeElapsed.value > qrExpirationTime.value * 0.5) return 'text-orange'
  return 'text-green'
})

const stopQrTimer = () => {
  if (qrTimer.value) {
    clearInterval(qrTimer.value)
    qrTimer.value = null
  }
}

const solicitarQrCode = () => {
  if (['OPENING', 'PAIRING', 'CONNECTED'].includes(props.channel.status)) {
    $q.notify({
      message: 'Conexão em andamento ou já estabelecida. Aguarde.',
      type: 'warning'
    })
    return
  }
  handleRequestNewQrCode(props.channel)
}

const startQrTimer = () => {
  stopQrTimer()
  timeElapsed.value = 0
  qrTimer.value = setInterval(() => {
    // Se o status mudar para PAIRING ou CONNECTED, para o timer imediatamente
    if (['PAIRING', 'CONNECTED'].includes(props.channel.status)) {
      stopQrTimer()
      return
    }

    timeElapsed.value++
    if (timeElapsed.value >= qrExpirationTime.value && props.channel.status !== 'OPENING') {
      solicitarQrCode()
      stopQrTimer()
    }
  }, 1000)
}

const fecharModalQrModal = () => {
  stopQrTimer()
  emit('update:abrirModalQR', false)
}

watch(
  () => props.abrirModalQR,
  newVal => {
    if (newVal) {
      if (props.channel.qrcode) {
        timeElapsed.value = 0
        startQrTimer()
      }
    } else {
      stopQrTimer()
    }
  }
)

import bus from 'src/utils/eventBus'

// ... (existing code)

// Adicionar um estado local para garantir atualização caso a prop falhe
const localQrcode = ref('')

// Computed que dá preferência ao local se existir, senão usa a prop
const cQrcode = computed(() => localQrcode.value || props.channel.qrcode)

// ... (existing code)

watch(
  () => props.channel,
  (v) => {
    // Se a prop mudar, limpamos o local para usar a prop (fonte da verdade)
    if (v.qrcode) {
        localQrcode.value = ''
    }
    
    if (['CONNECTED', 'PAIRING'].includes(v.status)) {
      stopQrTimer()
      if (v.status === 'CONNECTED') {
        fecharModalQrModal()
      }
    }
    // Sempre reiniciar timer se houver QR Code e modal aberto
    if ((v.qrcode || localQrcode.value) && props.abrirModalQR) {
      timeElapsed.value = 0 // Força reset visual
      startQrTimer()
    }
  },
  { deep: true }
)

onMounted(() => {
    bus.on('UPDATE_SESSION', (session) => {
        if (session.id === props.channel.id && session.qrcode) {
            console.log('ModalQrCode: Recebido UPDATE_SESSION via bus (QR code)', session)
            localQrcode.value = session.qrcode
            timeElapsed.value = 0
            startQrTimer()
        }
        
        // Se receber PAIRING ou CONNECTED via bus, para o timer IMEDIATAMENTE
        // Isso previne a race condition de o timer expirar enquanto o Vue atualiza as props
        if (session.id === props.channel.id && ['CONNECTED', 'PAIRING'].includes(session.status)) {
             console.log(`[DEBUG] ModalQrCode: Recebido status ${session.status} via bus para sessão ${session.id}`)
             stopQrTimer()
             if (session.status === 'CONNECTED') {
                console.log('[DEBUG] ModalQrCode: Status é CONNECTED, fechando modal...')
                fecharModalQrModal()
             }
        }
    })
})

onUnmounted(() => {
  stopQrTimer()
  bus.off('UPDATE_SESSION')
})
</script>

<style lang="scss" scoped>
.qr-code-container {
  background-color: white !important;
  padding: 24px;
  border-radius: 12px;
  display: inline-block;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 2px solid #e0e0e0;
}

.qr-timer {
  margin-top: 8px;
}

.text-red {
  color: red !important;
}

.text-orange {
  color: orange !important;
}

.text-green {
  color: green !important;
}
</style>
