<template>
  <!-- Contêiner principal do visualizador de código -->
  <div class="code-viewer">
    <!-- Cabeçalho com informações do arquivo e ações -->
    <div class="code-header">
      <div class="file-info">
        <q-icon name="mdi-file-code" size="20px" class="q-mr-sm" />
        <span class="file-name">{{ fileName || 'Código' }}</span>
      </div>
      <div class="actions">
        <!-- Botão para abrir em nova guia, visível apenas se o código for uma URL -->
        <q-btn
          v-if="isUrl"
          flat
          dense
          round
          icon="mdi-open-in-new"
          @click="abrirEmNovaGuia"
        >
          <q-tooltip>Abrir em nova guia</q-tooltip>
        </q-btn>
        <!-- Botão para baixar o arquivo, visível apenas se o código for uma URL -->
        <q-btn
          v-if="isUrl"
          flat
          dense
          round
          icon="mdi-download"
          @click="downloadArquivo"
        >
          <q-tooltip>Baixar arquivo</q-tooltip>
        </q-btn>
        <!-- Botão para copiar o código, sempre visível -->
        <q-btn
          flat
          dense
          round
          icon="mdi-content-copy"
          @click="copiarCodigo"
        >
          <q-tooltip>Copiar código</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- Área de exibição do código -->
    <div class="code-content">
      <!-- Indicador de carregamento exibido enquanto o conteúdo da URL é baixado -->
      <div v-if="loading" class="text-center q-pa-md">
        <q-spinner color="primary" size="2em" />
        <div class="text-caption q-mt-sm">Carregando código...</div>
      </div>
      <!-- Exibição do código com números de linha e realce de sintaxe -->
      <pre v-else class="code-container">
        <div class="line-numbers">
          <div v-for="n in totalLines" :key="n" class="line-number">{{ n }}</div>
        </div>
        <code :class="[getLanguageClass, isSqlFile ? 'code-sql-exact-format' : '']" v-html="highlightedCode"></code>
      </pre>
    </div>
  </div>
</template>

<script>
import hljs from 'highlight.js' // Biblioteca para realce de sintaxe
import 'highlight.js/styles/atom-one-dark.css' // Estilo do realce inspirado no Atom
import axios from 'axios' // Biblioteca para requisições HTTP
import { formatarCodigoSql, formatarCodigo, isSqlFileType, getHighlightLanguage } from '../utils/codeFormat.js'

export default {
  name: 'CodeViewer',

  props: {
    code: {
      type: String,
      default: ''
    },
    fileName: {
      type: String,
      default: ''
    },
    fileType: {
      type: String,
      default: 'plaintext'
    }
  },

  data () {
    return {
      loading: false,
      fileContent: ''
    }
  },

  computed: {
    isUrl () {
      return this.code && this.code.startsWith('http')
    },

    content () {
      return this.fileContent || this.code
    },

    filteredContent () {
      if (!this.content) return ''
      return this.content
    },

    totalLines () {
      return this.filteredContent.split('\n').length
    },

    isSqlFile () {
      return isSqlFileType(this.fileType)
    },

    getLanguageClass () {
      return getHighlightLanguage(this.fileType)
    },

    highlightedCode () {
      if (!this.filteredContent) { return '<span class="hljs-line empty-line" data-line="1"> </span>' }

      const language = this.getLanguageClass

      // Tratamento especial para SQL para preservar formatação exata
      if (this.isSqlFile) {
        const result = hljs.highlight(this.filteredContent, { language })
        return formatarCodigoSql(this.filteredContent, result.value)
      }

      // Para outros tipos de arquivo, usar o comportamento normal com indentação preservada
      const result = hljs.highlight(this.filteredContent, { language })
      return formatarCodigo(this.filteredContent, result.value)
    }
  },

  methods: {
    copiarCodigo () {
      navigator.clipboard.writeText(this.content)
        .then(() => {
          this.$q.notify({
            type: 'positive',
            message: 'Código copiado!',
            position: 'top',
            timeout: 2000
          })
        })
        .catch(() => {
          this.$q.notify({
            type: 'negative',
            message: 'Erro ao copiar código',
            position: 'top',
            timeout: 2000
          })
        })
    },

    async loadFileContent () {
      if (!this.isUrl) return

      this.loading = true
      try {
        const response = await axios.get(this.code)
        this.fileContent = response.data
      } catch (error) {
        console.error('Erro ao carregar arquivo:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Erro ao carregar o arquivo',
          position: 'top',
          timeout: 2000
        })
        this.fileContent = 'Erro ao carregar o arquivo'
      } finally {
        this.loading = false
      }
    },

    abrirEmNovaGuia () {
      if (this.isUrl) {
        const blob = new Blob([this.content], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        window.open(url, '_blank')
      }
    },

    downloadArquivo () {
      if (this.isUrl) {
        const link = document.createElement('a')
        link.href = this.code
        link.download = this.fileName || this.code.split('/').pop()
        link.click()
      }
    }
  },

  watch: {
    code: {
      immediate: true,
      handler (newCode) {
        if (this.isUrl) {
          this.loadFileContent()
        } else {
          this.fileContent = ''
        }
      }
    }
  }
}
</script>

