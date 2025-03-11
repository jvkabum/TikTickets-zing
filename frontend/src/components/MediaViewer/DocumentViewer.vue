<template>
  <div class="document-viewer">
    <div v-if="isPDF" class="pdf-viewer-container">
      <!-- Visualizador de PDF -->
      <div
        ref="pdfViewerContainer"
        class="pdf-viewer"
      >
        <object
          ref="pdfObject"
          :data="currentPdfSrc"
          type="application/pdf"
          class="pdf-object"
          @load="onPdfLoad"
        >
          <p>Seu navegador não suporta a visualização de PDF. <a :href="src" target="_blank">Clique aqui para baixar o arquivo</a>.</p>
        </object>

        <!-- Spinner de carregamento -->
        <div v-if="loading" class="pdf-loading">
          <q-spinner color="primary" size="3em" />
          <div class="pdf-loading-text">Carregando documento...</div>
        </div>
      </div>
    </div>

    <!-- Visualizador de Excel -->
    <div v-else-if="isExcel" class="file-container" :data-file-type="fileExtension" @click="showExcelPreview = true">
      <div class="preview-container">
        <div class="file-icon" :style="{ color: fileColor }">
          <q-icon :name="fileIcon" />
        </div>
        <div class="file-details">
          <div class="file-name">{{ computedFileName }}</div>
          <div class="file-type">{{ fileExtension.toUpperCase() }}</div>
        </div>
        <div v-if="excelData.length" class="excel-preview">
          <table>
            <thead>
              <tr>
                <th v-for="(header, index) in excelHeaders" :key="index">{{ header }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, rowIndex) in excelPreviewRows" :key="rowIndex">
                <td v-for="(cell, cellIndex) in row" :key="cellIndex">{{ cell }}</td>
              </tr>
            </tbody>
          </table>
          <div class="preview-overlay">
            <q-btn
              flat
              round
              color="primary"
              icon="fullscreen"
              class="preview-expand-btn"
            >
              <q-tooltip>Expandir visualização</q-tooltip>
            </q-btn>
          </div>
        </div>
      </div>
    </div>

    <!-- Visualizador de outros arquivos -->
    <div v-else class="file-container" :data-file-type="fileExtension">
      <div class="file-icon" :style="{ color: fileColor }">
        <q-icon :name="fileIcon" />
      </div>
      <div class="file-details">
        <div class="file-name">{{ computedFileName }}</div>
        <div class="file-type">{{ fileExtension.toUpperCase() }}</div>
      </div>
    </div>

    <!-- Modal para visualização completa do Excel -->
    <q-dialog v-model="showExcelPreview" full-width full-height>
      <q-card class="excel-preview-modal">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ computedFileName }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="excel-preview-content">
          <div class="excel-table-container">
            <table>
              <thead>
                <tr>
                  <th v-for="(header, index) in excelHeaders" :key="index">{{ header }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, rowIndex) in excelData" :key="rowIndex">
                  <td v-for="(cell, cellIndex) in row" :key="cellIndex">{{ cell }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import * as XLSX from 'xlsx'

export default {
  name: 'DocumentViewer',
  props: {
    src: {
      type: String,
      required: true
    },
    fileName: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      showExcelPreview: false,
      excelData: [],
      excelHeaders: [],
      loading: true,
      pdfDocument: null
    }
  },
  watch: {
    src: {
      handler () {
        if (this.isPDF) {
          this.loading = true
          this.$nextTick(() => {
            setTimeout(() => {
              this.onPdfLoad()
            }, 500)
          })
        } else if (this.isExcel) {
          this.loadExcelFile()
        }
      },
      immediate: true
    }
  },
  computed: {
    isPDF () {
      return this.src && (
        this.src.toLowerCase().endsWith('.pdf') ||
        this.src.toLowerCase().includes('.pdf?') ||
        this.src.toLowerCase().includes('application/pdf')
      )
    },
    isExcel () {
      return this.fileExtension === 'xlsx' || this.fileExtension === 'xls'
    },
    fileExtension () {
      try {
        const url = new URL(this.src)
        const pathname = url.pathname
        const extension = pathname.split('.').pop().toLowerCase()
        return extension || 'desconhecido'
      } catch (error) {
        const extension = this.src.split('.').pop().toLowerCase()
        return extension || 'desconhecido'
      }
    },
    currentPdfSrc () {
      if (!this.isPDF || !this.src) return ''
      return this.src
    },
    fileIcon () {
      const extensionMap = {
        pdf: 'mdi-file-pdf-box',
        doc: 'mdi-file-word-box',
        docx: 'mdi-file-word-box',
        xls: 'mdi-file-excel-box',
        xlsx: 'mdi-file-excel-box',
        ppt: 'mdi-file-powerpoint-box',
        pptx: 'mdi-file-powerpoint-box',
        txt: 'mdi-file-document-box',
        rtf: 'mdi-file-document-box',
        zip: 'mdi-folder-zip',
        rar: 'mdi-folder-zip',
        mp3: 'mdi-file-music-box',
        wav: 'mdi-file-music-box',
        ogg: 'mdi-file-music-box'
      }
      return extensionMap[this.fileExtension] || 'mdi-file-box'
    },
    fileColor () {
      const colorMap = {
        pdf: 'red',
        doc: 'blue',
        docx: 'blue',
        xls: 'green',
        xlsx: 'green',
        ppt: 'orange',
        pptx: 'orange',
        txt: 'grey-8',
        rtf: 'grey-8',
        zip: 'purple',
        rar: 'purple',
        mp3: 'deep-purple',
        wav: 'deep-purple',
        ogg: 'deep-purple'
      }
      return colorMap[this.fileExtension] || 'grey'
    },
    computedFileName () {
      if (this.fileName && this.fileName.trim()) return this.fileName
      try {
        const url = new URL(this.src)
        const pathname = url.pathname
        const filename = pathname.split('/').pop()
        return decodeURIComponent(filename)
      } catch (error) {
        const parts = this.src.split('/')
        return parts[parts.length - 1] || 'arquivo'
      }
    },
    excelPreviewRows () {
      return this.excelData.slice(0, 5)
    }
  },
  methods: {
    onPdfLoad () {
      try {
        this.loading = false
        this.adjustPdfHeight()
        this.removeHorizontalScrollbars()
      } catch (error) {
        console.warn('Erro ao carregar PDF:', error)
        this.loading = false
      }
    },
    adjustPdfHeight () {
      try {
        const container = this.$refs.pdfViewerContainer
        const object = this.$refs.pdfObject

        if (!container || !object) return

        // Obtém a largura real disponível
        const containerWidth = container.clientWidth

        // Garante que o objeto não ultrapasse a largura do contêiner
        object.style.width = '100%'
        object.style.maxWidth = `${containerWidth}px`

        // Calcula a altura proporcional mantendo a proporção de página A4
        const aspectRatio = 1.414 // Proporção A4 (297/210)
        let calculatedHeight = containerWidth * aspectRatio

        // Limites de altura baseados no viewport
        const viewportHeight = window.innerHeight
        const minHeight = Math.round(viewportHeight * 0.4)
        const maxHeight = Math.round(viewportHeight * 0.8)

        // Aplica os limites
        calculatedHeight = Math.min(Math.max(calculatedHeight, minHeight), maxHeight)

        // Define a altura
        object.style.height = `${calculatedHeight}px`
        container.style.height = `${calculatedHeight}px`
      } catch (error) {
        console.warn('Erro ao ajustar altura do PDF:', error)
      }
    },
    openInNewTab () {
      window.open(this.src, '_blank')
    },
    // Método para remover barras de rolagem horizontais
    removeHorizontalScrollbars () {
      try {
        // Obtém o elemento visualizador de PDF
        const pdfViewer = this.$refs.pdfViewerContainer
        if (!pdfViewer) return

        // Procura por todos os elementos pais até o body
        let parent = pdfViewer.parentElement
        while (parent && parent !== document.body) {
          // Aplica overflow-x hidden
          parent.style.overflowX = 'hidden'
          // Vai para o próximo pai
          parent = parent.parentElement
        }

        // Ajusta o PDF object
        const object = this.$refs.pdfObject
        if (!object) return

        // Aplicar estilos diretamente para garantir
        object.style.overflow = 'hidden'
        object.style.maxWidth = '100%'
        object.style.width = '100%'

        // Tentativa de acessar o conteúdo interno
        try {
          if (object.contentDocument) {
            const style = document.createElement('style')
            style.textContent = `
              body, html, div, embed, object {
                overflow-x: hidden !important;
                max-width: 100% !important;
              }
              embed[type="application/pdf"] {
                object-fit: contain !important;
              }
            `
            object.contentDocument.head.appendChild(style)
          }
        } catch (e) {
          console.warn('Acesso ao conteúdo do PDF bloqueado por segurança do navegador')
        }
      } catch (error) {
        console.warn('Erro ao remover barras de rolagem horizontais:', error)
      }
    },
    async loadExcelFile () {
      if (!this.isExcel) return

      try {
        this.loading = true
        const response = await fetch(this.src)
        const blob = await response.blob()
        const buffer = await blob.arrayBuffer()
        const workbook = XLSX.read(buffer, { type: 'array' })

        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
        const data = XLSX.utils.sheet_to_json(firstSheet, { header: 1 })

        if (data.length > 0) {
          this.excelHeaders = data[0]
          this.excelData = data.slice(1)
        }
      } catch (error) {
        console.error('Erro ao carregar arquivo Excel:', error)
      } finally {
        this.loading = false
      }
    }
  },
  mounted () {
    window.addEventListener('resize', this.adjustPdfHeight)
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.adjustPdfHeight)
  }
}
</script>

