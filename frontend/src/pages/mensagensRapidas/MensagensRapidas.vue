<template>
  <div>
    <q-table
      class="my-sticky-dynamic q-ma-lg shadow-premium"
      title="Mensagens Rápidas"
      :rows="mensagensRapidas"
      :columns="columns"
      :loading="loading"
      row-key="id"
      v-model:pagination="pagination"
      :rows-per-page-options="[0]"
    >
      <template v-slot:top-right>
        <q-btn
          color="primary"
          label="Adicionar"
          rounded
          @click="
            () => {
              mensagemRapidaEmEdicao = {}
              modalMensagemRapida = true
            }
          "
        />
      </template>
      <template v-slot:body-cell-isActive="props">
        <q-td class="text-center">
          <q-icon
            size="24px"
            :name="props.value ? 'mdi-check-circle-outline' : 'mdi-close-circle-outline'"
            :color="props.value ? 'positive' : 'negative'"
          />
        </q-td>
      </template>
      <template v-slot:body-cell-hasAttachment="props">
        <q-td class="text-center">
          <div
            class="cursor-pointer"
            @mouseenter="showPopup = true"
            @mouseleave="showPopup = false"
          >
            <q-icon
              v-if="props.value"
              name="mdi-attachment"
              size="24px"
              color="primary"
            >
              <q-popup-proxy
                hover
                escape-key
              >
                <q-card class="preview-card">
                  <q-card-section>
                    <div class="text-subtitle2">Anexos:</div>
                    <div
                      v-for="(media, index) in props.row.medias"
                      :key="index"
                      class="q-mt-sm"
                    >
                      <div
                        v-if="isImage(media)"
                        class="row items-center justify-center preview-container"
                      >
                        <q-img
                          :src="getMediaUrl(media)"
                          class="preview-image"
                          fit="contain"
                        />
                      </div>
                      <div
                        v-else-if="isVideo(media)"
                        class="row items-center justify-center"
                      >
                        <q-icon
                          name="movie"
                          size="200px"
                          color="primary"
                        />
                      </div>
                      <div
                        v-else
                        class="row items-center justify-center"
                      >
                        <q-icon
                          :name="getFileIcon(media)"
                          size="200px"
                          color="primary"
                        />
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </q-popup-proxy>
            </q-icon>
          </div>
        </q-td>
      </template>
      <template v-slot:body-cell-acoes="props">
        <q-td class="text-center">
          <div class="row items-center justify-center no-wrap q-gutter-xs">
            <q-btn
              color="primary"
              flat
              round
              icon="edit"
              @click="editarMensagem(props.row)"
            />
            <q-btn
              color="negative"
              flat
              round
              icon="mdi-delete"
              @click="handleDeletarMensagem(props.row)"
            />
          </div>
        </q-td>
      </template>
    </q-table>
    <ModalMensagemRapida
      v-model:modalMensagemRapida="modalMensagemRapida"
      v-model:mensagemRapidaEmEdicao="mensagemRapidaEmEdicao"
      @mensagemRapida:criada="mensagemCriada"
      @mensagemRapida:editada="mensagemEditada"
    />
  </div>
</template>

<script setup>
import ModalMensagemRapida from './ModalMensagemRapida.vue'

const mensagemRapidaStore = useMensagemRapidaStore()
const { mensagensRapidas, loading } = storeToRefs(mensagemRapidaStore)
const { listarMensagensRapidas, deletarMensagemRapida } = mensagemRapidaStore

const modalMensagemRapida = ref(false)
const mensagemRapidaEmEdicao = ref({})
const showPopup = ref(false)

const pagination = ref({
  rowsPerPage: 40,
  rowsNumber: 0,
  lastIndex: 0
})

const columns = [
  { name: 'id', label: '#', field: 'id', align: 'left' },
  { name: 'key', label: 'Chave', field: 'key', align: 'left' },
  {
    name: 'message',
    label: 'Mensagem',
    field: 'message',
    align: 'left',
    classes: 'ellipsis',
    style: 'max-width: 400px;'
  },
  {
    name: 'hasAttachment',
    label: '',
    field: row => row.medias && row.medias.length > 0,
    align: 'center',
    format: val => (val ? 'mdi-attachment' : ''),
    style: 'width: 50px'
  },
  { name: 'acoes', label: 'Ações', field: 'acoes', align: 'center' }
]

const isImage = media => {
  return (
    typeof media === 'string' &&
    (media.endsWith('.jpg') || media.endsWith('.jpeg') || media.endsWith('.png') || media.endsWith('.gif'))
  )
}

const isVideo = media => {
  return typeof media === 'string' && (media.endsWith('.mp4') || media.endsWith('.webm') || media.endsWith('.ogg'))
}

const getFileIcon = media => {
  if (typeof media !== 'string') return 'insert_drive_file'
  if (media.endsWith('.pdf')) return 'picture_as_pdf'
  if (media.endsWith('.mp3') || media.endsWith('.wav')) return 'audio_file'
  if (isVideo(media)) return 'video_file'
  if (isImage(media)) return 'image'
  if (media.endsWith('.apk')) return 'android'
  return 'insert_drive_file'
}

const getMediaUrl = media => {
  if (media instanceof File) {
    return URL.createObjectURL(media)
  }
  return media
}

const mensagemCriada = mensagem => {
  // Store updates automatically, no local state management needed.
}

const mensagemEditada = mensagem => {
  // Store updates automatically, no local state management needed.
}

const editarMensagem = mensagem => {
  mensagemRapidaEmEdicao.value = { ...mensagem }
  modalMensagemRapida.value = true
}

const handleDeletarMensagem = mensagem => {
  $q.dialog({
    title: 'Atenção!!',
    message: `Deseja realmente deletar a mensagem de chave "${mensagem.key}"?`,
    cancel: { label: 'Não', color: 'primary', push: true },
    ok: { label: 'Sim', color: 'negative', push: true },
    persistent: true
  }).onOk(async () => {
    try {
      await deletarMensagemRapida(mensagem)
      $q.notify({
        type: 'positive',
        message: 'Mensagem deletada!',
        position: 'top'
      })
    } catch (error) {
      console.error(error)
    }
  })
}

onMounted(() => {
  listarMensagensRapidas()
})
</script>

<style lang="scss" scoped>
.preview-card {
  min-width: 300px;
  max-width: 600px;
  min-height: 200px;
  padding: 10px;
}

.preview-container {
  width: 100%;
  height: 100%;
  min-height: 200px;
  max-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 4px;
}

.q-img {
  width: 100%;
  height: 100%;
  min-height: 200px;
  max-height: 400px;
}
</style>
