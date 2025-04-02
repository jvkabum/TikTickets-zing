<template>
  <div>
    <q-card
      flat
      class="q-pa-sm q-pb-md"
    >
      <q-card-section
        style="min-height: 100px"
        class="q-pa-none"
      >
        <q-file
          style="display: none"
          :loading="loading"
          rounded
          label="Mídia composição mensagem"
          ref="PickerFileMessage"
          v-model="file"
          class="col-grow"
          bg-color="blue-grey-1"
          input-style="max-height: 30vh"
          outlined
          clearable
          autogrow
          append
          :max-files="1"
          counter
          :max-file-size="$attrs.element.data.maxSize"
          :max-total-size="$attrs.element.data.maxSize"
          :accept="$attrs.element.data.supportedTypes.join(', ')"
          @rejected="onRejectedFiles"
          @input="getMediaUrl"
        />
        <q-btn
          v-if="!$attrs.element.data.type"
          icon="mdi-file-plus-outline"
          @click="$refs.PickerFileMessage.pickFiles()"
          round
          flat
          size="lg"
          class="bg-grey-3 z-max q-pa-lg absolute-center"
        >
          <q-tooltip>
            Clique para adicionar um arquivo (máx. 10MB)
          </q-tooltip>
        </q-btn>

        <div class="text-center full-width hide-scrollbar no-scroll">
          <!-- Visualização de PDF -->
          <div v-if="cMediaUrl && $attrs.element.data.type === 'application/pdf'" class="q-mt-md">
            <iframe
              frameBorder="0"
              scrolling="no"
              style="max-height: 150px; width: 100%;"
              class="no-scroll hide-scrollbar"
              :src="cMediaUrl"
            >
              Faça download do PDF
            </iframe>
            <div class="text-caption q-mt-sm">
              Clique para visualizar o PDF completo
            </div>
          </div>

          <!-- Visualização de Vídeo -->
          <div v-if="cMediaUrl && $attrs.element.data.type.indexOf('video') !== -1" class="q-mt-md">
            <video
              :src="cMediaUrl"
              controls
              style="width: 100%; max-height: 200px; object-fit: contain; border-radius: 8px;"
              type="video/mp4"
            >
              Seu navegador não suporta a reprodução de vídeos.
            </video>
          </div>

          <!-- Visualização de Áudio -->
          <div v-if="cMediaUrl && $attrs.element.data.type.indexOf('audio') !== -1" class="q-mt-md">
            <audio
              class="full-width"
              controls
              :src="cMediaUrl"
            >
              Seu navegador não suporta a reprodução de áudio.
            </audio>
          </div>

          <!-- Visualização de Imagem -->
          <div v-if="cMediaUrl && $attrs.element.data.type.indexOf('image') !== -1" class="q-mt-md">
            <q-img
              @click="abrirModalImagem=true"
              :src="cMediaUrl"
              spinner-color="primary"
              style="max-height: 200px; cursor: pointer; border-radius: 8px;"
              fit="contain"
            />
            <div class="text-caption q-mt-sm">
              Clique na imagem para ampliar
            </div>
          </div>

          <!-- Visualização de outros tipos de arquivo -->
          <div v-if="cMediaUrl && !['application/pdf', 'video', 'audio', 'image'].some(type => $attrs.element.data.type.indexOf(type) !== -1)" class="q-mt-md">
            <q-icon
              :name="getFileIcon($attrs.element.data.name)"
              size="80px"
            />
            <div class="text-caption q-mt-sm">
              {{ $attrs.element.data.name }}
            </div>
          </div>
        </div>

        <!-- Legenda do arquivo -->
        <div v-if="cMediaUrl" class="q-mt-md">
          <q-input
            v-model="$attrs.element.data.caption"
            label="Legenda"
            dense
            outlined
            rounded
            placeholder="Digite uma legenda para o arquivo"
          />
        </div>

        <!-- Botões de ação -->
        <div v-if="cMediaUrl" class="row justify-end q-mt-sm">
          <q-btn
            flat
            class="bg-padrao btn-rounded q-ma-sm"
            color="primary"
            no-caps
            icon="mdi-image-edit-outline"
            @click="$refs.PickerFileMessage.pickFiles()"
          >
            <q-tooltip>
              Substituir Arquivo
            </q-tooltip>
          </q-btn>
          <q-btn
            flat
            class="bg-padrao btn-rounded q-ma-sm"
            color="negative"
            no-caps
            icon="mdi-delete-outline"
            @click="clearFile"
          >
            <q-tooltip>
              Remover Arquivo
            </q-tooltip>
          </q-btn>
        </div>

        <VueEasyLightbox
          v-if="cMediaUrl && $attrs.element.data.type.indexOf('image') != -1"
          :visible="abrirModalImagem"
          :imgs="cMediaUrl"
          :index="1"
          @hide="abrirModalImagem = false;"
        />
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import VueEasyLightbox from 'vue-easy-lightbox'

