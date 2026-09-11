<template>
  <div
    :style="[
      isDeleted ? 'color: rgba(0, 0, 0, 0.36) !important;' : '',
      ['image', 'video'].includes(mediaType)
        ? 'min-width: 100px;'
        : 'min-width: 100px; max-width: 500px;'
    ]"
    class="relative-position"
  >
    <slot name="checkbox-forward"></slot>

    <!-- Audio -->
    <template v-if="mediaType === 'audio'">
      <AudioVisualizer
        :url="sanitizedMediaUrl"
        :contact="contact"
        :avatar-src="fromMe ? myAvatar : contactAvatar"
      />
    </template>

    <!-- VCard -->
    <template v-else-if="mediaType === 'vcard'">
      <WhatsAppVCard
        :mensagem="mensagem"
        @open-contact-modal="$emit('open-contact-modal', $event)"
      />
    </template>

    <!-- Image -->
    <template v-else-if="isImage">
      <MediaViewer
        media-type="image"
        :media-url="sanitizedMediaUrl"
      />
    </template>

    <!-- Video -->
    <template v-else-if="isVideo">
      <MediaViewer
        media-type="video"
        :media-url="sanitizedMediaUrl"
      />
    </template>

    <!-- Poll Creation -->
    <template v-else-if="mediaType === 'poll_creation'">
      <div class="poll-container q-pa-sm rounded-borders bg-grey-10 text-white">
        <div class="text-bold row items-center no-wrap">
          <q-icon
            name="poll"
            class="q-mr-xs"
          />
          {{ pollData?.name || 'Enquete' }}
        </div>
        <div class="text-caption opacity-70 q-mb-xs">{{ totalVotes }} votos</div>
        <div
          v-for="opt in pollData?.options"
          :key="opt.name"
          class="q-mb-xs"
        >
          <div class="row items-center justify-between no-wrap">
            <span class="ellipsis">{{ opt.name }}</span>
            <span class="text-caption">{{ opt.votes || 0 }}</span>
          </div>
          <q-linear-progress
            :value="getVotePercentage(opt, pollData.options) / 100"
            color="secondary"
          />
        </div>
      </div>
    </template>
    
    <!-- PDF Document -->
    <template v-else-if="isPdf && sanitizedMediaUrl">
      <div class="pdf-card-container column rounded-borders overflow-hidden">
        <!-- Compact Preview (1ª Página) -->
        <div
          class="pdf-preview-cover cursor-pointer relative-position"
          @click="showPdfDialog = true"
        >
          <PdfViewer
            :url="sanitizedMediaUrl"
            :file-name="pdfFileName"
            compact
          />
          <div class="pdf-hover-overlay absolute-full flex flex-center">
            <q-btn
              round
              color="dark"
              text-color="white"
              icon="mdi-fullscreen"
              size="sm"
              class="shadow-5"
            >
              <q-tooltip>Visualizar PDF</q-tooltip>
            </q-btn>
          </div>
        </div>

        <!-- File Meta Card -->
        <div
          class="pdf-meta-bar row items-center no-wrap q-pa-xs cursor-pointer"
          @click="showPdfDialog = true"
        >
          <div class="pdf-icon-badge flex flex-center q-mr-sm">
            <q-icon
              name="mdi-file-pdf-box"
              size="32px"
              color="negative"
            />
          </div>
          <div class="col ellipsis">
            <div class="text-weight-bold text-caption ellipsis">
              {{ pdfFileName }}
            </div>
            <div class="text-caption text-grey-7" style="font-size: 10px; font-weight: 600">
              PDF • TOQUE PARA VISUALIZAR
            </div>
          </div>
          <q-btn
            flat
            round
            dense
            icon="mdi-fullscreen"
            color="primary"
            size="sm"
          />
        </div>

        <!-- Fullscreen PDF Modal -->
        <q-dialog
          v-model="showPdfDialog"
          maximized
          transition-show="slide-up"
          transition-hide="slide-down"
        >
          <q-card class="bg-grey-10 text-white column full-height no-scroll">
            <q-bar class="bg-black text-white q-py-sm">
              <q-icon
                name="mdi-file-pdf-box"
                color="negative"
                size="24px"
              />
              <span class="text-weight-bold q-ml-xs ellipsis">{{ pdfFileName }}</span>
              <q-space />
              <q-btn
                dense
                flat
                icon="mdi-close"
                v-close-popup
              >
                <q-tooltip>Fechar</q-tooltip>
              </q-btn>
            </q-bar>

            <q-card-section class="col q-pa-none overflow-hidden">
              <PdfViewer
                :url="sanitizedMediaUrl"
                :file-name="pdfFileName"
                :compact="false"
              />
            </q-card-section>
          </q-card>
        </q-dialog>
      </div>
    </template>

    <!-- Generic Document / File -->
    <template v-else-if="['document', 'application'].includes(mediaType) || (sanitizedMediaUrl && !['image', 'video', 'audio', 'poll_creation'].includes(mediaType))">
      <a
        :href="sanitizedMediaUrl"
        target="_blank"
        download
        class="generic-doc-card row items-center no-wrap q-pa-sm rounded-borders text-inherit"
        style="text-decoration: none"
      >
        <div class="flex flex-center q-mr-sm bg-primary-10 q-pa-xs rounded-borders">
          <q-icon
            name="mdi-file-document-outline"
            size="28px"
            color="primary"
          />
        </div>
        <div class="col ellipsis">
          <div class="text-weight-bold text-caption ellipsis">
            {{ mensagem.body || 'Arquivo anexado' }}
          </div>
          <div class="text-caption text-grey-7" style="font-size: 10px; font-weight: 600">
            CLIQUE PARA BAIXAR
          </div>
        </div>
        <q-btn
          flat
          round
          dense
          icon="mdi-download"
          color="primary"
          size="sm"
        />
      </a>
    </template>
    
    <slot name="options-menu"></slot>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import AudioVisualizer from 'src/components/chat/AudioVisualizer.vue'
