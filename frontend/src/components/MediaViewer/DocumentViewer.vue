<template>
  <div class="document-viewer">
    <div v-if="isPDF" class="pdf-container">
      <iframe
        :src="pdfSrcWithoutScrollbar"
        class="pdf-frame"
        frameborder="0"
        allowfullscreen
        scrolling="no"
      ></iframe>
    </div>

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
      loading: false
    }
  },
  watch: {
    src: {
      handler () {
        if (this.isPDF) {
          this.$nextTick(() => {
            setTimeout(this.adjustPdfHeight, 500)
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
    pdfSrcWithoutScrollbar () {
      if (this.isPDF && this.src) {
        if (this.src.includes('#')) {
          return this.src + '&toolbar=0&navpanes=0&scrollbar=0'
        } else {
          return this.src + '#toolbar=0&navpanes=0&scrollbar=0'
        }
      }
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
    adjustPdfHeight () {
      try {
        const frame = this.$refs.pdfFrame
        if (frame) {
          const doc = frame.contentDocument || frame.contentWindow.document
          if (doc) {
            const height = doc.documentElement.scrollHeight
            frame.style.height = Math.min(Math.max(height, 300), 900) + 'px'
          }
        }
      } catch (error) {
        console.warn('Não foi possível ajustar altura do PDF:', error)
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
  }
}
</script>

<style lang="scss" scoped>
.document-viewer {
  width: 100%;
  max-width: 700px;
  min-width: 500px;
  margin: 10px auto;
  overflow: visible;
  display: flex;
  flex-direction: column;
}

.pdf-container {
  width: 100%;
  max-width: 700px;
  min-width: 500px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.pdf-frame {
  width: 100%;
  height: auto;
  min-height: 500px;
  max-height: 700px;
  border: none;
  overflow: hidden;
  transition: height 0.3s ease;
  background-color: white;
}

.file-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  background-color: #f5f5f5;
  min-height: 350px;
  max-height: 500px;
  width: 100%;
  max-width: 500px;
  min-width: 350px;
  overflow: hidden;
  margin: 0 auto;
}

.file-icon {
  margin-bottom: 16px;
  filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.1));
}

.file-details {
  max-width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
}

.file-container .q-icon {
  font-size: 100px;
}

.file-container[data-file-type="xlsx"] .q-icon,
.file-container[data-file-type="xls"] .q-icon {
  font-size: 120px;
  color: #1D6F42;
}

.file-name {
  font-weight: 600;
  font-size: 18px;
  color: #333;
  word-break: break-word;
  margin-bottom: 4px;
}

.file-type {
  font-size: 14px;
  color: #666;
  margin-bottom: 16px;
}

.body--dark {
  .pdf-container, .file-container {
    background-color: #2d2d2d;
  }
  .pdf-tools {
    background-color: #333;
    border-top-color: rgba(255, 255, 255, 0.1);
  }
  .file-name {
    color: #eee;
  }
  .file-type {
    color: #bbb;
  }
}

@media (max-width: 700px) {
  .document-viewer,
  .pdf-container,
  .file-container {
    min-width: 100%;
    max-width: 100%;
    margin: 5px auto;
  }

  .pdf-frame {
    min-height: 300px;
    max-height: 600px;
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
  max-height: 200px;
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
  background: linear-gradient(transparent, rgba(255,255,255,0.9));
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-expand-btn {
  background: rgba(255,255,255,0.9);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.excel-preview-modal {
  max-width: 90vw;
  max-height: 90vh;
}

.excel-preview-content {
  height: calc(90vh - 50px);
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
    background: linear-gradient(transparent, rgba(45,45,45,0.9));
  }
  .preview-expand-btn {
    background: rgba(45,45,45,0.9);
  }
}
</style>
