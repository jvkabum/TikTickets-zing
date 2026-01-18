import { defineStore } from 'pinia'
import {
  CriarContato,
  DeletarContato,
  EditarContato,
  ExportarArquivoContato,
  ImportarArquivoContato,
  ListarContatos,
  ObterContato
} from 'src/service/contatos'
import { ref } from 'vue'

export const useContatoStore = defineStore('contato', () => {
  const contatos = ref([])
  const loading = ref(false)
  const totalContatos = ref(0)
  const hasMore = ref(false)

  async function listarContatos (params) {
    loading.value = true
    try {
      const { data } = await ListarContatos(params)
      if (params.pageNumber === 1) {
        contatos.value = data.contacts
      } else {
        contatos.value = [...contatos.value, ...data.contacts]
      }
      totalContatos.value = data.count
      hasMore.value = data.hasMore
      return data
    } finally {
      loading.value = false
    }
  }

  async function obterContato (id) {
    const { data } = await ObterContato(id)
    return data
  }

  async function criarContato (payload) {
    const { data } = await CriarContato(payload)
    contatos.value.unshift(data)
    return data
  }

  async function editarContato (id, payload) {
    const { data } = await EditarContato(id, payload)
    const index = contatos.value.findIndex(c => c.id === id)
    if (index !== -1) {
      contatos.value[index] = data
    }
    return data
  }

  async function deletarContato (id) {
    await DeletarContato(id)
    const index = contatos.value.findIndex(c => c.id === id)
    if (index !== -1) {
      contatos.value.splice(index, 1)
    }
  }

  async function importarContatos (formData) {
    const { data } = await ImportarArquivoContato(formData)
    return data
  }

  async function exportarContatos () {
    const { data } = await ExportarArquivoContato()
    return data
  }

  function setContatos (data) {
    contatos.value = data
  }

  function updateContato (contact) {
    const index = contatos.value.findIndex(c => c.id === contact.id)
    if (index !== -1) {
      contatos.value[index] = contact
    } else {
      contatos.value.unshift(contact)
    }
  }

  return {
    contatos,
    loading,
    totalContatos,
    hasMore,
    listarContatos,
    obterContato,
    criarContato,
    editarContato,
    deletarContato,
    importarContatos,
    exportarContatos,
    setContatos,
    updateContato
  }
})
