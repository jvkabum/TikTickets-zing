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
    <div class="row full-width q-py-lg q-px-md ">
      <template v-for="item in whatsapps">
        <q-card
          flat
          bordered
          class="col-xs-12 col-sm-5 col-md-4 col-lg-3 q-ma-md"
          :key="item.id"
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
              <q-item-label class="text-bold text-primary text-body1">Cliente: {{ `${item.tenant && item.tenant.id} - ${item.tenant && item.tenant.name}` }}</q-item-label>
            </q-item-section>
            <q-item-section side>
            </q-item-section>
          </q-item>
          <q-separator />
          <q-card-section>
            <ItemStatusChannel :item="item" />
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

<script>
import { AdminListarChannels } from 'src/service/channels'
import { format, parseISO } from 'date-fns'
import pt from 'date-fns/locale/pt-BR/index'
import { mapGetters } from 'vuex'
import ItemStatusChannel from './ItemStatusChannel'
import { AdminListarEmpresas } from 'src/service/empresas'

const userLogado = JSON.parse(localStorage.getItem('usuario'))

export default {
  name: 'IndexSessoesWhatsapp',
  components: {
    ItemStatusChannel
  },
  data () {
    return {
      userProfile: 'user',
      loading: false,
      userLogado,
      empresas: [],
      isAdmin: false,
      whatsappSelecionado: {},
      whatsAppId: null,
      objStatus: {
        qrcode: ''
      },
      columns: [
        {
          name: 'name',
          label: 'Nome',
          field: 'name',
          align: 'left'
        },
        {
          name: 'status',
          label: 'Status',
          field: 'status',
          align: 'center'
        },
        {
          name: 'session',
          label: 'Sessão',
          field: 'status',
          align: 'center'
        },
        {
          name: 'number',
          label: 'Número',
          field: 'number',
          align: 'center'
        },
        {
          name: 'updatedAt',
          label: 'Última Atualização',
          field: 'updatedAt',
          align: 'center',
          format: d => this.formatarData(d, 'dd/MM/yyyy HH:mm')
        },
        {
          name: 'isDefault',
          label: 'Padrão',
          field: 'isDefault',
          align: 'center'
        },
        {
          name: 'acoes',
          label: 'Ações',
          field: 'acoes',
          align: 'center'
        }
      ]
    }
  },
  computed: {
    ...mapGetters(['whatsapps'])
  },
  methods: {
    formatarData (data, formato) {
      return format(parseISO(data), formato, { locale: pt })
    },
    async listarChannels () {
      const { data } = await AdminListarChannels()
      this.$store.commit('LOAD_WHATSAPPS', data)
    },
    async listarEmpresas () {
      const { data } = await AdminListarEmpresas()
      this.empresas = data
    }
  },
  mounted () {
    this.isAdmin = localStorage.getItem('profile')
    this.listarChannels()
    this.listarEmpresas()
    this.userProfile = localStorage.getItem('profile')
  },
  destroyed () {
    this.$root.$off('UPDATE_SESSION')
  }
}
</script>

<style lang="scss" scoped>
</style>
