<template>
  <div v-if="parsedContact.name" class="contact-card">
    <div v-if="parsedContact.photo">
      <img :src="'data:image/jpeg;base64,' + parsedContact.photo" alt="Contact Photo" />
    </div>
    <div>
      <h3>{{ parsedContact.name }}</h3>
      <p>{{ parsedContact.number }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ContatoCard',
  props: {
    mensagem: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      parsedContact: {}
    }
  },
  methods: {
    parseVCard (vcard) {
      const lines = vcard.split('\n')
      const contact = {
        name: '',
        number: '',
        photo: ''
      }
      lines.forEach(line => {
        if (line.startsWith('FN:')) {
          contact.name = line.substring(3)
        } else if (line.startsWith('TEL') || line.includes('.TEL')) {
          contact.number = line.split(':')[1]
        } else if (line.startsWith('PHOTO;BASE64')) {
          contact.photo = line.split(':')[1]
        }
      })
      return contact
    },
    addContact (contact) {
      this.$emit('openContactModal', contact)
    }
  },
  mounted () {
    this.parsedContact = this.parseVCard(this.mensagem.body)
  }
}
</script>

<style scoped>
.contact-card {
  border: 1px solid #ccc;
  padding: 1em;
  margin: 1em 0;
  border-radius: 8px;
  background: #f9f9f9;
}
.contact-card img {
  max-width: 100px;
  border-radius: 50%;
}
</style>
