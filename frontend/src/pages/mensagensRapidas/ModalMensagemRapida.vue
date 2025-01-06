<template>
  <q-dialog
    persistent
    :value="modalMensagemRapida"
    @hide="fecharModal"
    @show="abrirModal"
  >
    <q-card
      :style="$q.screen.width < 500 ? 'width: 95vw' : 'min-width: 700px; max-width: 700px'"
      class="q-pa-lg"
    >
      <div class="text-h6">{{ mensagemRapida.id ? 'Editar' : 'Criar' }} Mensagem Rápida {{ mensagemRapida.id ? `(ID: ${mensagemRapida.id})` : '' }}</div>
      <q-card-section class="q-pa-none">
        <div class="row q-my-md">
          <div class="col">
            <q-input
              style="width: 200px; margin-left: 62px"
              outlined
              rounded
              dense
              v-model="mensagemRapida.key"
              label="Chave"
            />
            <p style="margin-left: 62px; font-size: 10px; margin-top: 3px;">
              A chave é o atalho para pesquisa da mensagem pelos usuários.
            </p>
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
                <VEmojiPicker
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
              style="min-height: 15vh; max-height: 15vh;"
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

        <!-- Uploader de Arquivos -->
        <div class="row q-my-md">
          <q-uploader
            url=""
            label="Anexar Arquivos"
            @added="onFileAdded"
            :auto-upload="false"
            multiple
            accept="apk/*,image/*,video/*,audio/*,application/pdf"
          />
        </div>

        <!-- Exibição das mídias anexadas -->
        <div v-if="mensagemRapida.medias && mensagemRapida.medias.length" class="media-container">
          <div v-for="(media, index) in mensagemRapida.medias" :key="index" class="media-item">
            <q-card class="q-mb-md q-pa-none media-card">
              <q-card-section>
                <!-- Verifica se é uma imagem, senão exibe o ícone de arquivo -->
                <img v-if="isImage(media)" :src="getMediaUrl(media)" alt="Preview" class="media-image" />
                <q-icon v-else name="mdi-file-outline" class="file-icon" />
              </q-card-section>
              <q-card-actions align="center" class="q-pa-none">
                <!-- Ícones para Abrir e Excluir -->
                <q-btn flat @click="abrirMedia(media)">
                  <q-icon name="mdi-eye" />
                  <q-tooltip>Ver</q-tooltip>
                </q-btn>
                <q-btn flat color="negative" @click="confirmarExclusao(media, index)">
                  <q-icon name="mdi-delete" />
                  <q-tooltip>Excluir</q-tooltip>
                </q-btn>
              </q-card-actions>
            </q-card>
          </div>
        </div>
      </q-card-section>

      <!-- Botões de ação -->
      <q-card-actions align="right" class="q-mt-md">
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
  </q-dialog>
</template>

<script>
import { CriarMensagemRapida, AlterarMensagemRapida, DeletarImagemMensagemRapida } from 'src/service/mensagensRapidas'
import { VEmojiPicker } from 'v-emoji-picker'

export default {
  name: 'ModalMensagemRapida',
  components: { VEmojiPicker },
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
      this.mensagemRapida.medias = files
      this.arquivoCarregado = files
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
    }
  }
}
</script>

<style scoped>
.q-uploader {
  width: 100%;
  margin-top: 20px;
}

.media-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
}

.media-item {
  margin-right: 10px;
  margin-bottom: 10px;
}

.media-card {
  width: 150px;
  height: 150px;
  border-radius: 10px;
  border: 1px solid #ccc;
}

.media-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 10px 10px 0 0;
}

.file-icon {
  font-size: 48px;
  text-align: center;
  margin-top: 30px;
}

.q-btn {
  margin-right: 10px;
}
</style>
