<template>
  <div
    class="bg-white no-scroll hide-scrollbar overflow-hidden"
    :style="style"
  >
    <InforCabecalhoChat @abrir:modalAgendamentoMensagem="modalAgendamentoMensagem = true" />

    <q-scroll-area
      ref="scrollContainer"
      class="scroll-y"
      :style="cStyleScroll"
      @scroll="scrollArea"
    >
      <div class="column q-py-md">
          <InfiniteLoading
            v-if="mensagens.length"
            @infinite="onLoadMore"
            top
            :identifier="ticketFocado.id"
          >
            <template #complete>
              <div class="text-center q-pa-sm text-grey-6 text-caption">Início da conversa</div>
            </template>
            <template #error>
              <div class="text-center q-pa-sm text-grey-6 text-caption">Erro ao carregar mais mensagens</div>
            </template>
          </InfiniteLoading>

        <MensagemChat
          v-model:replyingMessage="replyingMessage"
          :mensagens="mensagens"
          :ticketId="ticketFocado.id"
          v-if="mensagens.length && ticketFocado.id"
          @mensagem-chat:encaminhar-mensagem="abrirModalEncaminharMensagem"
          v-model:ativarMultiEncaminhamento="ativarMultiEncaminhamento"
          v-model:mensagensParaEncaminhar="mensagensParaEncaminhar"
        />
        <div id="inicioListaMensagensChat"></div>
      </div>
    </q-scroll-area>

    <div
      class="absolute-center items-center text-center"
      v-if="!ticketFocado.id"
    >
      <q-icon
        size="6em"
        color="grey-6"
        name="mdi-emoticon-wink-outline"
      />
      <h1 class="text-h4 text-grey-6">Selecione um ticket!</h1>
    </div>

    <div
      v-if="mensagens.length && scrollIcon"
      class="relative-position"
    >
      <q-btn
        class="vac-icon-scroll"
        color="primary"
        text-color="white"
        icon="mdi-arrow-down"
        round
        push
        ripple
        dense
        @click="scrollToBottom"
      />
    </div>

    <q-footer
      class="bg-white"
      bordered
    >
      <!-- Replying Banner -->
      <div
        v-if="replyingMessage"
        class="q-pa-sm bg-grey-2 row items-center no-wrap"
      >
        <div class="col overflow-hidden">
          <div class="text-bold text-primary">
            {{ replyingMessage.contact?.name || 'Você' }}
          </div>
          <div
            class="ellipsis text-caption"
            v-html="formatarMensagemWhatsapp(replyingMessage.body)"
          ></div>
        </div>
        <q-btn
          flat
          round
          dense
          icon="close"
          @click="replyingMessage = null"
        />
      </div>

      <!-- Forward Banner -->
      <div
        v-if="ativarMultiEncaminhamento"
        class="q-pa-md bg-blue-1"
      >
        <div class="row items-center justify-between q-mb-sm">
          <span class="text-bold">{{ mensagensParaEncaminhar.length }} mensagens selecionadas</span>
          <q-btn
            flat
            label="Cancelar"
            color="negative"
            @click="cancelarMultiEncaminhamento"
          />
        </div>
        <q-select
          dense
          outlined
          rounded
          v-model="contatoSelecionado"
          :options="contatosOptions"
          @filter="localizarContato"
          use-input
          fill-input
          hide-selected
          option-label="name"
          placeholder="Localizar contato para encaminhar..."
        >
          <template #option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section>
                <q-item-label>{{ scope.opt.name }}</q-item-label>
                <q-item-label caption>{{ scope.opt.number }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>
        <q-btn
          class="full-width q-mt-sm"
          color="primary"
          label="Encaminhar"
          icon="mdi-send"
          :disable="!contatoSelecionado"
          @click="confirmarEncaminhamentoMulti"
        />
      </div>

      <InputMensagem
        v-if="!ativarMultiEncaminhamento"
        :mensagens-rapidas="mensagensRapidas"
        v-model:replyingMessage="replyingMessage"
      />
      <q-resize-observer @resize="onResizeInputMensagem" />
    </q-footer>

    <!-- Modais -->
    <q-dialog
      v-model="modalAgendamentoMensagem"
      persistent
    >
      <q-card style="min-width: 50vw">
        <q-card-section class="row items-center justify-between">
          <div class="text-h6">Agendamento de Mensagem</div>
          <q-btn
            flat
            round
            icon="close"
            v-close-popup
          />
        </q-card-section>
        <q-card-section>
          <InputMensagem
            is-schedule-date
            :mensagens-rapidas="mensagensRapidas"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog
      v-model="modalEncaminhamentoMensagem"
      persistent
    >
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center justify-between">
          <div class="text-h6">Encaminhar Mensagem</div>
          <q-btn
            flat
            round
            icon="close"
            v-close-popup
          />
        </q-card-section>
        <q-card-section>
          <q-select
            outlined
            v-model="contatoSelecionado"
            :options="contatosOptions"
            @filter="localizarContato"
            use-input
            fill-input
            hide-selected
            option-label="name"
            placeholder="Localizar contato..."
            dense
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            flat
            label="Cancelar"
            v-close-popup
          />
          <q-btn
            color="primary"
            label="Enviar"
            @click="confirmarEncaminhamentoSimples"
            :disable="!contatoSelecionado"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import InfiniteLoading from 'v3-infinite-loading'
import 'v3-infinite-loading/lib/style.css'
import whatsBackground from 'src/assets/wa-background.png'
import whatsBackgroundDark from 'src/assets/wa-background-dark.jpg'
import bus from 'src/utils/eventBus'

const contatoStore = useContatoStore()
const ticketStore = useTicketStore()
const mensagemRapidaStore = useMensagemRapidaStore()
const { mensagensRapidas } = storeToRefs(mensagemRapidaStore)
const { mensagens, ticketFocado, hasMore, loading } = storeToRefs(ticketStore)

const scrollContainer = ref(null)
const scrollIcon = ref(false)
const heigthInputMensagem = ref(0)
const replyingMessage = ref(null)
const modalAgendamentoMensagem = ref(false)
const modalEncaminhamentoMensagem = ref(false)
const mensagemSimplesEncaminhar = ref(null)
const mensagensParaEncaminhar = ref([])
const ativarMultiEncaminhamento = ref(false)
const contatoSelecionado = ref(null)
const contatosOptions = ref([])

const pageNumber = ref(1)

const style = computed(() => ({
  backgroundImage: document.body.classList.contains('body--dark')
    ? `url(${whatsBackgroundDark})`
    : `url(${whatsBackground})`,
  backgroundPosition: 'center'
}))

const cStyleScroll = computed(() => {
  const add = heigthInputMensagem.value
  return {
    height: `calc(100vh - ${62 + add}px)`,
    width: '100%'
  }
})

const carregarMensagens = async (isLoadMore = false) => {
  if (!ticketFocado.value.id) return
  if (!isLoadMore) pageNumber.value = 1

  try {
    await ticketStore.consultarMensagens({
      ticketId: ticketFocado.value.id,
      pageNumber: pageNumber.value,
      pageSize: 20
    })
    if (!isLoadMore) scrollToBottom()
  } catch (e) {
    notificarErro('Erro ao carregar mensagens', e)
  }
}

const onLoadMore = async state => {
  if (!hasMore.value || loading.value) {
    state.complete()
    return
  }
  pageNumber.value++
  try {
    await carregarMensagens(true)
    state.loaded()
  } catch (e) {
    state.error()
  }
}

const scrollArea = e => {
  if (!e) return
  scrollIcon.value = e.verticalSize - (e.verticalPosition + e.verticalContainerSize) > 800
}

const scrollToBottom = () => {
  nextTick(() => {
    const el = document.getElementById('inicioListaMensagensChat')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  })
}

const onResizeInputMensagem = size => {
  heigthInputMensagem.value = size.height
}

const abrirModalEncaminharMensagem = msg => {
  mensagemSimplesEncaminhar.value = msg
  modalEncaminhamentoMensagem.value = true
}

const cancelarMultiEncaminhamento = () => {
  mensagensParaEncaminhar.value = []
  ativarMultiEncaminhamento.value = false
}

const localizarContato = async (val, update, abort) => {
  if (val.length < 2) {
    abort()
    return
  }
  try {
    const data = await contatoStore.listarContatos({ searchParam: val })
    update(() => {
      contatosOptions.value = data.contacts
    })
  } catch (e) {
    abort()
  }
}

const confirmarEncaminhamentoSimples = async () => {
  if (!contatoSelecionado.value) return
  try {
    await ticketStore.encaminharMensagem([mensagemSimplesEncaminhar.value], contatoSelecionado.value)
    notificarSucesso('Mensagem encaminhada!')
    modalEncaminhamentoMensagem.value = false
    contatoSelecionado.value = null
  } catch (e) {
    notificarErro('Erro ao encaminhar', e)
  }
}

const confirmarEncaminhamentoMulti = async () => {
  if (!contatoSelecionado.value || !mensagensParaEncaminhar.value.length) return
  try {
    await ticketStore.encaminharMensagem(mensagensParaEncaminhar.value, contatoSelecionado.value)
    notificarSucesso(`${mensagensParaEncaminhar.value.length} mensagens encaminhadas!`)
    cancelarMultiEncaminhamento()
    contatoSelecionado.value = null
  } catch (e) {
    notificarErro('Erro ao encaminhar', e)
  }
}

watch(
  () => ticketFocado.value.id,
  newId => {
    if (newId) {
      replyingMessage.value = null
      carregarMensagens()
    }
  }
)

onMounted(() => {
  bus.on('scrollToBottomMessageChat', scrollToBottom)
  mensagemRapidaStore.listarMensagensRapidas()
  carregarMensagens()
})

onUnmounted(() => {
  bus.off('scrollToBottomMessageChat', scrollToBottom)
})
</script>

<style lang="scss">
.vac-icon-scroll {
  position: absolute;
  bottom: 100px;
  right: 20px;
  z-index: 10;
}

.hide-scrollbar {
  &::-webkit-scrollbar {
    display: none;
  }
}
</style>
