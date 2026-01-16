<template>
  <div v-if="userProfile === 'admin'">
    <div class="row col full-width q-pa-sm">
      <q-card
        flat
        class="full-width"
      >
        <q-card-section class="text-h6 text-bold">
          Canais
          <div class="absolute-right q-pa-md">
            <q-btn
              rounded
              color="black"
              icon="mdi-plus"
              label="Adicionar"
              @click="modalWhatsapp = true"
            />
          </div>
        </q-card-section>
      </q-card>
    </div>
    <div class="row full-width">
      <template
        v-for="item in canais"
        :key="item.id"
      >
        <q-card
          flat
          bordered
          class="col-xs-12 col-sm-5 col-md-4 col-lg-3 q-ma-sm"
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
    <ModalQrCode
      v-model:abrirModalQR="abrirModalQR"
      :channel="cDadosWhatsappSelecionado"
      @gerar-novo-qrcode="handleRequestNewQrCode"
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
import { useQuasar } from 'quasar'
import { ListarChatFlow } from 'src/service/chatFlow'
import {
  DeletarWhatsapp,
  DeleteWhatsappSession,
  ListarWhatsapps,
  RequestNewQrCode,
  StartWhatsappSession,
  UpdateWhatsapp
} from 'src/service/sessoesWhatsapp'
import { useWhatsappStore } from 'src/stores/useWhatsappStore'
import { notificarErro } from 'src/utils/helpersNotifications'
import { computed, onMounted, ref, watch } from 'vue'

// Componentes
import ItemStatusChannel from './ItemStatusChannel.vue'
import ModalQrCode from './ModalQrCode.vue'
import ModalWhatsapp from './ModalWhatsapp.vue'

const $q = useQuasar()
const whatsappStore = useWhatsappStore()

const userProfile = ref('user')
const loading = ref(false)
const isAdmin = ref(false)
const abrirModalQR = ref(false)
const modalWhatsapp = ref(false)
const whatsappSelecionado = ref({})
const listaChatFlow = ref([])
const canais = ref([])

const whatsapps = computed(() => whatsappStore.whatsapps)

const cDadosWhatsappSelecionado = computed(() => {
  const { id } = whatsappSelecionado.value
  return whatsapps.value.find(w => w.id === id)
})

watch(
  whatsapps,
  newVal => {
    canais.value = JSON.parse(JSON.stringify(newVal))
  },
  { deep: true, immediate: true }
)

const handleOpenQrModal = channel => {
  whatsappSelecionado.value = channel
  abrirModalQR.value = true
}

const handleOpenModalWhatsapp = whatsapp => {
  whatsappSelecionado.value = whatsapp
  modalWhatsapp.value = true
}

const handleDisconectWhatsSession = async whatsAppId => {
  $q.dialog({
    title: 'Atenção!! Deseja realmente desconectar? ',
    cancel: { label: 'Não', color: 'primary', push: true },
    ok: { label: 'Sim', color: 'negative', push: true },
    persistent: true
  }).onOk(async () => {
    loading.value = true
    try {
      await DeleteWhatsappSession(whatsAppId)
      whatsappStore.updateWhatsapp({ id: whatsAppId, status: 'DISCONNECTED' })
    } finally {
      loading.value = false
    }
  })
}

const handleStartWhatsAppSession = async whatsAppId => {
  try {
    await StartWhatsappSession(whatsAppId)
  } catch (error) {
    console.error(error)
  }
}

const handleRequestNewQrCode = async channel => {
  if (channel.type === 'telegram' && !channel.tokenTelegram) {
    notificarErro('Necessário informar o token para Telegram')
  }
  loading.value = true
  try {
    await RequestNewQrCode({ id: channel.id, isQrcode: true })
    setTimeout(() => {
      handleOpenQrModal(channel)
    }, 2000)
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const listarWhatsapps = async () => {
  try {
    const { data } = await ListarWhatsapps()
    whatsappStore.setWhatsapps(data)
  } catch (error) {
    console.error(error)
  }
}

const deleteWhatsapp = async whatsapp => {
  $q.dialog({
    title: 'Atenção!! Deseja realmente deletar? ',
    message: 'Não é uma boa ideia apagar se já tiver gerado atendimentos para esse whatsapp.',
    cancel: { label: 'Não', color: 'primary', push: true },
    ok: { label: 'Sim', color: 'negative', push: true },
    persistent: true
  }).onOk(async () => {
    loading.value = true
    try {
      await DeletarWhatsapp(whatsapp.id)
      whatsappStore.removeWhatsapp(whatsapp.id)
    } finally {
      loading.value = false
    }
  })
}

const listarChatFlow = async () => {
  try {
    const { data } = await ListarChatFlow()
    listaChatFlow.value = data.chatFlow
  } catch (error) {
    console.error(error)
  }
}

const handleSaveWhatsApp = async whatsapp => {
  try {
    await UpdateWhatsapp(whatsapp.id, whatsapp)
    $q.notify({
      type: 'positive',
      message: `Whatsapp ${whatsapp.id ? 'editado' : 'criado'} com sucesso!`,
      position: 'top'
    })
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'error',
      message: 'Ops! Verifique os erros... O nome da conexão não pode existir na plataforma, é um identificador único.',
      position: 'top'
    })
  }
}

onMounted(() => {
  userProfile.value = localStorage.getItem('profile')
  isAdmin.value = localStorage.getItem('profile') === 'admin'
  listarWhatsapps()
  listarChatFlow()
})
</script>

<style lang="scss" scoped></style>
