<template>
  <div v-if="userProfile === 'admin'">
    <div class="row col full-width q-pa-sm">
      <q-card
        class="full-width glass-premium border-glass"
      >
        <q-card-section class="text-h6 text-bold">
          Canais
          <div class="absolute-right q-pa-md">
            <q-btn
              rounded
              color="black"
              icon="mdi-plus"
              label="Adicionar"
              @click="handleOpenModalWhatsapp({})"
            />
          </div>
        </q-card-section>
      </q-card>
    </div>
    <div class="row full-width">
      <template
        v-for="item in whatsapps"
        :key="item.id"
      >
        <q-card
          class="col-xs-12 col-sm-5 col-md-4 col-lg-3 q-ma-sm glass-premium border-glass shadow-premium"
        >
          <q-item>
            <q-item-section avatar>
              <q-avatar>
                <q-icon
                  size="40px"
                  :name="`img:${item.type}-logo.png`"
                />
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-h6 text-bold">Nome: {{ item.name }}</q-item-label>
              <q-item-label class="text-h6 text-caption">
                {{ item.type }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn
                round
                flat
                dense
                icon="mdi-pen"
                @click="handleOpenModalWhatsapp(item)"
                v-if="isAdmin"
              />
            </q-item-section>
          </q-item>
          <q-separator />
          <q-card-section>
            <ItemStatusChannel :item="item" />
            <template v-if="item.type === 'messenger'">
              <div class="text-body2 text-bold q-mt-sm">
                <span> Página: </span>
                {{ (item.fbObject && item.fbObject.name) || 'Nenhuma página configurada.' }}
              </div>
            </template>
          </q-card-section>
          <q-card-section>
            <q-select
              outlined
              dense
              rounded
              label="Bot"
              v-model="item.chatFlowId"
              :options="listaChatFlow"
              map-options
              emit-value
              option-value="id"
              option-label="name"
              clearable
              @update:model-value="handleSaveWhatsApp(item)"
            />
          </q-card-section>
          <q-separator />
          <q-card-actions
            class="q-gutter-md q-pa-md q-pt-none"
            align="center"
          >
            <template v-if="item.type !== 'messenger'">
              <q-btn
                rounded
                v-if="item.type == 'whatsapp' && item.status == 'qrcode'"
                color="blue-5"
                label="QR Code"
                @click="handleOpenQrModal(item)"
                icon-right="watch_later"
                :disable="!isAdmin"
              />

              <div
                v-if="item.status == 'DISCONNECTED'"
                class="q-gutter-sm"
              >
                <q-btn
                  rounded
                  color="positive"
                  label="Conectar"
                  @click="handleStartWhatsAppSession(item.id)"
                />
                <q-btn
                  rounded
                  v-if="item.status == 'DISCONNECTED' && item.type == 'whatsapp'"
                  color="blue-5"
                  label="Novo QR Code"
                  @click="handleRequestNewQrCode(item)"
                  icon-right="watch_later"
                  :disable="!isAdmin"
                />
              </div>

              <div
                v-if="item.status == 'OPENING'"
                class="row items-center q-gutter-sm flex flex-inline"
              >
                <div class="text-bold">Conectando</div>
                <q-spinner-radio
                  color="positive"
                  size="2em"
                />
                <q-separator
                  vertical
                  spaced=""
                />
              </div>

              <q-btn
                v-if="['OPENING', 'CONNECTED', 'PAIRING', 'TIMEOUT'].includes(item.status)"
                color="negative"
                label="Desconectar"
                @click="handleDisconectWhatsSession(item.id)"
                :disable="!isAdmin"
                class="q-mx-sm"
              />
            </template>
            <q-btn
              color="red"
              icon="mdi-delete"
              @click="deleteWhatsapp(item)"
              :disable="!isAdmin"
              dense
              round
              flat
              class="absolute-bottom-right"
            >
              <q-tooltip> Deletar conexáo </q-tooltip>
            </q-btn>
          </q-card-actions>
        </q-card>
      </template>
    </div>
    
    <!-- Loading não-bloqueante -->
    <div v-if="loading && whatsapps.length === 0" class="row full-width justify-center q-pa-xl">
      <q-spinner-gears size="50px" color="primary" />
      <div class="q-ml-md text-grey-7">Carregando conexões...</div>
    </div>
    
    <ModalQrCode
      v-model:abrirModalQR="abrirModalQR"
      :channel="cDadosWhatsappSelecionado"
    />
    <ModalWhatsapp
      v-model:modalWhatsapp="modalWhatsapp"
      v-model:whatsAppEdit="whatsappSelecionado"
      @recarregar-lista="listarWhatsapps"
    />
    <q-inner-loading :showing="loading">
      <q-spinner-gears
        size="50px"
        color="primary"
      />
    </q-inner-loading>
  </div>
</template>

<script setup>
const $q = useQuasar()

const {
  loading,
  abrirModalQR,
  modalWhatsapp,
  whatsappSelecionado,
  whatsapps,
  cDadosWhatsappSelecionado,
  handleOpenQrModal,
  handleOpenModalWhatsapp,
  handleDisconectWhatsSession,
  handleStartWhatsAppSession,
  handleRequestNewQrCode,
  listarWhatsapps,
  deleteWhatsapp,
  saveWhatsapp
} = useSessoesWhatsapp()

const chatFlowStore = useChatFlowStore()
const { chatFlows: listaChatFlow } = storeToRefs(chatFlowStore)

const userProfile = ref('user')
const isAdmin = ref(false)

const handleSaveWhatsApp = async (whatsapp) => {
  await saveWhatsapp(whatsapp)
}

const listarChatFlow = async () => {
  await chatFlowStore.listarChatFlows()
}

onMounted(async () => {
  userProfile.value = localStorage.getItem('profile')
  isAdmin.value = localStorage.getItem('profile') === 'admin'
  
  // Rodar requisições em paralelo para economizar tempo
  await Promise.all([
    listarWhatsapps(),
    listarChatFlow()
  ])
})
</script>

<style lang="scss" scoped></style>
