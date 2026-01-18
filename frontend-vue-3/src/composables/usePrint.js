import { ref } from 'vue'

/**
 * Composable para impressão de relatórios
 * Substitui o antigo PrintMixin.js
 */
export function usePrint() {
    const isPrinting = ref(false)

    /**
     * Imprime um elemento específico
     */
    const printElement = (elementId, titulo = 'Relatório') => {
        isPrinting.value = true

        const element = document.getElementById(elementId)
        if (!element) {
            console.error('Elemento não encontrado:', elementId)
            isPrinting.value = false
            return
        }

        const conteudo = element.innerHTML
        const estilos = `
      <style>
        body { 
          font-family: Arial, sans-serif; 
          padding: 20px; 
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-bottom: 20px; 
        }
        th, td { 
          border: 1px solid #ddd; 
          padding: 8px; 
          text-align: left; 
        }
        th { 
          background-color: #f4f4f4; 
        }
        .header { 
          text-align: center; 
          margin-bottom: 20px; 
        }
        .no-print { 
          display: none !important; 
        }
        @media print {
          .no-print { display: none !important; }
        }
      </style>
    `

        const janela = window.open('', '_blank')
        janela.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${titulo}</title>
          ${estilos}
        </head>
        <body>
          <div class="header">
            <h1>${titulo}</h1>
            <p>Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
          </div>
          ${conteudo}
        </body>
      </html>
    `)

        janela.document.close()

        setTimeout(() => {
            janela.print()
            janela.close()
            isPrinting.value = false
        }, 500)
    }

    /**
     * Imprime o conteúdo atual da página
     */
    const printPage = (titulo = 'Relatório') => {
        isPrinting.value = true

        const tituloOriginal = document.title
        document.title = titulo

        window.print()

        document.title = tituloOriginal
        isPrinting.value = false
    }

    /**
     * Gera PDF a partir de HTML (requer biblioteca jspdf)
     */
    const gerarPDFSimples = async (elementId, nomeArquivo = 'relatorio') => {
        // Fallback: usar impressão do navegador se jspdf não estiver disponível
        printElement(elementId, nomeArquivo)
    }

    /**
     * Estilos CSS para impressão em paisagem
     */
    const estilosPaisagem = `
    @page {
      size: landscape;
      margin: 1cm;
    }
    @media print {
      body {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }
  `

    /**
     * Estilos CSS para impressão em retrato
     */
    const estilosRetrato = `
    @page {
      size: portrait;
      margin: 1cm;
    }
    @media print {
      body {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }
  `

    /**
     * Aplica estilo de impressão temporariamente
     */
    const aplicarEstiloPrint = (orientacao = 'portrait') => {
        const styleId = 'print-orientation-style'
        let style = document.getElementById(styleId)

        if (!style) {
            style = document.createElement('style')
            style.id = styleId
            document.head.appendChild(style)
        }

        style.textContent = orientacao === 'landscape' ? estilosPaisagem : estilosRetrato
    }

    return {
        isPrinting,
        printElement,
        printPage,
        gerarPDFSimples,
        estilosPaisagem,
        estilosRetrato,
        aplicarEstiloPrint
    }
}