<style lang="scss">
// Definição de variáveis para facilitar a manutenção das cores e estilos
$bg-dark: #121212; // Cor de fundo principal mais escura
$bg-code: #1E1E1E; // Cor de fundo do código
$bg-header: #252526; // Cor de fundo do cabeçalho, ligeiramente mais clara que o fundo principal
$border-color: #3C3C3C; // Cor da borda para separar elementos, tom médio de cinza
$text-light: #CCCCCC; // Cor do texto principal, cinza claro para contraste com o fundo escuro
$line-number-color: #858585; // Cor dos números das linhas, cinza médio para ser visível mas não distrair
$highlight: #569CD6; // Cor para palavras-chave e tags, azul claro para destaque
$string-color: #D69D85; // Cor para strings, tom alaranjado para facilitar identificação
$comment-color: #6A9955; // Cor para comentários, verde médio para diferenciar do código
$scroll-thumb: #333333; // Cor da barra de rolagem, cinza escuro para integrar com o tema
$scroll-thumb-hover: #454545; // Cor da barra ao passar o mouse, cinza mais claro para feedback visual

// Mixin para flexbox centralizado com espaçamento entre os elementos
@mixin flex-between {
  display: flex; // Ativa o modelo de layout flexbox
  justify-content: space-between; // Distribui o espaço disponível entre os itens
  align-items: center; // Centraliza os itens verticalmente
}

// Mixin para flexbox com alinhamento central
@mixin flex-center {
  display: flex; // Ativa o modelo de layout flexbox
  align-items: center; // Centraliza os itens verticalmente
}

// Mixin para estilizar a barra de rolagem personalizada
@mixin scrollbar {
  &::-webkit-scrollbar {
    width: 12px; // Define a largura da barra de rolagem vertical
    height: 12px; // Define a altura da barra de rolagem horizontal
  }
  &::-webkit-scrollbar-track {
    background: $bg-dark; // Define o fundo da trilha da barra de rolagem
  }
  &::-webkit-scrollbar-thumb {
    background: $scroll-thumb; // Define a cor do "polegar" da barra de rolagem
    border-radius: 6px; // Arredonda as bordas da barra de rolagem
    &:hover {
      background: $scroll-thumb-hover; // Muda a cor ao passar o mouse para feedback visual
    }
  }
}

