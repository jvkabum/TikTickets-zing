<template>
  <div class="q-pa-md height-fix">
    <q-table
      class="my-sticky-dynamic glass-premium border-glass no-shadow"
      title="Contatos"
      :id="`tabela-contatos-${isChatContact ? 'atendimento' : ''}`"
      :rows="contatos"
      :columns="columns"
      :loading="loading"
      row-key="id"
      virtual-scroll
      :virtual-scroll-item-size="48"
      :virtual-scroll-sticky-size-start="48"
      v-model:pagination="pagination"
      :rows-per-page-options="[0]"
      @virtual-scroll="onScroll"
      :bordered="false"
      :square="false"
      :flat="true"
      :separator="isChatContact ? 'vertical' : 'horizontal'"
      :class="{
        'q-ma-md rounded-all': !isChatContact,
        'q-ml-md heightChat': isChatContact
      }"
    >
      <template v-slot:top>
        <div class="row col-2 q-table__title items-center">
          <q-btn
            v-if="isChatContact"
            class="q-mr-sm"
            color="black"
            round
            flat
            icon="mdi-close"
            @click="$router.push({ name: 'chat-empty' })"
          />
          Contatos
        </div>
        <q-space />
        <q-input
          :class="{
            'order-last q-mt-md': $q.screen.width < 500
          }"
          style="width: 300px"
          dense
          outlined
          rounded
          debounce="500"
          v-model="params.searchParam"
          clearable
          placeholder="Localize"
          @update:model-value="filtrarContato"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
        <q-select
          style="width: 300px"
          class="q-ml-sm"
          dense
          outlined
          rounded
          v-model="params.tagsIds"
          multiple
          label="Filtrar por Tags"
          :options="etiquetas"
          use-chips
          option-value="id"
          option-label="tag"
          emit-value
          map-options
          @update:model-value="filtrarContato"
        >
          <template v-slot:selected-item="{ opt }">
            <q-chip
              dense
              square
              color="white"
              text-color="primary"
              class="q-ma-xs"
            >
              <q-icon
                :style="`color: ${opt.color}`"
                name="mdi-pound-box-outline"
                size="20px"
                class="q-mr-xs"
              />
              {{ opt.tag }}
            </q-chip>
          </template>
        </q-select>
        <q-space />
        <q-btn-dropdown
          color="primary"
          label="Adicionar"
          rounded
          split
          class="glossy"
          @click="
            () => {
              selectedContactId = null
              modalContato = true
            }
          "
        >
          <q-list>
            <q-item
              clickable
              v-close-popup
              @click="modalImportarContatos = true"
            >
              <q-item-section>
                <q-item-label>Importar</q-item-label>
              </q-item-section>
            </q-item>
            <q-item
              clickable
              v-close-popup
              @click="handleExportContacts"
            >
              <q-item-section>
                <q-item-label>Exportar</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </template>

      <template v-slot:body-cell-profilePicUrl="props">
        <q-td :props="props">
          <q-avatar
            size="40px"
            flat
            class="bg-grey-3"
          >
            <template v-if="props.row.profilePicUrl">
              <q-img :src="props.row.profilePicUrl" />
            </template>
            <q-icon
              name="mdi-account"
              v-else
              size="24px"
            />
          </q-avatar>
        </q-td>
      </template>

      <template v-slot:body-cell-acoes="props">
        <q-td class="text-center">
          <div class="row items-center justify-center no-wrap q-gutter-xs">
            <q-btn
              flat
              round
              dense
              icon="img:whatsapp-logo.png"
              @click="handleSaveTicket(props.row, 'whatsapp')"
              v-if="props.row.number"
            />
            <q-btn
              flat
              round
              dense
              icon="img:instagram-logo.png"
              @click="handleSaveTicket(props.row, 'instagram')"
              v-if="props.row.instagramPK"
            />
            <q-btn
              flat
              round
              dense
              icon="img:telegram-logo.png"
              @click="handleSaveTicket(props.row, 'telegram')"
              v-if="props.row.telegramId"
            />
            <q-btn
              color="primary"
              flat
              round
              dense
              icon="edit"
              @click="editContact(props.row.id)"
            />
            <q-btn
              color="negative"
              flat
              round
              dense
              icon="mdi-delete"
              @click="deleteContact(props.row.id)"
            />
          </div>
        </q-td>
      </template>
      <template v-slot:pagination> {{ contatos.length }}/{{ totalContatos }} </template>
    </q-table>
    <ContatoModal
      v-model:contact-id="selectedContactId"
      v-model:modal-contato="modalContato"
    />

    <ModalImportarContatos
      v-model="modalImportarContatos"
      :etiquetas="etiquetas"
      @imported="filtrarContato"
    />
  </div>