<style lang="scss" scoped>
.document-viewer {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  overflow-x: hidden;
}

.pdf-viewer-container {
  width: 100%;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow-x: hidden;
  margin: 0;
}

.pdf-viewer {
  position: relative;
  width: 100%;
  height: auto;
  min-height: 50vh;
  max-height: 80vh;
  overflow-x: hidden !important;
  overflow-y: auto;
  background-color: #eee;
  display: flex;
  justify-content: center;
  align-items: center;
}

.pdf-object {
  width: 100%;
  height: 100%;
  border: none;
  background-color: white;
  min-height: 50vh;
  max-height: 80vh;
  overflow: hidden !important;
}

.pdf-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 1;
}

.file-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  text-align: left;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  background-color: #f5f5f5;
  width: 100%;
  max-width: 400px;
  overflow: hidden;
  margin: 0 auto;
  gap: 16px;
}

.file-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.1));
}

.file-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  min-width: 0;
}

.file-container .q-icon {
  font-size: 40px;
}

.file-container[data-file-type="xlsx"] .q-icon,
.file-container[data-file-type="xls"] .q-icon {
  font-size: 40px;
  color: #1d6f42;
}

.file-name {
  font-weight: 600;
  font-size: 14px;
  color: #333;
  word-break: break-word;
  margin-bottom: 4px;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-type {
  font-size: 12px;
  color: #666;
  margin: 0;
}

.body--dark {
  .pdf-viewer-container {
    background-color: #1d1d1d;
  }

  .pdf-viewer {
    background-color: #333;
  }

  .pdf-loading {
    background-color: rgba(0, 0, 0, 0.7);
  }

  .file-container {
    background-color: #2d2d2d;
  }

  .file-name {
    color: #eee;
  }

  .file-type {
    color: #bbb;
  }
}

@media (max-width: 500px) {
  .pdf-viewer-container {
    max-width: 100%;
    border-radius: 0;
    margin: 0;
  }

  .pdf-viewer {
    min-height: 40vh;
    height: auto;
    border-radius: 0;
  }

  .file-container {
    padding: 12px;
    gap: 12px;
  }

  .file-container .q-icon {
    font-size: 32px;
  }

  .file-container[data-file-type="xlsx"] .q-icon,
  .file-container[data-file-type="xls"] .q-icon {
    font-size: 32px;
  }

  .file-name {
    font-size: 13px;
  }

  .file-type {
    font-size: 11px;
  }
}

.preview-container {
  width: 100%;
  height: 100%;
  position: relative;
  cursor: pointer;
}

.excel-preview {
  margin-top: 20px;
  width: 100%;
  max-height: 60vh;
  overflow: hidden;
  position: relative;
  border-radius: 8px;
  background: white;
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
    th, td {
      padding: 8px;
      text-align: left;
      border: 1px solid #eee;
    }
    th {
      background: #f5f5f5;
      font-weight: 600;
    }
    tr:nth-child(even) {
      background: #f9f9f9;
    }
  }
}

