<template>
  <q-dialog
    :model-value="abrirModalQR"
    @hide="fecharModalQrModal"
    persistent
  >
    <q-card style="bg-white">
      <q-card-section>
        <div class="text-h6 text-primary">
          Leia o QrCode para iniciar a sessão
          <q-btn
            round
            class="q-ml-md"
            color="negative"
            icon="mdi-close"
            @click="fecharModalQrModal"
          />
        </div>
      </q-card-section>
      <q-card-section
        class="text-center"
        :style="$q.dark.isActive ? 'background: white !important' : ''"
      >
        <QrcodeVue
          v-if="cQrcode"
          :value="cQrcode"
          :size="300"
          level="H"
        />
        <span v-else> Aguardando o Qr Code </span>
        <!-- Temporizador para expiração do QR code -->
        <div
          v-if="cQrcode"
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
      <q-card-section>
        <div class="row">Caso tenha problema com a leitura, solicite um novo Qr Code</div>
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
import { useQuasar } from 'quasar'
import { useSessoesWhatsapp } from 'src/composables/useSessoesWhatsapp'
import { computed, onUnmounted, ref, watch } from 'vue'

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

const cQrcode = computed(() => props.channel.qrcode)

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
  if (props.channel.status === 'OPENING') {
    $q.notify({
      message: 'Conexão em andamento. Aguarde a conclusão.',
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
      startQrTimer()
    } else {
      stopQrTimer()
    }
  }
)

watch(
  () => props.channel,
  v => {
    if (v.status === 'CONNECTED') {
      fecharModalQrModal()
    }
    if (v.qrcode && props.abrirModalQR) {
      timeElapsed.value = 0
      startQrTimer()
    }
  },
  { deep: true }
)

watch(cQrcode, newVal => {
  if (newVal) {
    timeElapsed.value = 0
    startQrTimer()
  } else {
    stopQrTimer()
  }
})

onUnmounted(() => {
  stopQrTimer()
})
</script>

<style lang="scss" scoped>
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