</template>

<script setup>
import { notificarErro, notificarSucesso } from 'src/utils/helpersNotifications'

import ContatoModal from './ContatoModal.vue'

const props = defineProps({
  isChatContact: {
    type: Boolean,
    default: false
  }
})

const $q = useQuasar()
const contatoStore = useContatoStore()
const etiquetaStore = useEtiquetaStore()
const ticketStore = useTicketStore()

const { contatos, loading, totalContatos, hasMore } = storeToRefs(contatoStore)
const { etiquetas } = storeToRefs(etiquetaStore)

const selectedContactId = ref(null)
const modalContato = ref(false)
const modalImportarContatos = ref(false)
const file = ref(null)
const tags = ref([])

const params = reactive({
  searchParam: '',
  pageNumber: 1,
  hasMore: true,
  tagsIds: []
})

const pagination = ref({
  rowsPerPage: 40,
  rowsNumber: 0,
  lastIndex: 0
})

const columns = [
  {
    name: 'profilePicUrl',
    label: '',
    field: 'profilePicUrl',
    align: 'center',
    style: 'width: 50px'
  },
  { name: 'name', label: 'Nome', field: 'name', align: 'left', sortable: true },
  { name: 'number', label: 'Número', field: 'number', align: 'left' },
  { name: 'email', label: 'E-mail', field: 'email', align: 'left' },
  { name: 'acoes', label: 'Ações', field: 'acoes', align: 'center' }
]

const listarContatos = async () => {
  try {
    const data = await contatoStore.listarContatos(params)
    pagination.value.lastIndex = contatos.value.length - 1
    pagination.value.rowsNumber = data.count
  } catch (error) {
    notificarErro('Erro ao listar contatos', error)
  }
}

const filtrarContato = () => {
  params.pageNumber = 1
  listarContatos()
}

const onScroll = ({ to }) => {
  if (loading.value !== true && hasMore.value === true && to === pagination.value.lastIndex) {
    params.pageNumber++
    listarContatos()
  }
}

const editContact = id => {
  selectedContactId.value = id
  modalContato.value = true
}

const deleteContact = id => {
  $q.dialog({
    title: 'Atenção!!',
    message: 'Deseja realmente deletar o contato?',
    cancel: { label: 'Não', color: 'primary', push: true },
    ok: { label: 'Sim', color: 'negative', push: true },
    persistent: true
  }).onOk(async () => {
    try {
      await contatoStore.deletarContato(id)
      notificarSucesso('Contato deletado!')
    } catch (error) {
      notificarErro('Erro ao deletar contato', error)
    }
  })
}

const handleImportarContatos = async () => {
  if (!file.value) return
  const formData = new FormData()
  formData.append('file', file.value)
  if (tags.value.length > 0) {
    formData.append('tagsIds', JSON.stringify(tags.value))
  }
  try {
    await contatoStore.importarContatos(formData)
    notificarSucesso('Contatos importados com sucesso!')
    modalImportarContatos.value = false
    filtrarContato()
  } catch (error) {
    notificarErro('Erro ao importar contatos', error)
  }
}

const handleExportContacts = async () => {
  try {
    const data = await contatoStore.exportarContatos()
    const link = document.createElement('a')
    link.href = data.downloadLink
    link.setAttribute('download', 'contatos.xlsx')
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    notificarErro('Erro ao exportar contatos', error)
  }
}

const handleSaveTicket = async (contact, channel) => {
  if (!contact.number && channel === 'whatsapp') return
  try {
    const data = await ticketStore.criarTicket({
      contactId: contact.id,
      status: 'open',
      userId: localStorage.getItem('userId'),
      channel
    })
    ticketStore.setTicketFocado(data)
    // Redirecionar para atendimento ou abrir chat?
    // Aqui depende da lógica da aplicação. Geralmente redireciona.
  } catch (error) {
    notificarErro('Erro ao iniciar atendimento', error)
  }
}

onMounted(() => {
  etiquetaStore.listarEtiquetas(true)
  listarContatos()
})
</script>

<style lang="scss" scoped>
.heightChat {
  height: calc(100vh - 120px);
}

.height-fix {
  height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
}

.height-fix :deep(.q-table__container) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.height-fix :deep(.q-table__middle) {
  flex-grow: 1;
}
</style>
