<template>
  <div
    v-if="parsedContact.name"
    class="contact-card q-pa-sm rounded-borders bg-grey-2"
  >
    <div class="row items-center no-wrap q-gutter-sm">
      <q-avatar size="50px">
        <img
          v-if="parsedContact.photo"
          :src="'data:image/jpeg;base64,' + parsedContact.photo"
        />
        <q-icon
          v-else
          name="mdi-account"
          color="grey-7"
        />
      </q-avatar>
      <div class="col overflow-hidden">
        <div class="text-bold text-black ellipsis">
          {{ parsedContact.name }}
        </div>
        <div class="text-caption text-grey-8 ellipsis">
          {{ parsedContact.number }}
        </div>
      </div>
      <q-btn
        flat
        round
        dense
        icon="mdi-account-plus"
        color="primary"
        @click="emit('openContactModal', parsedContact)"
      >
        <q-tooltip>Adicionar Contato</q-tooltip>
      </q-btn>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  mensagem: { type: Object, required: true }
})

const emit = defineEmits(['openContactModal'])

const parsedContact = computed(() => {
  const vcard = props.mensagem.body || ''
  const lines = vcard.split('\n')
  const contact = { name: '', number: '', photo: '' }

  lines.forEach(line => {
    if (line.startsWith('FN:')) contact.name = line.substring(3).trim()
    else if (line.startsWith('TEL') || line.includes('.TEL')) contact.number = line.split(':')[1]?.trim()
    else if (line.startsWith('PHOTO;BASE64')) contact.photo = line.split(':')[1]?.trim()
  })
  return contact
})
</script>

<style scoped>
.contact-card {
  border: 1px solid #ddd;
  min-width: 250px;
}
</style>
