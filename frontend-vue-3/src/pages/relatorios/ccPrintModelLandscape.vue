<template>
  <div :id="`pagePrint-${id}`">
    <body id="pageInit">
      <div class="marginsPage">
        <div class="page-header">
          <div class="row">
            <div class="column left">
              <div class="container-header">
                <div
                  class="row text-center"
                  style="font-weight: bold; font-size: 18px"
                  :style="{ marginTop: subTitle ? '-10px' : '0px' }"
                >
                  {{ title }}
                </div>
                <div
                  v-if="subTitle"
                  class="row text-center"
                  style="font-weight: bold; font-size: 12px"
                >
                  {{ subTitle }}
                </div>

                <hr
                  class="row"
                  style="margin-top: 10px; margin-left: -10px; width: 85%"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="page-footer">
          <div style="text-align: center"></div>
        </div>

        <table>
          <thead>
            <tr>
              <td>
                <div class="page-header-space"></div>
              </td>
            </tr>
          </thead>

          <tbody id="tableReport">
            <slot name="body"></slot>
          </tbody>

          <tfoot>
            <tr>
              <td>
                <div class="page-footer-space"></div>
              </td>
            </tr>
          </tfoot>
          <div id="footerAppendFiltros"></div>
        </table>
      </div>
    </body>
  </div>
</template>

<script setup>
import { format } from 'date-fns'
import { Printd } from 'printd'
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  imprimirRelatorio: {
    type: Boolean,
    required: true
  },
  styleP: {
    type: String,
    default: '<p style="line-height: 0.1cm; word-wrap: normal !important; white-space: normal !important;">'
  },
  id: [String, Number],
  title: String,
  subTitle: { type: String, default: '' }
})

const emit = defineEmits(['update:imprimirRelatorio'])

const cssText = `
  .marginsPage {
    margin-left: 1cm !important;
    margin-right: 1cm !important;
  }
  .page-header {
    height: 120px !important;
  }
  .page-header-space {
    height: 90px !important;
  }
  .page-header {
    position: fixed !important;
    top: 0px !important;
    width: calc(100% - 0cm) !important;
  }
  .container-header {
    padding-top: 30px;
  }
  .column-rigth-header {
    position: fixed;
    width: 250px;
    height: 80px;
    top: 0px;
    padding-top: 10px;
    right: 0px;
  }
  header {
    display: none;
    position: fixed;
    top: 0;
  }
  
  .page-footer,
  .page-footer-space {
    height: 0px !important;
  }

  .page-footer {
    position: fixed !important;
    bottom: 0 !important;
    width: calc(100% - 2cm) !important;
  }

  .page {
    page-break-after: always !important;
  }
  .h1 {
    font-size: 25px;
  }
  .h2 {
    font-size: 20px;
  }
  .h3 {
    font-size: 12px;
  }
  .h4 {
    font-size: 9px;
  }
  
  .p {
    margin-top: 5px;
    line-height: 50px;
  }
  
  .row {
    left: 0;
    right: 0;
    position: relative;
  }
  div.right {
    width: 15%;
  }
  .text-left {
    text-align: left;
  }
  .text-right {
    text-align: right;
  }
  .text-center {
    text-align: center;
  }
  @media print {
    .customWrap {
      word-wrap: normal !important;
      white-space: normal !important;
      overflow-wrap: break-word;
      -ms-word-break: break-all;
      word-break: break-all;
      word-break: break-word;
    }

    #BrowserPrintDefaults {
      display: none;
    }
    @page {
      size: A4 landscape;
      margin: 0px;
      margin-bottom: 35px;
      left: 0px;
      right: 0px;
      top: 0px;
    }
   
    img.logo {
      width: 110px;
      height: 80px;
      object-fit: fill;
    }

    body {
      top: 0px !important;
      margin: 0px !important;
      left: 0px;
      width: 297mm;
      height: calc(209mm - 35px); 
    }
    thead {
      display: table-header-group !important;
    }
    tfoot {
      display: table-footer-group !important;
    }
    button {
      display: none;
    }
    footer {
      display: none;
      position: fixed;
      bottom: 0;
    }
  }
`

const abrirModal = ref(false)
const dataImpressao = ref(format(new Date(), 'dd/MM/yyyy HH:mm:ss'))
const d = ref(null)

const fecharModal = () => {
  abrirModal.value = false
  emit('update:imprimirRelatorio', false)
}

const print = () => {
  if (!d.value) {
    d.value = new Printd()
  }
  const elemento = `#pagePrint-${props.id}`
  d.value.print(document.querySelector(elemento), [cssText, props.styleP])
}

watch(
  () => props.imprimirRelatorio,
  val => {
    if (val) {
      print()
    }
  }
)

onMounted(() => {
  nextTick(() => {
    window.addEventListener('afterprint', fecharModal)
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('afterprint', fecharModal)
  emit('update:imprimirRelatorio', false)
})
</script>

<style lang="scss" scoped>
#pageInit {
  display: none;
}
</style>
