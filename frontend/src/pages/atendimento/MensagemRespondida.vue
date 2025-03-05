<template>
  <q-item
    clickable
    v-ripple
    class="q-pa-none fit btn-rounded q-mt-md q-mb-sm row justify-center"
    dense
  >
    <q-chat-message
      :key="mensagem.id"
      :sent="mensagem.fromMe"
      class="text-weight-medium fit q-ma-none"
      id="chat-message-resp"
      style="min-width: 200px; max-width: 400px"
      :bg-color="mensagem.fromMe ? 'grey-2' : $q.dark.isActive ? 'blue-2' : 'blue-1' "
    >
      <!-- @click="focarElemento(mensagem)" -->

      <!-- :bg-color="mensagem.fromMe ? '' : 'green-3' " -->
      <!-- :bg-color="mensagem.fromMe ? 'grey-2' : 'secondary' " -->
      <div
        class="full-width"
        :style="mensagem.isDeleted ? 'color: rgba(0, 0, 0, 0.36) !important;' : ''"
      >
        <div
          v-if="mensagem.isDeleted"
          class="text-italic"
        > Mensagem apagada em {{ formatarData(mensagem.updatedAt, 'dd/MM/yyyy') }}.</div>
        <div
          v-if="isGroupLabel(mensagem)"
          class="q-mb-sm"
          style="display: flex; color: rgb(59 23 251); fontWeight: 500;"
        >
          {{ isGroupLabel(mensagem) }}
        </div>
        <div
          v-if="!isGroupLabel(mensagem) && !mensagem.fromMe"
          class="q-mb-sm"
          style="display: flex; color: rgb(59 23 251); fontWeight: 500;"
        >
          {{ mensagem.contact && mensagem.contact.name }}
        </div>
        <template v-if="mensagem.mediaType === 'audio'">
          <div class="column items-center q-my-sm full-width">
            <audio
              style="max-width: 400px; margin: 0 auto; width: 100%;"
              controls
            >
              <source :src="mensagem.mediaUrl" type="audio/mp3" />
            </audio>
          </div>
        </template>
        <template v-if="mensagem.mediaType === 'vcard'">
          <div class="column items-center q-my-sm full-width">
            <q-btn
              type="a"
              color="black"
              outline
              dense
              class="q-px-sm text-center"
              download="vCard"
              :href="`data:text/x-vcard;charset=utf-8;base64,${returnCardContato(mensagem.body)}`"
            >
              Download Contato
            </q-btn>
          </div>
        </template>
        <template v-if="mensagem.mediaType === 'image'">
          <!-- @click="buscarImageCors(mensagem.mediaUrl)" -->
          <div class="column items-center q-my-sm full-width">
            <q-img
              @click="urlMedia=mensagem.mediaUrl; abrirModalImagem=true"
              :src="mensagem.mediaUrl"
              spinner-color="primary"
              height="auto"
              width="200px"
              style="cursor: pointer; margin: 0 auto;"
              class="rounded-borders"
            />
          </div>
          <VueEasyLightbox
            moveDisabled
            :visible="abrirModalImagem"
            :imgs="urlMedia"
            :index="mensagem.ticketId || 1"
            @hide="abrirModalImagem = false"
          />
        </template>
        <template v-if="mensagem.mediaType === 'video'">
          <div class="column items-center q-my-sm full-width">
            <video
              :src="mensagem.mediaUrl"
              controls
              style="objectFit: cover;
                    width: 200px;
                    height: auto;
                    margin: 0 auto;
                    borderTopLeftRadius: 8px;
                    borderTopRightRadius: 8px;
                    borderBottomLeftRadius: 8px;
                    borderBottomRightRadius: 8px;"
            >
            </video>
          </div>
        </template>
        <template v-if="mensagem.mediaType === 'application'">
          <div class="column items-center q-my-sm full-width">
            <q-btn
              type="a"
              color="grey-3"
              no-wrap
              no-caps
              stack
              class="q-my-sm text-center text-black btn-rounded text-grey-9 ellipsis"
              style="max-width: 400px; margin: 0 auto;"
              download
              :target="isPDF(mensagem.mediaUrl) ? '_blank' : ''"
              :href="mensagem.mediaUrl"
            >
              <q-tooltip
                v-if="mensagem.mediaUrl"
                content-class="bg-padrao text-grey-9 text-bold"
              >
                Baixar: {{ mensagem.body }}
              </q-tooltip>
              <template slot>
                <div
                  class="row items-center q-my-sm"
                  style="max-width: 400px"
                >
                  <div class="ellipsis col-grow q-pr-sm">
                    {{ farmatarMensagemWhatsapp(mensagem.body) }}
                  </div>
                  <q-icon
                    class="col"
                    name="mdi-download"
                  />
                </div>
              </template>
            </q-btn>
          </div>
        </template>
        <template v-if="mensagem.mediaType === 'poll_creation'">
          <div class="column items-center q-my-sm full-width">
            <div class="poll-container" style="margin: 0 auto;">
              <div class="poll-header">
                <q-icon name="poll" size="20px" class="q-mr-sm" />
                <div class="poll-title">
                  {{ mensagem.pollData?.name || 'Enquete' }}
                </div>
              </div>
              <div class="poll-subtitle">
                {{ mensagem.pollData?.options?.length || 0 }} opções
              </div>
            </div>
          </div>
        </template>
        <div
          v-linkified
          v-if="!['vcard', 'application', 'audio', 'image', 'video', 'poll_creation'].includes(mensagem.mediaType)"
          :class="{'q-mt-sm': mensagem.mediaType !== 'chat'}"
          class="q-message-container row items-end no-wrap ellipsis-3-lines"
        >
          <div v-html="farmatarMensagemWhatsapp(mensagem.body)">
          </div>
        </div>
      </div>
    </q-chat-message>
  </q-item>

