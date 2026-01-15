<template>
  <q-dialog
    :value="modalMensagemRapida"
    @hide="fecharModal"
    @show="abrirModal"
    @keyup.esc="fecharModal"
  >
    <q-card
      :style="$q.screen.width < 500 ? 'width: 95vw' : 'min-width: 500px; max-width: 700px'"
      class="q-pa-lg"
    >
      <div class="text-h6">{{ mensagemRapida.id ? 'Editar' : 'Criar' }} Mensagem Rápida {{ mensagemRapida.id ? `(ID: ${mensagemRapida.id})` : '' }}</div>
      <q-card-section class="q-pa-none">
        <div class="row q-my-sx">
          <div class="col flex justify-center">
            <div class="column items-center">
              <q-input
                style="width: 300px;"
                outlined
                rounded
                dense
                v-model="mensagemRapida.key"
                label="Chave"
              />
              <p style="font-size: 14px; margin-top: 3px; text-align: center;">
                chave é o atalho para pesquisa da mensagem.
              </p>
            </div>
          </div>
        </div>

        <!-- Ícones para Emojis e Variáveis -->
        <div class="row items-center">
          <div class="col-xs-3 col-sm-2 col-md-1">
            <!-- Emoji Icon -->
            <q-btn
              round
              flat
              class="q-ml-sm"
            >
              <q-icon
                size="2em"
                name="mdi-emoticon-happy-outline"
              />
              <q-tooltip>
                Emoji
              </q-tooltip>
              <q-menu
                anchor="top right"
                self="bottom middle"
                :offset="[5, 40]"
              >
                <EmojiPicker
                  style="width: 40vw"
                  :showSearch="false"
                  :emojisByRow="20"
                  labelSearch="Localizar..."
                  lang="pt-BR"
                  @select="onInsertSelectEmoji"
                />
              </q-menu>
            </q-btn>

            <!-- Variáveis Icon -->
            <q-btn
              round
              flat
              class="q-ml-sm"
            >
              <q-icon
                size="2em"
                name="mdi-code-braces"
              />
              <q-tooltip>
                Variáveis
              </q-tooltip>
              <q-menu
                anchor="top right"
                self="bottom middle"
                :offset="[5, 40]"
              >
                <q-list padding>
                  <q-item
                    v-for="variavel in variaveis"
                    :key="variavel.value"
                    clickable
                    @click="inserirVariavel(variavel.value)"
                  >
                    <q-item-section>{{ variavel.label }}</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </div>

          <!-- Textarea for Message -->
          <div class="col-xs-8 col-sm-10 col-md-11 q-pl-sm">
            <label class="text-caption">Mensagem:</label>
            <textarea
              ref="inputEnvioMensagem"
              style="min-height: 15vh; max-height: 25vh;"
              class="q-pa-sm bg-white full-width rounded-all"
              placeholder="Digite a mensagem"
              autogrow
              dense
              outlined
              @input="(v) => mensagemRapida.message = v.target.value"
              :value="mensagemRapida.message"
            />
          </div>
        </div>

        <!-- Área de Preview -->
        <div v-if="mensagemRapida.medias && mensagemRapida.medias.length > 0" class="media-preview-container q-mb-sm">
          <!-- Previews dos Arquivos -->
          <div v-for="(media, index) in mensagemRapida.medias" :key="index" class="media-preview-item">
            <q-card class="media-preview-card">
              <q-img
                v-if="isImage(media)"
                :src="getMediaUrl(media)"
                class="media-preview-image cursor-pointer"
                fit="contain"
                @click="visualizarImagem(media)"
              >
                <template v-slot:error>
                  <div class="absolute-full flex flex-center bg-negative text-white">
                    Erro ao carregar imagem
                  </div>
                </template>
              </q-img>
              <video
                v-else-if="isVideo(media)"
                class="media-preview-video"
                controls
                :src="getMediaUrl(media)"
                :type="getMediaType(media)"
              >
                Seu navegador não suporta a reprodução de vídeos.
              </video>
              <div v-else class="file-preview-container flex flex-center column">
                <q-icon :name="getFileIcon(media)" size="64px" color="primary"/>
                <div class="text-subtitle2 q-mt-sm text-center text-truncate" style="max-width: 90%">
                  {{ getMediaFileName(media) }}
                </div>
              </div>
              <q-card-actions align="center" class="q-pa-sm bg-grey-2">
                <q-btn flat dense round icon="remove_red_eye" color="primary" @click="abrirMedia(media)">
                  <q-tooltip>Visualizar</q-tooltip>
                </q-btn>
                <q-btn flat dense round icon="delete" color="negative" @click="confirmarExclusao(media, index)">
                  <q-tooltip>Excluir</q-tooltip>
                </q-btn>
              </q-card-actions>
            </q-card>
          </div>
        </div>

        <input
          type="file"
          ref="fileInput"
          style="display: none"
          @change="onFileInputChange"
          multiple
          accept="apk/*,image/*,video/*,audio/*,application/pdf"
        />
      </q-card-section>

      <!-- Botões de ação -->
      <q-card-actions align="right" class="q-mt-md">
        <q-btn
          round
          color="primary"
          icon="attach_file"
          class="q-mr-md"
          @click="$refs.fileInput.click()"
        >
          <q-tooltip>Anexar Arquivo</q-tooltip>
        </q-btn>
        <q-btn rounded label="Cancelar" color="negative" v-close-popup class="q-mr-md" />
        <q-btn rounded label="Salvar" color="positive" @click="handleMensagemRapida" />
      </q-card-actions>
    </q-card>

    <!-- Modal de confirmação para exclusão -->
    <q-dialog v-model="confirmDialog" persistent>
      <q-card>
        <q-card-section>
          <div class="text-h6">Confirmação</div>
          <p>Tem certeza de que deseja excluir esta mídia?</p>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
          <q-btn flat label="Excluir" color="negative" @click="excluirMedia(mediaToDelete, indexToDelete)" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal de visualização da imagem -->
    <q-dialog
      v-model="showImageModal"
      :maximized="false"
      transition-show="fade"
      transition-hide="fade"
      @keyup.esc="showImageModal = false"
    >
      <q-card class="bg-dark text-white" style="min-width: 40vw; min-height: 40vh; max-width: 99vw; max-height: 99vh;">
        <q-bar class="bg-dark">
          <q-space />
          <q-btn dense flat icon="close" v-close-popup>
            <q-tooltip>Fechar</q-tooltip>
          </q-btn>
        </q-bar>

        <q-card-section class="flex flex-center" style="padding: 0;">
          <q-img
            :src="selectedImageUrl"
            fit="scale-down"
            style="min-width: 40vw; min-height: calc(40vh - 50px); max-width: 99vw; max-height: calc(99vh - 50px);"
            @load="onImageLoad"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-dialog>
