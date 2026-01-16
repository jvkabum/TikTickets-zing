import html2canvas from 'html2canvas'
import ccPrintModelLandscape from './ccPrintModelLandscape.vue'

export default {
  components: { ccPrintModelLandscape },
  data () {
    return {
      imprimir: false,
      imprimirFiltros: false
    }
  },
  methods: {
    async printFiltros (id = 'filtrosRelatorio', mostrarFiltros = false) {
      const node = await document.getElementById('footerAppendFiltros')
      // Excluir todos os filhos da div
      node.innerHTML = ''
      if (mostrarFiltros) {
        const filtros = document.getElementById(id)
        // filtros.removeChild(filtros.getElementsByTagName('button'))

        const canvas = await html2canvas(filtros)
        const img = document.createElement('img')
        img.src = canvas.toDataURL()
        img.height = canvas.height
        img.width = canvas.width
        img.style = 'margin-top: 30px; zoom: 0.5; '
        node.appendChild(img)
      }
      this.imprimir = !this.imprimir
    }
  }
}