// Estilização do contêiner principal do visualizador de código
.code-viewer {
  background: $bg-dark; // Define a cor de fundo do visualizador
  border-radius: 8px; // Arredonda os cantos do visualizador
  overflow: hidden; // Esconde qualquer conteúdo que ultrapasse os limites
  margin: 8px 0; // Adiciona espaço acima e abaixo do visualizador
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); // Sombra mais pronunciada
  border: 1px solid $border-color; // Adiciona borda para destacar o contêiner
  min-width: 750px;

  // Estilização do cabeçalho
  .code-header {
    @include flex-between; // Aplica o mixin de flexbox com espaçamento entre elementos
    padding: 8px 16px; // Adiciona espaço interno no cabeçalho
    background: $bg-header; // Define a cor de fundo do cabeçalho
    border-bottom: 1px solid $border-color; // Adiciona linha divisória abaixo do cabeçalho

    .file-info {
      @include flex-center; // Aplica o mixin de flexbox centralizado
      color: $text-light; // Define a cor do texto das informações do arquivo
      .file-name {
        font-size: 0.9em; // Tamanho da fonte do nome do arquivo
        font-weight: 500; // Peso da fonte médio para destacar levemente
      }
    }

    .q-icon,
    .actions .q-btn {
      color: $text-light; // Define a cor dos ícones e botões no cabeçalho
    }
  }

  // Área de conteúdo do código
  .code-content {
    padding: 0; // Remove espaçamento interno
    background: $bg-code; // Define cor de fundo do código
    max-height: calc(20 * 1.5em); // Limita altura a 20 linhas para não ocupar muito espaço
    overflow: hidden; // Esconde o conteúdo que ultrapassar os limites
    position: relative; // Estabelece um contexto de posicionamento para elementos filhos
    padding: 8px 0; // Adiciona espaçamento vertical

    &:hover {
      overflow: auto; // Mostra barras de rolagem ao passar o mouse
    }

    @include scrollbar; // Aplica o estilo personalizado de barra de rolagem

    pre.code-container {
      display: grid; // Usa grid layout para alinhar números e código
      grid-template-columns: auto 1fr; // Primeira coluna ajustável, segunda ocupa espaço restante
      align-items: stretch; // Estica os itens para ocupar toda a altura disponível
      margin: 0; // Remove margens
      padding: 0; // Remove espaçamento interno
      background: transparent; // Torna o fundo transparente
      overflow: hidden; // Esconde conteúdo que ultrapassar limites
      font-family: 'Fira Code', monospace; // Fonte monoespaçada para todo o contêiner

      // Números das linhas
      .line-numbers {
        text-align: right; // Alinha números à direita
        padding-right: 0; // Removido o padding do contêiner
        background: $bg-dark; // Cor de fundo mais escura para a coluna de números
        color: $line-number-color; // Cor específica para números de linha
        border-right: 1px solid $border-color; // Linha divisória à direita
        padding-top: 4px; // Pequeno espaço no topo
        padding-bottom: 4px; // Pequeno espaço na base
        user-select: none; // Impede seleção de texto para melhor experiência
        font-family: 'Fira Code', monospace; // Fonte monoespaçada para alinhamento
        font-size: 14px; // Tamanho da fonte consistente
        line-height: 1.5em; // Altura da linha para espaçamento vertical
        display: flex; // Usa flexbox para organizar números verticalmente
        flex-direction: column; // Empilha números verticalmente
      }

      // Código propriamente dito
      code {
        font-family: 'Fira Code', monospace; // Fonte monoespaçada ideal para código
        font-size: 14px; // Tamanho da fonte consistente
        white-space: pre; // Preserva espaços e quebras de linha do código
        color: #D4D4D4; // Cor clara para o texto do código
        flex: 1; // Ocupa espaço disponível
        line-height: 1.5em; // Altura da linha consistente com os números
        display: flex; // Usa flexbox para organizar linhas verticalmente
        flex-direction: column; // Empilha linhas verticalmente
        padding-top: 4px; // Pequeno espaço no topo
        padding-bottom: 4px; // Pequeno espaço na base
        background: $bg-code; // Cor de fundo para a área de código
      }
    }
  }

  // Estilos para destaque de sintaxe
  .hljs-tag,
  .hljs-name,
  .hljs-keyword {
    color: $highlight; // Cor azul para tags, nomes e palavras-chave
    font-weight: 500; // Peso médio para destacar palavras-chave
  }

  .hljs-attr,
  .hljs-string {
    color: $string-color; // Cor alaranjada para atributos e strings
  }

  .hljs-comment {
    color: $comment-color; // Cor verde para comentários
    font-style: italic; // Estilo itálico para comentários
  }

  // Adiciona estilos específicos para SQL e outros tipos de código
  .hljs-built_in,
  .hljs-function,
  .hljs-title {
    color: #DCDCAA; // Amarelo claro para funções e propriedades built-in
  }

  .hljs-number,
  .hljs-literal {
    color: #B5CEA8; // Verde claro para números e literais
  }

  .hljs-operator,
  .hljs-punctuation {
    color: #D4D4D4; // Cor padrão para operadores e pontuação
  }

  .hljs-variable {
    color: #9CDCFE; // Azul claro para variáveis
  }

  // Estilização do tooltip
  .q-tooltip {
    background: $scroll-thumb; // Fundo escuro para o tooltip
    color: #FFFFFF; // Texto branco para contraste
    font-size: 12px; // Fonte menor para o tooltip
    padding: 4px 8px; // Espaçamento interno
    border-radius: 4px; // Cantos arredondados
  }
}

