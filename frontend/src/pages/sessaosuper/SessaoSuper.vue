<template>
  <div v-if="userProfile === 'super'">
    <div class="row col full-width q-pa-lg">
      <q-card
        flat
        bordered
        class="full-width"
      >
        <q-card-section class="text-h6 text-bold">
          Canais
          <q-space />
        </q-card-section>
      </q-card>
    </div>
    <div class="row full-width q-py-lg q-px-md">
      <template
        v-for="item in whatsapps"
        :key="item.id"
      >
        <q-card
          flat
          bordered
          class="col-xs-12 col-sm-5 col-md-4 col-lg-3 q-ma-md"
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
              <q-item-label class="text-bold text-primary text-body1"
                >Cliente: {{ `${item.tenant && item.tenant.id} - ${item.tenant && item.tenant.name}` }}</q-item-label
              >
            </q-item-section>
            <q-item-section side> </q-item-section>
          </q-item>
          <q-separator />
          <q-card-section>
            <ItemStatusChannelSuper :item="item" />
          </q-card-section>
          <q-separator />
          <q-card-actions
            class="q-pa-md q-pt-none"
            align="center"
          >
            <q-btn-group
              v-if="item.status == 'DISCONNECTED'"
              outline
            >
            </q-btn-group>
          </q-card-actions>
        </q-card>
      </template>
    </div>

    <q-inner-loading :showing="loading">
      <q-spinner-gears
        size="50px"
        color="primary"
      />
    </q-inner-loading>
  </div>
</template>

<script setup>
import { format, parseISO } from 'date-fns'
import pt from 'date-fns/locale/pt-BR'
import { storeToRefs } from 'pinia'
import { useWhatsappStore } from 'src/stores/useWhatsappStore'
import { onMounted, ref } from 'vue'
import { AdminListarChannels } from '../../service/channels'
import { AdminListarEmpresas } from '../../service/empresas'
import ItemStatusChannelSuper from './ItemStatusChannelSuper.vue'

const whatsappStore = useWhatsappStore()
const { whatsapps } = storeToRefs(whatsappStore)

const userLogado = JSON.parse(localStorage.getItem('usuario'))
const userProfile = ref('user')
const loading = ref(false)
const empresas = ref([])
const isAdmin = ref(false)

const formatarData = (data, formato) => {
  return format(parseISO(data), formato, { locale: pt })
}

const listarChannels = async () => {
  loading.value = true
  try {
    const { data } = await AdminListarChannels()
    whatsappStore.setWhatsapps(data)
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const listarEmpresas = async () => {
  try {
    const { data } = await AdminListarEmpresas()
    empresas.value = data
  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  const profile = localStorage.getItem('profile')
  userProfile.value = profile
  isAdmin.value = profile === 'admin'
  listarChannels()
  listarEmpresas()
})
</script>

<style lang="scss" scoped></style>