</template>

<script>
import { CriarMensagemRapida, AlterarMensagemRapida, DeletarImagemMensagemRapida } from 'src/service/mensagensRapidas'
import EmojiPicker from 'vue3-emoji-picker'
import 'vue3-emoji-picker/css'

export default {
  name: 'ModalMensagemRapida',
  components: { EmojiPicker },
  props: {
    modalMensagemRapida: {
      type: Boolean,
      default: false
    },
    mensagemRapidaEmEdicao: {
      type: Object,
      default: () => {
        return { id: null, key: '', message: '', medias: [] }
      }
    }
  },
  data () {
    return {
      mensagemRapida: {
        key: null,
        message: '',
        medias: null
      },
      arquivoCarregado: null,
      loading: false,
      confirmDialog: false,
      mediaToDelete: null,
      indexToDelete: null,
      showImageModal: false,
      selectedImageUrl: '',
      variaveis: [
        { label: 'Nome', value: '{{name}}' },
        { label: 'Saudação', value: '{{greeting}}' },
        { label: 'Protocolo', value: '{{protocol}}' }
      ]
    }
  },
  methods: {
    onInsertSelectEmoji (emoji) {
      const self = this
      var tArea = this.$refs.inputEnvioMensagem
      var startPos = tArea.selectionStart,
        endPos = tArea.selectionEnd,
        cursorPos = startPos,
        tmpStr = tArea.value

      if (!emoji.data) {
        return
      }

      self.txtContent = this.mensagemRapida.message
      self.txtContent = tmpStr.substring(0, startPos) + emoji.data + tmpStr.substring(endPos, tmpStr.length)
      this.mensagemRapida.message = self.txtContent

      setTimeout(() => {
        tArea.selectionStart = tArea.selectionEnd = cursorPos + emoji.data.length
      }, 10)
    },
    inserirVariavel (variavel) {
      this.mensagemRapida.message += ' ' + variavel
    },
    onFileAdded (files) {
      if (!this.mensagemRapida.medias) {
        this.mensagemRapida.medias = []
      }
      this.mensagemRapida.medias = [...this.mensagemRapida.medias, ...files]
      this.arquivoCarregado = files
    },
    onFileInputChange (event) {
      const files = Array.from(event.target.files)
      this.onFileAdded(files)
      event.target.value = null // Limpa o input para permitir selecionar o mesmo arquivo novamente
    },
    abrirMedia (media) {
      const url = this.getMediaUrl(media)
      window.open(url, '_blank')
    },
    confirmarExclusao (media, index) {
      this.mediaToDelete = media
      this.indexToDelete = index
      this.confirmDialog = true
    },
    async excluirMedia (media, index) {
      try {
        this.confirmDialog = false
        await DeletarImagemMensagemRapida(this.mensagemRapida.id, media)
        this.$q.notify({
          type: 'positive',
          message: 'Imagem excluída com sucesso!'
        })
        this.mensagemRapida.medias.splice(index, 1)
      } catch (error) {
        console.error('Erro ao excluir a imagem:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Erro ao excluir a imagem.'
        })
      }
    },
    isImage (media) {
      if (media instanceof File) {
        return media.type.startsWith('image/')
      }
      return media.endsWith('.jpg') || media.endsWith('.jpeg') || media.endsWith('.png')
    },
    getMediaUrl (media) {
      if (media instanceof File) {
        return URL.createObjectURL(media)
      }
      return media
    },
    getMediaFileName (media) {
      if (media instanceof File) {
        return media.name
      }
      return media
    },
    getFileIcon (media) {
      const type = media instanceof File ? media.type : media.toLowerCase()
      if (type.includes('pdf')) return 'picture_as_pdf'
      if (type.includes('audio')) return 'audio_file'
      if (type.includes('video')) return 'video_file'
      if (type.includes('image')) return 'image'
      if (type.includes('apk')) return 'android'
      return 'insert_drive_file'
    },
    fecharModal () {
      this.$emit('update:mensagemRapidaEmEdicao', { id: null })
      this.$emit('update:modalMensagemRapida', false)
    },
    abrirModal () {
      if (this.mensagemRapidaEmEdicao.id) {
        this.mensagemRapida = { ...this.mensagemRapidaEmEdicao }
        console.log('Editando mensagem com ID:', this.mensagemRapida.id)
      } else {
        this.mensagemRapida = {
          key: null,
          message: '',
          medias: null
        }
      }
    },
    async handleMensagemRapida () {
      const formData = new FormData()
      formData.append('key', this.mensagemRapida.key)
      formData.append('message', this.mensagemRapida.message)

      if (this.mensagemRapida.medias) {
        this.mensagemRapida.medias.forEach((file) => {
          formData.append('medias', file instanceof File ? file : file)
        })
      }

      this.loading = true
      console.log('Mensagem ID:', this.mensagemRapida.id)

      try {
        if (this.mensagemRapida.id) {
          const { data } = await AlterarMensagemRapida(this.mensagemRapida.id, formData)
          this.$emit('mensagemRapida:editada', { ...this.mensagemRapida, ...data })
          this.$q.notify({
            type: 'info',
            progress: true,
            position: 'top',
            textColor: 'black',
            message: 'Mensagem Rápida editada!',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        } else {
          const { data } = await CriarMensagemRapida(formData)
          this.$emit('mensagemRapida:criada', data)
          this.$q.notify({
            type: 'positive',
            progress: true,
            position: 'top',
            message: 'Mensagem rápida criada!',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        }
        this.fecharModal()
      } catch (error) {
        console.error(error)
        this.$q.notify({
          type: 'negative',
          message: 'Erro ao salvar a mensagem.'
        })
      }
      this.loading = false
    },
    visualizarImagem (media) {
      this.selectedImageUrl = this.getMediaUrl(media)
      this.showImageModal = true
    },
    onImageLoad (info) {
      // Ajusta o tamanho do modal baseado no tamanho natural da imagem
      const img = new Image()
      img.src = this.selectedImageUrl
      img.onload = () => {
        const minWidth = window.innerWidth * 0.4
        const minHeight = window.innerHeight * 0.4
        const maxWidth = window.innerWidth * 0.99
        const maxHeight = window.innerHeight * 0.99
        // Calcula a proporção mantendo os limites mínimos e máximos
        let width = img.width
        let height = img.height
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width = width * ratio
        height = height * ratio
        // Garante os tamanhos mínimos
        width = Math.max(width, minWidth)
        height = Math.max(height, minHeight)
        // Atualiza o estilo do card do modal
        const card = document.querySelector('.q-dialog .q-card')
        if (card) {
          card.style.width = `${width}px`
          card.style.height = `${height + 40}px` // +50px para a barra superior
        }
      }
    },
    isVideo (media) {
      if (media instanceof File) {
        return media.type.startsWith('video/')
      }
      return media.endsWith('.mp4') || media.endsWith('.webm') || media.endsWith('.ogg')
    },
    getMediaType (media) {
      if (media instanceof File) {
        return media.type
      }
      if (media.endsWith('.mp4')) return 'video/mp4'
      if (media.endsWith('.webm')) return 'video/webm'
      if (media.endsWith('.ogg')) return 'video/ogg'
      return ''
    }
  },
  watch: {
    showVideoModal (newValue) {
      if (!newValue) {
        // Quando o modal é fechado, pausa todos os vídeos (preview e modal)
        const allVideos = document.querySelectorAll('.media-preview-video, .video-preview')
        allVideos.forEach(video => {
          if (video && !video.paused) {
            video.pause()
          }
        })
      }
    }
  }
}
</script>

<style scoped>
/* Estilos Comuns */
.common-background {
  background: #f5f5f5;
}

.common-flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

.common-responsive {
  width: 100%;
  object-fit: contain;
  margin: 0 auto;
}

/* Container Principal */
.media-preview-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center; /* Centraliza horizontalmente */
  align-items: center; /* Centraliza verticalmente */
  gap: 16px;
  padding: 8px;
  min-height: 350px;
  max-height: 600px;
  width: 100%; /* Ocupa toda a largura disponível */
  margin: 0 auto;
}

/* Itens de Pré-visualização */
.media-preview-item,
.file-preview-container {
  position: relative;
  min-height: 350px;
  max-height: 500px;
  min-width: 350px;
  max-width: 800px;
  display: flex;
  justify-content: center; /* Centraliza horizontalmente */
  align-items: center; /* Centraliza verticalmente */
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
}

/* Cartão de Pré-visualização */
.media-preview-card {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;
}

.media-preview-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 15px rgb(255, 255, 255);
  border-color: var(--q-primary);
}

/* Imagem e Vídeo */
.media-preview-image,
.media-preview-video,
.video-preview {
  width: 100%;
  height: 100%;
  object-fit: contain; /* Mantém a proporção da mídia */
  display: flex;
  justify-content: center;
  align-items: center;
  background: inherit;
}

/* Vídeo */
.media-preview-video {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #000; /* Fundo preto para vídeos */
  margin: 0 auto;
  display: block;
}

/* Container de Arquivo */
.file-preview-container {
  padding: 24px;
  flex-direction: column;
}

/* Ícone no Preview de Arquivo */
.file-preview-container .q-icon {
  font-size: 64px !important;
}

/* Texto Truncado */
.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 300px;
  margin: 0 auto;
  font-size: 0.9em;
  text-align: center;
}

/* Ações do Cartão */
.q-card-actions {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px;
  background: #f5f5f5;
  transition: all 0.3s ease;
}

.media-preview-card:hover .q-card-actions {
  background: #e0e0e0;
}

/* Botões de ação no hover */
.q-card-actions .q-btn {
  transition: transform 0.2s ease;
}

.q-card-actions .q-btn:hover {
  transform: scale(1.1);
}

/* Diálogo de Vídeo */
.video-preview-dialog {
  background: transparent !important;
}

.video-preview-dialog :deep(.q-dialog__backdrop) {
  background: black !important;
  opacity: 0.9 !important;
}

.video-preview-dialog .q-dialog__inner {
  background: transparent !important;
}

.video-preview-dialog video {
  max-width: 95%;
  max-height: 95%;
  margin: 0 auto;
  display: block;
}
</style>
