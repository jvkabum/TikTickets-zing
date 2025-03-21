<template>
  <q-dialog :value="abrirModalQR"
    @hide="fecharModalQrModal"
    persistent>
    <q-card style="bg-white">
      <q-card-section>
        <div class="text-h6 text-primary">
          Leia o QrCode para iniciar a sessão
          <q-btn round
            class="q-ml-md"
            color="negative"
            icon="mdi-close"
            @click="fecharModalQrModal" />
        </div>
      </q-card-section>
      <q-card-section class="text-center"
        :style="$q.dark.isActive ? 'background: white !important' : ''">
        <QrcodeVue v-if="cQrcode"
          :value="cQrcode"
          :size="300"
          level="H" />
        <span v-else>
          Aguardando o Qr Code
        </span>
        <!-- Temporizador para expiração do QR code -->
        <div v-if="cQrcode" class="qr-timer q-mt-sm">
          <q-linear-progress
            size="10px"
            :value="timeProgressValue"
            :color="timeProgressColor"
            track-color="grey-3"
          />
          <div class="text-caption q-mt-xs" :class="qrTimerClass">
            {{ timeoutMessage }}
          </div>
        </div>
      </q-card-section>
      <q-card-section>
        <div class="row">Caso tenha problema com a leitura, solicite um novo Qr Code </div>
        <div class="row col-12 justify-center">
          <q-btn color="primary"
            glossy
            ripple
            outline
            label="Novo QR Code"
            @click="solicitarQrCode"
            icon="watch_later" />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>

</template>

<script>

import QrcodeVue from 'qrcode.vue'

export default {
  name: 'ModalQrCode',
  components: {
    QrcodeVue
  },
  props: {
    abrirModalQR: {
      type: Boolean,
      default: false
    },
    channel: {
      type: Object,
      default: () => ({
        id: null,
        qrcode: '',
        qrTimestamp: null
      })
    }
  },
  data () {
    return {
      qrTimer: null,
      qrExpirationTime: 60, // 60 segundos de vida útil
      timeElapsed: 0
    }
  },
  watch: {
    abrirModalQR (newVal) {
      if (newVal) {
        this.startQrTimer()
      } else {
        this.stopQrTimer()
      }
    },
    channel: {
      handler (v) {
        if (this.channel.status === 'CONNECTED') {
          this.fecharModalQrModal()
        }

        // Reinicia o timer quando receber um novo QR code
        if (this.channel.qrcode && this.abrirModalQR) {
          this.timeElapsed = 0
          this.startQrTimer()
        }
      },
      deep: true
    },
    cQrcode (newVal) {
      if (newVal) {
        this.timeElapsed = 0
        this.startQrTimer()
      } else {
        this.stopQrTimer()
      }
    }
  },
  computed: {
    cQrcode () {
      return this.channel.qrcode
    },
    // Calcula o valor da barra de progresso (de 0 a 1)
    timeProgressValue () {
      return 1 - (this.timeElapsed / this.qrExpirationTime)
    },
    // Define a cor da barra de progresso com base no tempo restante
    timeProgressColor () {
      if (this.timeElapsed > this.qrExpirationTime * 0.75) return 'red'
      if (this.timeElapsed > this.qrExpirationTime * 0.5) return 'orange'
      return 'green'
    },
    // Mensagem de timeout baseada no tempo restante
    timeoutMessage () {
      const timeLeft = Math.max(0, this.qrExpirationTime - this.timeElapsed)

      if (timeLeft === 0) {
        return 'QR Code expirado! Solicitando um novo...'
      }
      return `Tempo restante: ${timeLeft} segundos`
    },
    // Classe CSS para o texto do temporizador
    qrTimerClass () {
      if (this.timeElapsed > this.qrExpirationTime * 0.75) return 'text-red'
      if (this.timeElapsed > this.qrExpirationTime * 0.5) return 'text-orange'
      return 'text-green'
    }
  },
  methods: {
    // Inicia o temporizador do QR code
    startQrTimer () {
      this.stopQrTimer() // Limpa o timer existente se houver

      this.timeElapsed = 0
      this.qrTimer = setInterval(() => {
        this.timeElapsed++

        // Se o tempo expirou e o status não é OPENING, solicita um novo QR code
        if (this.timeElapsed >= this.qrExpirationTime && this.channel.status !== 'OPENING') {
          this.solicitarQrCode()
          this.stopQrTimer()
        }
      }, 1000)
    },
    // Para o temporizador do QR code
    stopQrTimer () {
      if (this.qrTimer) {
        clearInterval(this.qrTimer)
        this.qrTimer = null
      }
    },
    solicitarQrCode () {
      // Verifica se está em processo de conexão
      if (this.channel.status === 'OPENING') {
        this.$q.notify({
          message: 'Conexão em andamento. Aguarde a conclusão.',
          type: 'warning'
        })
        return
      }

      this.$emit('gerar-novo-qrcode', this.channel)
    },
    fecharModalQrModal () {
      this.stopQrTimer()
      this.$emit('update:abrirModalQR', false)
    }
  },
  beforeDestroy () {
    this.stopQrTimer()
  }
}
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
