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
          :max-file-size="element.data.maxSize"
          :max-total-size="element.data.maxSize"
          :accept="element.data.supportedTypes?.join(', ')"
          @rejected="onRejectedFiles"
          @update:model-value="getMediaUrl"
        />
        <q-btn
          v-if="!element.data.type"
          icon="mdi-file-plus-outline"
          @click="PickerFileMessage.pickFiles()"
          round
          flat
          size="lg"
          class="bg-grey-3 z-max q-pa-lg absolute-center"
        >
          <q-tooltip> Clique para adicionar um arquivo (máx. 10MB) </q-tooltip>
        </q-btn>

        <div class="text-center full-width hide-scrollbar no-scroll">
          <!-- Visualização de PDF -->
          <div
            v-if="cMediaUrl && element.data.type === 'application/pdf'"
            class="q-mt-md"
          >
            <iframe
              frameBorder="0"
              scrolling="no"
              style="max-height: 150px; width: 100%"
              class="no-scroll hide-scrollbar"
              :src="cMediaUrl"
            >
              Faça download do PDF
            </iframe>
            <div class="text-caption q-mt-sm">Clique para visualizar o PDF completo</div>
          </div>

          <!-- Visualização de Vídeo -->
          <div
            v-if="cMediaUrl && element.data.type?.indexOf('video') !== -1"
            class="q-mt-md"
          >
            <video
              :src="cMediaUrl"
              controls
              style="width: 100%; max-height: 200px; object-fit: contain; border-radius: 8px"
              type="video/mp4"
            >
              Seu navegador não suporta a reprodução de vídeos.
            </video>
          </div>

          <!-- Visualização de Áudio -->
          <div
            v-if="cMediaUrl && element.data.type?.indexOf('audio') !== -1"
            class="q-mt-md"
          >
            <audio
              class="full-width"
              controls
              :src="cMediaUrl"
            >
              Seu navegador não suporta a reprodução de áudio.
            </audio>
          </div>

          <!-- Visualização de Imagem -->
          <div
            v-if="cMediaUrl && element.data.type?.indexOf('image') !== -1"
            class="q-mt-md"
          >
            <q-img
              @click="abrirModalImagem = true"
              :src="cMediaUrl"
              spinner-color="primary"
              style="max-height: 200px; cursor: pointer; border-radius: 8px"
              fit="contain"
            />
            <div class="text-caption q-mt-sm">Clique na imagem para ampliar</div>
          </div>

          <!-- Visualização de outros tipos de arquivo -->
          <div
            v-if="
              cMediaUrl &&
              element.data.type &&
              !['application/pdf', 'video', 'audio', 'image'].some(type => element.data.type.indexOf(type) !== -1)
            "
            class="q-mt-md"
          >
            <q-icon
              :name="getFileIcon(element.data.name)"
              size="80px"
            />
            <div class="text-caption q-mt-sm">
              {{ element.data.name }}
            </div>
          </div>
        </div>

        <!-- Legenda do arquivo -->
        <div
          v-if="cMediaUrl"
          class="q-mt-md"
        >
          <q-input
            v-model="element.data.caption"
            label="Legenda"
            dense
            outlined
            rounded
            placeholder="Digite uma legenda para o arquivo"
          />
        </div>

        <!-- Botões de ação -->
        <div
          v-if="cMediaUrl"
          class="row justify-end q-mt-sm"
        >
          <q-btn
            flat
            class="bg-padrao btn-rounded q-ma-sm"
            color="primary"
            no-caps
            icon="mdi-image-edit-outline"
            @click="PickerFileMessage.pickFiles()"
          >
            <q-tooltip> Substituir Arquivo </q-tooltip>
          </q-btn>
          <q-btn
            flat
            class="bg-padrao btn-rounded q-ma-sm"
            color="negative"
            no-caps
            icon="mdi-delete-outline"
            @click="clearFile"
          >
            <q-tooltip> Remover Arquivo </q-tooltip>
          </q-btn>
        </div>

        <VueEasyLightbox
          v-if="cMediaUrl && element.data.type?.indexOf('image') != -1"
          :visible="abrirModalImagem"
          :imgs="cMediaUrl"
          :index="1"
          @hide="abrirModalImagem = false"
        />
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { computed, ref } from 'vue'
import VueEasyLightbox from 'vue-easy-lightbox'

const props = defineProps({
  element: {
    type: Object,
    required: true
  }
})

const $q = useQuasar()
const PickerFileMessage = ref(null)
const file = ref(null)
const abrirModalImagem = ref(false)
const loading = ref(false)

const icons = {
  xls: 'mdi-microsoft-excel',
  xlsx: 'mdi-microsoft-excel',
  doc: 'mdi-file-word',
  docx: 'mdi-file-word',
  zip: 'mdi-folder-zip-outline',
  ppt: 'mdi-microsoft-powerpoint',
  pptx: 'mdi-microsoft-powerpoint'
}

const cMediaUrl = computed(() => {
  return props.element.data?.mediaUrl || ''
})

const getFileExtension = name => {
  if (!name) return ''
  const split = name.split('.')
  return split[split.length - 1].toLowerCase()
}

const getFileIcon = name => {
  return icons[getFileExtension(name)] || 'mdi-file-outline'
}

const getBase64 = fileData => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(fileData)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
  })
}

const getMediaUrl = async newFile => {
  if (newFile) {
    loading.value = true
    try {
      const blob = new Blob([newFile], { type: newFile.type })
      const url = window.URL.createObjectURL(blob)
      props.element.data.mediaUrl = url
      const base64 = await getBase64(newFile)
      props.element.data.ext = getFileExtension(newFile.name)
      props.element.data.media = base64
      props.element.data.type = newFile.type
      props.element.data.name = newFile.name
    } catch (err) {
      console.error(err)
    } finally {
      loading.value = false
    }
  }
}

const onRejectedFiles = rejectedEntries => {
  rejectedEntries.forEach(entry => {
    let message = ''
    if (entry.failedPropValidation === 'max-file-size') {
      message = `O arquivo "${entry.file.name}" excede o tamanho máximo permitido de 10MB.`
    } else if (entry.failedPropValidation === 'accept') {
      message = `O tipo de arquivo "${entry.file.name}" não é suportado.`
    } else {
      message = `O arquivo "${entry.file.name}" foi rejeitado.`
    }
    $q.notify({ type: 'negative', message, position: 'top', timeout: 3000 })
  })
}

const clearFile = () => {
  $q.dialog({
    title: 'Confirmação',
    message: 'Deseja realmente remover este arquivo?',
    cancel: { label: 'Não', flat: true, color: 'primary' },
    ok: { label: 'Sim', flat: true, color: 'negative' },
    persistent: true
  }).onOk(() => {
    file.value = null
    props.element.data.mediaUrl = ''
    props.element.data.media = ''
    props.element.data.type = ''
    props.element.data.name = ''
    props.element.data.ext = ''
    props.element.data.caption = ''
  })
}
</script>

<style lang="scss" scoped>
:deep(.q-img__content > div) {
  padding: 0 !important;
  background: none;
}
</style>
