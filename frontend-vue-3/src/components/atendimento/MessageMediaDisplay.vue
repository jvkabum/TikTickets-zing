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
        :url="mediaUrl"
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
    <template v-else-if="mediaType === 'image'">
      <MediaViewer
        media-type="image"
        :media-url="mediaUrl"
      />
    </template>

    <!-- Video -->
    <template v-else-if="mediaType === 'video'">
      <MediaViewer
        media-type="video"
        :media-url="mediaUrl"
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
    
    <slot name="options-menu"></slot>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import AudioVisualizer from 'src/components/chat/AudioVisualizer.vue'
import WhatsAppVCard from 'src/components/chat/WhatsAppVCard.vue'
import MediaViewer from 'src/components/utils/MediaViewer/MediaViewer.vue'

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
</style>
