<template>
  <q-dialog v-model="isVisible">
    <q-card>
      <q-card-section>
        <div class="text-h6">Adicionar Contato</div>
      </q-card-section>
      <q-card-section>
        <q-input v-model="localContact.name" label="Nome" />
        <q-input v-model="localContact.number" label="Número" />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancelar" @click="close" />
        <q-btn flat label="Salvar" color="primary" @click="saveContact" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  name: 'ContatoModal',
  props: {
    value: {
      type: Boolean,
      required: true
    },
    contact: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      isVisible: this.value,
      localContact: { ...this.contact }
    }
  },
  watch: {
    value (newVal) {
      this.isVisible = newVal
    },
    contact (newContact) {
      this.localContact = { ...newContact }
    }
  },
  methods: {
    close () {
      this.$emit('close')
    },
    saveContact () {
      // Aqui você pode adicionar a lógica para salvar o contato
      this.$emit('saveContact', this.localContact)
      this.close()
    }
  }
}
</script>
