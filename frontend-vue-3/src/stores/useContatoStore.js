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
  const contatoAtual = ref(null)

  const filtros = ref({
    searchParam: '',
    pageNumber: 1,
    tags: [],
    wallets: []
  })

  async function listarContatos(resetar = false) {
    if (resetar) {
      filtros.value.pageNumber = 1
      contatos.value = []
      hasMore.value = true
    }

    loading.value = true
    try {
      const { data } = await ListarContatos(filtros.value)
      if (filtros.value.pageNumber === 1) {
        contatos.value = data.contacts || data
      } else {
        contatos.value = [...contatos.value, ...(data.contacts || data)]
      }
      totalContatos.value = data.count || contatos.value.length
      hasMore.value = data.hasMore !== false
      return data
    } finally {
      loading.value = false
    }
  }

  async function obterContato(id) {
    const { data } = await ObterContato(id)
    contatoAtual.value = data
    return data
  }

  // Utilitário de formatação centralizado
  function formatarNumero(numero) {
    if (!numero) return ''
    const limpo = numero.replace(/@.*$/, '')
    if (limpo.length === 13 && limpo.startsWith('55')) {
      return `+${limpo.slice(0, 2)} (${limpo.slice(2, 4)}) ${limpo.slice(4, 9)}-${limpo.slice(9)}`
    }
    return limpo
  }

  function selecionarContato(contato) {
    contatoAtual.value = { ...contato }
  }

  function limparSelecao() {
    contatoAtual.value = null
  }

  async function criarContato(payload) {
    const { data } = await CriarContato(payload)
    contatos.value.unshift(data)
    return data
  }

  async function editarContato(id, payload) {
    const { data } = await EditarContato(id, payload)
    const index = contatos.value.findIndex(c => c.id === id)
    if (index !== -1) {
      contatos.value[index] = data
    }
    return data
  }

  async function deletarContato(id) {
    await DeletarContato(id)
    const index = contatos.value.findIndex(c => c.id === id)
    if (index !== -1) {
      contatos.value.splice(index, 1)
    }
  }

  async function importarContatos(formData) {
    const { data } = await ImportarArquivoContato(formData)
    return data
  }

  async function exportarContatos() {
    const { data } = await ExportarArquivoContato()
    return data
  }

  function setContatos(data) {
    contatos.value = data
  }

  function updateContato(contact) {
    const index = contatos.value.findIndex(c => c.id === contact.id)
    if (index !== -1) {
      contatos.value[index] = contact
    } else {
      contatos.value.unshift(contact)
    }
  }

  async function obterContato(contactId) {
    try {
      const { data } = await ObterContato(contactId)
      return data
    } catch (error) {
      notificarErro('Erro ao obter contato', error)
      throw error
    }
  }

  return {
    contatos,
    loading,
    totalContatos,
    hasMore,
    filtros,
    contatoAtual,
    listarContatos,
    formatarNumero,
    selecionarContato,
    limparSelecao,
    criarContato,
    editarContato,
    deletarContato,
    importarContatos,
    exportarContatos,
    setContatos,
    updateContato,
    obterContato
  }
})