.preview-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: linear-gradient(transparent, rgba(255, 255, 255, 0.9));
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-expand-btn {
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.excel-preview-modal {
  max-width: 90vw;
  max-height: 80vh;
}

.excel-preview-content {
  height: calc(80vh - 50px);
  padding: 0;
}

.excel-table-container {
  height: 100%;
  overflow: auto;
  table {
    width: 100%;
    border-collapse: collapse;
    th, td {
      padding: 8px;
      text-align: left;
      border: 1px solid #eee;
    }
    th {
      position: sticky;
      top: 0;
      background: #f5f5f5;
      font-weight: 600;
      z-index: 1;
    }
    tr:nth-child(even) {
      background: #f9f9f9;
    }
  }
}

.body--dark {
  .excel-preview,
  .excel-table-container {
    table {
      th {
        background: #333;
      }
      td {
        border-color: #444;
      }
      tr:nth-child(even) {
        background: #2d2d2d;
      }
    }
  }
  .preview-overlay {
    background: linear-gradient(transparent, rgba(45, 45, 45, 0.9));
  }
  .preview-expand-btn {
    background: rgba(45, 45, 45, 0.9);
  }
}

@media (max-width: 500px) {
  .excel-preview-modal {
    max-width: 95vw;
  }

  .excel-preview {
    max-height: 50vh;
  }

  .excel-preview table,
  .excel-table-container table {
    font-size: 11px;

    th, td {
      padding: 6px;
    }
  }
}
</style>