</template>

<script>
import { Base64 } from 'js-base64'

import mixinCommon from './mixinCommon'
import VueEasyLightbox from 'vue-easy-lightbox'

export default {
  name: 'MensagemChat',
  mixins: [mixinCommon],
  props: {
    mensagem: {
      type: Object,
      default: () => { }
    },
    size: {
      type: [String, Number],
      default: '5'
    },
    isLineDate: {
      type: Boolean,
      default: true
    },
    replyingMessage: {
      type: Object,
      default: () => { }
    }
  },
  data () {
    return {
      abrirModalImagem: false,
      urlMedia: '',
      selectedPollOption: null,
      ackIcons: { // Se ACK == 3 ou 4 entao color green
        0: 'mdi-clock-outline',
        1: 'mdi-check',
        2: 'mdi-check-all',
        3: 'mdi-check-all',
        4: 'mdi-check-all'
      }
    }
  },
  components: {
    VueEasyLightbox
  },
  methods: {
    isPDF (url) {
      if (!url) return false
      const split = url.split('.')
      const ext = split[split.length - 1]
      return ext === 'pdf'
    },
    isGroupLabel (mensagem) {
      try {
        return this.ticketFocado.isGroup ? mensagem.contact.name : ''
      } catch (error) {
        return ''
      }
    },
    returnCardContato (str) {
      // return btoa(str)
      return Base64.encode(str)
    },
    focarElemento (mensagem) {
      this.$emit('mensagem-respondida:focar-mensagem', mensagem)
    }
  }
}
</script>

<style lang="scss">
// .q-message-text {
//   box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2), 0 1px 1px rgba(0, 0, 0, 0.14),
//     0 2px 1px -1px rgba(0, 0, 0, 0.12);
// }

.poll-container {
  padding: 8px;
  border-radius: 6px;
  background: #202C33;
  min-width: 200px;
  max-width: 600px;
  color: white;
  font-size: 0.9em;
}

.poll-header {
  display: flex;
  align-items: center;
}

.poll-title {
  font-weight: 500;
  color: white;
}

.poll-subtitle {
  font-size: 0.85em;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 4px;
}

.poll-button {
  margin-top: 4px;
  :deep(.q-btn) {
    min-height: 20px;
    padding: 4px 0;
    font-size: 0.9em;
  }
}

.poll-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 12px 0;
}

.poll-option {
  .q-radio {
    width: 100%;
    :deep(.q-radio__label) {
      color: white;
      font-size: 0.9em;
    }
    :deep(.q-radio__inner) {
      color: white;
    }
  }
}

// Estilos de alinhamento para todos os tipos de mídia
.q-chat-message {
  .q-message-text {
    .column.items-center {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
    }

    img, video, audio {
      display: block;
      margin: 0 auto;
    }
  }
}

@media (max-width: 400px) {
  .poll-container {
    min-width: 200px;
    max-width: 100%;
  }
}
</style>