// Estilização dos botões de ação
.actions {
  display: flex; // Usa flexbox para os botões
  gap: 4px; // Espaçamento entre os botões
}

// Estilização individual para números de linha e para linhas de código
// Ambos seguem a mesma hierarquia e estrutura CSS
.line-number {
  display: flex; // Usa flexbox para centralizar conteúdo
  align-items: center; // Centraliza verticalmente
  justify-content: flex-end; // Alinha números à direita
  height: 1.5em; // Altura fixa para cada número
  line-height: 1.5em; // Altura da linha consistente
  margin: 0; // Remove margens
  padding: 0; // Remove padding geral
  padding-right: 12px; // Aumenta o espaço à direita para melhor separação
  text-align: right; // Alinha texto à direita
  min-width: 28px; // Largura mínima para os números de linha
  color: #858585; // Cor cinza médio para números de linha

  &:hover {
    background: rgba(255, 255, 255, 0.05); // Destaque sutil ao passar o mouse
  }
}

.hljs-line {
  display: flex; // Usa flexbox para centralizar conteúdo
  align-items: center; // Centraliza verticalmente
  height: 1.5em; // Altura fixa para cada linha
  line-height: 1.5em; // Espaçamento vertical consistente
  margin: 0; // Remove margens
  padding: 0; // Remove padding geral
  padding-left: 16px; // Aumenta o espaço à esquerda para melhor legibilidade
  position: relative; // Estabelece contexto para posicionamento

  &:hover {
    background: rgba(255, 255, 255, 0.05); // Destaque sutil ao passar o mouse
  }

  &.empty-line {
    height: 1.5em; // Mantém altura mesmo em linhas vazias
  }
}

// Adiciona estilo para o contêiner de código para SQL específicamente
.language-sql,
.language-mysql,
.language-pgsql {
  white-space: pre !important; // Garante que todos os espaços são respeitados

  .hljs-line {
    white-space: pre !important; // Preserva espaços
  }

  .hljs-keyword {
    color: #CF8BF0; // Roxo mais claro para palavras-chave SQL (UPDATE, SET, WHERE)
    font-weight: bold; // Negrito para destacar
    text-transform: uppercase; // Mantém maiúsculas para keywords SQL
  }

  .hljs-string {
    color: #CE9178; // Laranja avermelhado para strings
  }

  .hljs-variable,
  .hljs-attr {
    color: #9CDCFE; // Azul para variáveis e nomes de coluna
  }

  .hljs-operator,
  .hljs-punctuation {
    color: #D4D4D4; // Cor padrão para operadores e pontuação
  }

  .hljs-built_in {
    color: #DCDCAA; // Amarelo para funções built-in
  }

  .hljs-params {
    color: #9CDCFE; // Azul claro para parâmetros
  }

  .hljs-type {
    color: #4EC9B0; // Verde azulado para tipos
  }

  .hljs-number {
    color: #B5CEA8; // Verde claro para números
  }

  .hljs-comment {
    color: #6A9955; // Verde para comentários
    font-style: italic; // Itálico para comentários
  }
}

// Destaque para símbolos especiais e operadores comuns em SQL
.hljs .token.operator,
.hljs .token.entity,
.hljs .token.url,
.hljs-operator {
  color: #D4D4D4; // Cor clara padrão para operadores
  background: transparent; // Remove qualquer background
}

// Estilo específico para símbolos como =, <, >
.language-sql .hljs-operator {
  color: white; // Branco para operadores em SQL
  font-weight: normal; // Peso normal
}

// Estilo específico para o SQL com formatação exata
.code-sql-exact-format {
  white-space: pre !important;
  font-family: 'Fira Code', monospace !important;

  .hljs-line {
    white-space: pre !important;
    tab-size: 4;
  }
}
</style>
