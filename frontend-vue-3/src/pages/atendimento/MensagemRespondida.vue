<template>
  <q-item
    clickable
    v-ripple
    class="q-pa-none fit btn-rounded q-mt-md q-mb-sm row justify-center"
    dense
    @click="focarEmoji"
  >
    <q-chat-message
      :sent="mensagem.fromMe"
      class="text-weight-medium fit q-ma-none"
      style="min-width: 200px; max-width: 400px"
      :bg-color="mensagem.fromMe ? 'grey-2' : $q.dark.isActive ? 'blue-2' : 'blue-1'"
    >
      <div
        class="full-width"
        :style="mensagem.isDeleted ? 'color: rgba(0, 0, 0, 0.36) !important;' : ''"
      >
        <div
          v-if="mensagem.isDeleted"
          class="text-italic"
        >
          Mensagem apagada em
          {{ formatarData(mensagem.updatedAt, 'dd/MM/yyyy') }}.
        </div>

        <div
          v-if="isGroupLabel(mensagem)"
          class="q-mb-sm text-bold text-primary"
          style="font-size: 0.8rem"
        >
          {{ mensagem.contact?.name }}
        </div>
        <div
          v-else-if="!mensagem.fromMe"
          class="q-mb-sm text-bold text-primary"
          style="font-size: 0.8rem"
        >
          {{ mensagem.contact?.name }}
        </div>

        <!-- Renderers -->
        <template v-if="mensagem.mediaType === 'audio'">
          <div class="column items-center q-my-sm">
            <audio
              controls
              style="max-width: 100%"
            >
              <source
                :src="mensagem.mediaUrl"
                type="audio/mp3"
              />
            </audio>
          </div>
        </template>

        <template v-else-if="mensagem.mediaType === 'image'">
          <div class="column items-center q-my-sm">
            <q-img
              :src="mensagem.mediaUrl"
              width="150px"
              class="rounded-borders"
            />
          </div>
        </template>

        <template v-else-if="mensagem.mediaType === 'video'">
          <div class="column items-center q-my-sm">
            <video
              :src="mensagem.mediaUrl"
              style="width: 150px; border-radius: 8px"
            />
          </div>
        </template>

        <template v-else-if="mensagem.mediaType === 'poll_creation'">
          <div class="poll-container q-pa-sm rounded-borders bg-grey-9 text-white">
            <div class="row items-center">
              <q-icon
                name="poll"
                class="q-mr-xs"
              />
              {{ mensagem.pollData?.name || 'Enquete' }}
            </div>
          </div>
        </template>

        <div
          v-if="!['audio', 'image', 'video', 'poll_creation', 'vcard'].includes(mensagem.mediaType)"
          class="q-message-text-content ellipsis-3-lines"
          v-html="formatarMensagemWhatsapp(mensagem.body)"
        />
      </div>
    </q-chat-message>
  </q-item>
</template>

<script setup>
import { format, parseISO } from 'date-fns'
import pt from 'date-fns/locale/pt-BR'
import { storeToRefs } from 'pinia'
import { useTicketStore } from 'src/stores/useTicketStore'
import { formatarMensagemWhatsapp } from 'src/utils/formatMessage'

const props = defineProps({
  mensagem: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['mensagem-respondida:focar-mensagem'])

const ticketStore = useTicketStore()
const { ticketFocado } = storeToRefs(ticketStore)

const formatarData = (data, formato = 'dd/MM/yyyy') => (data ? format(parseISO(data), formato, { locale: pt }) : '')

const isGroupLabel = m => ticketFocado.value.isGroup && m.contact?.name

const focarEmoji = () => {
  emit('mensagem-respondida:focar-mensagem', props.mensagem)
}
</script>

<style lang="scss" scoped>
.poll-container {
  min-width: 150px;
}
</style>
