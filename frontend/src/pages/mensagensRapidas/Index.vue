<template>
  <div>
    <q-table
      flat
      bordered
      square
      hide-bottom
      class="my-sticky-dynamic q-ma-lg"
      title="Mensagens Rápidas"
      :data="mensagensRapidas"
      :columns="columns"
      :loading="loading"
      row-key="id"
      :pagination.sync="pagination"
      :rows-per-page-options="[0]"
    >
      <template v-slot:top-right>
        <q-btn
          color="primary"
          label="Adicionar"
          rounded
          @click="mensagemRapidaEmEdicao = {}; modalMensagemRapida = true"
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
          <div class="cursor-pointer" @mouseenter="showPopup = true" @mouseleave="showPopup = false">
            <q-icon
              v-if="props.value"
              name="mdi-attachment"
              size="24px"
              color="primary"
            >
              <q-popup-proxy hover escape-key>
                <q-card class="preview-card">
                  <q-card-section>
                    <div class="text-subtitle2">Anexos:</div>
                    <div v-for="(media, index) in props.row.medias" :key="index" class="q-mt-sm">
                      <div v-if="isImage(media)" class="row items-center justify-center preview-container">
                        <q-img
                          :src="getMediaUrl(media)"
                          class="preview-image"
                          fit="contain"
                        />
                      </div>
                      <div v-else-if="isVideo(media)" class="row items-center justify-center">
                        <q-icon name="movie" size="200px" color="primary"/>
                      </div>
                      <div v-else class="row items-center justify-center">
                        <q-icon :name="getFileIcon(media)" size="200px" color="primary"/>
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
          <q-btn
            flat
            round
            icon="edit"
            @click="editarMensagem(props.row)"
          />
          <q-btn
            flat
            round
            icon="mdi-delete"
            @click="deletarMensagem(props.row)"
          />
        </q-td>
      </template>
    </q-table>
    <ModalMensagemRapida
      :modalMensagemRapida.sync="modalMensagemRapida"
      :mensagemRapidaEmEdicao.sync="mensagemRapidaEmEdicao"
      @mensagemRapida:criada="mensagemCriada"
      @mensagemRapida:editada="mensagemEditada"
    />
  </div>
</template>

<script>
import ModalMensagemRapida from './ModalMensagemRapida'
import { ListarMensagensRapidas, DeletarMensagemRapida } from 'src/service/mensagensRapidas'
export default {
  name: 'MensagensRapidas',
  components: { ModalMensagemRapida },
  data () {
    return {
      loading: false,
      mensagensRapidas: [],
      modalMensagemRapida: false,
      mensagemRapidaEmEdicao: {},
      showPopup: false,
      columns: [
        { name: 'id', label: '#', field: 'id', align: 'left' },
        { name: 'key', label: 'Chave', field: 'key', align: 'left' },
        { name: 'message', label: 'Mensagem', field: 'message', align: 'left', classes: 'ellipsis', style: 'max-width: 400px;' },
        {
          name: 'hasAttachment',
          label: '',
          field: row => row.medias && row.medias.length > 0,
          align: 'center',
          format: val => val ? 'mdi-attachment' : '',
          style: 'width: 50px'
        },
        { name: 'acoes', label: 'Ações', field: 'acoes', align: 'center' }
      ],
      pagination: {
        rowsPerPage: 40,
        rowsNumber: 0,
        lastIndex: 0
      }
    }
  },
  methods: {
    async listarMensagensRapidas () {
      const { data } = await ListarMensagensRapidas()
      this.mensagensRapidas = data
    },
    mensagemCriada (mensagem) {
      this.mensagensRapidas.unshift(mensagem)
    },
    mensagemEditada (mensagem) {
      const newMensagens = [...this.mensagensRapidas]
      const idx = newMensagens.findIndex(m => m.id === mensagem.id)
      if (idx > -1) {
        newMensagens[idx] = mensagem
      }
      this.mensagensRapidas = [...newMensagens]
    },
    editarMensagem (mensagem) {
      this.mensagemRapidaEmEdicao = { ...mensagem }
      this.modalMensagemRapida = true
    },
    deletarMensagem (mensagem) {
      this.$q.dialog({
        title: 'Atenção!!',
        message: `Deseja realmente deletar a mensagem de chave "${mensagem.key}"?`,
        cancel: {
          label: 'Não',
          color: 'primary',
          push: true
        },
        ok: {
          label: 'Sim',
          color: 'negative',
          push: true
        },
        persistent: true
      }).onOk(() => {
        this.loading = true
        DeletarMensagemRapida(mensagem)
          .then(res => {
            let newMensagens = [...this.mensagensRapidas]
            newMensagens = newMensagens.filter(m => m.id !== mensagem.id)

            this.mensagensRapidas = [...newMensagens]
            this.$q.notify({
              type: 'positive',
              progress: true,
              position: 'top',
              message: 'Mensagem deletada!',
              actions: [{
                icon: 'close',
                round: true,
                color: 'white'
              }]
            })
          })
        this.loading = false
      })
    },
    isImage (media) {
      return media.endsWith('.jpg') || media.endsWith('.jpeg') || media.endsWith('.png') || media.endsWith('.gif')
    },
    isVideo (media) {
      return media.endsWith('.mp4') || media.endsWith('.webm') || media.endsWith('.ogg')
    },
    getFileIcon (media) {
      if (media.endsWith('.pdf')) return 'picture_as_pdf'
      if (media.endsWith('.mp3') || media.endsWith('.wav')) return 'audio_file'
      if (this.isVideo(media)) return 'video_file'
      if (this.isImage(media)) return 'image'
      if (media.endsWith('.apk')) return 'android'
      return 'insert_drive_file'
    },
    getFileType (media) {
      if (this.isImage(media)) return 'Imagem'
      if (this.isVideo(media)) return 'Vídeo'
      if (media.endsWith('.pdf')) return 'PDF'
      if (media.endsWith('.mp3') || media.endsWith('.wav')) return 'Áudio'
      if (media.endsWith('.apk')) return 'APK'
      return 'Arquivo'
    },
    getMediaUrl (media) {
      if (media instanceof File) {
        return URL.createObjectURL(media)
      }
      return media
    }
  },
  mounted () {
    this.listarMensagensRapidas()
  }
}
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