export default {
  name: 'MediaField',
  components: { VueEasyLightbox },
  data () {
    return {
      mediaUrl: '',
      file: [],
      abrirModalImagem: false,
      loading: false,
      name: '',
      icons: {
        xls: 'mdi-microsoft-excel',
        xlsx: 'mdi-microsoft-excel',
        doc: 'mdi-file-word',
        docx: 'mdi-file-word',
        zip: 'mdi-folder-zip-outline',
        ppt: 'mdi-microsoft-powerpoint',
        pptx: 'mdi-microsoft-powerpoint'
      }
    }
  },
  computed: {
    cMediaUrl () {
      if (this.$attrs.element.data?.mediaUrl) {
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.mediaUrl = this.$attrs.element.data.mediaUrl
        return this.mediaUrl
      }
      if (!this.$attrs.element.data?.mediaUrl && this.file.type) {
        this.getMediaUrl()
        return this.mediaUrl
      }
      return ''
    }
  },
  methods: {
    async getMediaUrl () {
      let url = ''
      if (this.file?.type) {
        const blob = new Blob([this.file], { type: this.file.type })
        url = window.URL.createObjectURL(blob)
        this.$attrs.element.data.mediaUrl = url
        const base64 = await this.getBase64(this.file)
        this.$attrs.element.data.ext = this.getFileExtension(this.file.name)
        this.$attrs.element.data.media = base64
        this.$attrs.element.data.type = this.file.type
        this.$attrs.element.data.name = this.file.name
      } else {
        this.mediaUrl = this.$attrs.element.data.mediaUrl
      }
    },
    getNewMediaUrl () {
      if (this.$attrs.element.data?.mediaUrl) {
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.mediaUrl = this.$attrs.element.data.mediaUrl
        return this.mediaUrl
      }
      if (!this.$attrs.element.data?.mediaUrl && this.file.type) {
        return this.getMediaUrl()
      } else {
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        // this.mediaUrl = ''
        return this.mediaUrl
      }
    },
    getFileExtension (name) {
      if (!name) return ''
      const split = name.split('.')
      const ext = split[split.length - 1]
      return ext
    },
    getFileIcon (name) {
      return this.icons[this.getFileExtension(name)]
    },
    getBase64 (file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => resolve(reader.result)
        reader.onerror = error => reject(error)
      })
    },
    onRejectedFiles (rejectedEntries) {
      rejectedEntries.forEach(entry => {
        let message = ''
        if (entry.failedPropValidation === 'max-file-size') {
          message = `O arquivo "${entry.file.name}" excede o tamanho máximo permitido de 10MB.`
        } else if (entry.failedPropValidation === 'accept') {
          message = `O tipo de arquivo "${entry.file.name}" não é suportado.`
        } else {
          message = `O arquivo "${entry.file.name}" foi rejeitado.`
        }
        this.$q.notify({
          type: 'negative',
          message: message,
          position: 'top',
          timeout: 3000
        })
      })
    },
    clearFile () {
      this.$q.dialog({
        title: 'Confirmação',
        message: 'Deseja realmente remover este arquivo?',
        cancel: {
          label: 'Não',
          flat: true,
          color: 'primary'
        },
        ok: {
          label: 'Sim',
          flat: true,
          color: 'negative'
        },
        persistent: true
      }).onOk(() => {
        this.file = null
        this.$attrs.element.data.mediaUrl = ''
        this.$attrs.element.data.media = ''
        this.$attrs.element.data.type = ''
        this.$attrs.element.data.name = ''
        this.$attrs.element.data.ext = ''
        this.$attrs.element.data.caption = ''
      })
    }
  }
}
</script>

<style lang="scss" scoped>
#imagemfield > .q-img__content > div {
  padding: 0 !important;
  background: none; // rgba(0, 0, 0, 0.47);
}
</style>