import WhatsAppVCard from 'src/components/chat/WhatsAppVCard.vue'
import MediaViewer from 'src/components/utils/MediaViewer/MediaViewer.vue'
import PdfViewer from 'src/components/chat/PdfViewer.vue'

const props = defineProps({
  mensagem: {
    type: Object,
    required: true
  },
  mediaType: {
    type: String,
    required: true
  },
  mediaUrl: {
    type: String,
    default: ''
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  contact: {
    type: Object,
    default: null
  },
  fromMe: {
    type: Boolean,
    default: false
  },
  myAvatar: {
    type: String,
    default: ''
  },
  contactAvatar: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['open-contact-modal'])

const showPdfDialog = ref(false)

const sanitizedMediaUrl = computed(() => {
  let url = props.mediaUrl || ''
  if (!url && props.mensagem?.mediaUrl) {
    url = props.mensagem.mediaUrl
  }
  if (!url && props.mensagem?.body && /\.(jpg|jpeg|png|webp|gif|pdf|mp4|ogg|mp3)$/i.test(props.mensagem.body)) {
    url = `/public/uploads/${props.mensagem.body}`
  }
  if (!url) return ''
  url = url.replace(/:(\d+):443\//, ':$1/')
  if (url.startsWith('/public') || url.startsWith('/uploads')) {
    const backendUrl = process.env.VUE_URL_API || ''
    url = `${backendUrl.replace(/\/$/, '')}${url}`
  }
  return url
})

const isImage = computed(() => {
  const url = sanitizedMediaUrl.value?.toLowerCase() || ''
  const body = props.mensagem?.body?.toLowerCase() || ''
  const type = props.mediaType?.toLowerCase() || ''
  return type === 'image' || /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(url) || /\.(jpg|jpeg|png|webp|gif)$/i.test(body)
})

const isVideo = computed(() => {
  const url = sanitizedMediaUrl.value?.toLowerCase() || ''
  const body = props.mensagem?.body?.toLowerCase() || ''
  const type = props.mediaType?.toLowerCase() || ''
  return type === 'video' || /\.(mp4|m4v|webm|mov)(\?|$)/i.test(url) || /\.(mp4|m4v|webm|mov)$/i.test(body)
})

const isPdf = computed(() => {
  const url = sanitizedMediaUrl.value?.toLowerCase() || ''
  const body = props.mensagem?.body?.toLowerCase() || ''
  const type = props.mediaType?.toLowerCase() || ''
  return type.includes('pdf') || url.endsWith('.pdf') || url.includes('.pdf?') || body.endsWith('.pdf')
})

const pdfFileName = computed(() => {
  if (props.mensagem?.body && props.mensagem.body.toLowerCase().endsWith('.pdf')) {
    return props.mensagem.body
  }
  if (sanitizedMediaUrl.value) {
    const parts = sanitizedMediaUrl.value.split('/')
    return parts[parts.length - 1].split('?')[0] || 'documento.pdf'
  }
  return 'documento.pdf'
})

const pollData = computed(() => props.mensagem.pollData)

const totalVotes = computed(() => {
  return pollData.value?.options?.reduce((acc, curr) => acc + (curr.votes || 0), 0) || 0
})

const getVotePercentage = (option, options) => {
  if (!options) return 0
  const total = options.reduce((acc, curr) => acc + (curr.votes || 0), 0)
  if (total === 0) return 0
  return ((option.votes || 0) / total) * 100
}
</script>

<style scoped>
.poll-container {
  min-width: 250px;
}

.pdf-card-container {
  min-width: 260px;
  max-width: 380px;
  background: rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.body--dark .pdf-card-container {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.pdf-preview-cover {
  position: relative;
  overflow: hidden;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.pdf-hover-overlay {
  background: rgba(0, 0, 0, 0.25);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.pdf-preview-cover:hover .pdf-hover-overlay {
  opacity: 1;
}

.pdf-meta-bar {
  transition: background 0.2s ease;
}

.pdf-meta-bar:hover {
  background: rgba(0, 0, 0, 0.05);
}

.body--dark .pdf-meta-bar:hover {
  background: rgba(255, 255, 255, 0.08);
}

.generic-doc-card {
  min-width: 220px;
  background: rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.08);
  transition: background 0.2s;
}

.generic-doc-card:hover {
  background: rgba(0, 0, 0, 0.08);
}

.body--dark .generic-doc-card {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.body--dark .generic-doc-card:hover {
  background: rgba(255, 255, 255, 0.1);
}
</style>
