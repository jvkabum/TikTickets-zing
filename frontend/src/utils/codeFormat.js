/**
 * Utilitários para formatação de código no CodeViewer
 */

// Mapeamento de extensões de arquivo para linguagens do highlight.js
const LANGUAGE_MAP = {
  // Linguagens Web
  js: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  html: 'html',
  xml: 'xml',
  css: 'css',
  scss: 'scss',
  less: 'less',
  vue: 'html',
  svelte: 'html',

  // Linguagens de Backend
  php: 'php',
  py: 'python',
  rb: 'ruby',
  java: 'java',
  kt: 'kotlin',
  scala: 'scala',
  go: 'go',
  rs: 'rust',
  cs: 'csharp',
  fs: 'fsharp',
  swift: 'swift',
  perl: 'perl',
  lua: 'lua',
  dart: 'dart',

  // Bancos de Dados
  sql: 'sql',
  mysql: 'sql',
  pgsql: 'sql',
  plsql: 'sql',
  mongodb: 'javascript',
  redis: 'redis',

  // DevOps e Configuração
  dockerfile: 'dockerfile',
  yaml: 'yaml',
  yml: 'yaml',
  toml: 'toml',
  ini: 'ini',
  conf: 'apache',
  sh: 'bash',
  bash: 'bash',
  zsh: 'bash',
  fish: 'fish',
  ps1: 'powershell',

  // Dados e Análise
  json: 'json',
  jsonc: 'json',
  csv: 'plaintext',
  r: 'r',
  julia: 'julia',
  matlab: 'matlab',

  // Mobile
  objc: 'objectivec',
  m: 'objectivec',
  mm: 'objectivec',
  gradle: 'gradle',

  // Outros
  md: 'markdown',
  mdx: 'markdown',
  tex: 'latex',
  cmake: 'cmake',
  makefile: 'makefile',
  graphql: 'graphql',
  proto: 'protobuf',
  sol: 'solidity',
  asm: 'x86asm',

  // Linguagens de Baixo Nível
  c: 'c',
  h: 'c',
  cpp: 'cpp',
  hpp: 'cpp',

  // Fallback
  txt: 'plaintext',
  log: 'plaintext'
}

/**
 * Formata código SQL para exibição preservando espaços e indentação exata
 * @param {string} code - Código SQL a ser formatado
 * @param {string} highlightedCode - Código já processado pelo highlight.js
 * @returns {string} - Código formatado com HTML para exibição
 */
export function formatarCodigoSql (code, highlightedCode) {
  if (!code) {
    return ''
  }

  const highlightedLines = highlightedCode.split('\n')
  const originalLines = code.split('\n')

  const formattedLines = originalLines.map((line, index) => {
    // Se a linha está vazia, retorna uma linha vazia com div
    if (!line.trim()) {
      return `<div class="hljs-line empty-line" data-line="${index + 1}">&nbsp;</div>`
    }

    // Obtém a linha destacada correspondente
    const highlightedLine = highlightedLines[index] || ''

    // Preserva os espaços exatos do início da linha original
    const leadingSpaces = line.match(/^(\s*)/)[0]
    const leadingSpacesHtml = leadingSpaces.replace(/ /g, '&nbsp;')

    // Combina os espaços preservados com o conteúdo destacado
    const finalLine = leadingSpacesHtml + highlightedLine.trimStart()

    // Usa div para garantir que cada linha seja um bloco independente
    return `<div class="hljs-line" data-line="${index + 1}">${finalLine}</div>`
  })

  // Retorna as linhas unidas apenas com quebra de linha
  return formattedLines.join('\n')
}

/**
 * Formata código para exibição preservando indentação, compatível com qualquer linguagem do highlight.js
 * @param {string} code - Código original
 * @param {string} highlightedCode - Código já processado pelo highlight.js
 * @returns {string} - Código formatado com HTML para exibição
 */
export function formatarCodigo (code, highlightedCode) {
  if (!code) {
    return ''
  }

  const highlightedLines = highlightedCode.split('\n')
  const originalLines = code.split('\n')

  const formattedLines = originalLines.map((line, index) => {
    const leadingSpaces = line.match(/^(\s*)/)[0]
    const spacesHtml = leadingSpaces.replace(/ /g, '&nbsp;')

    if (!line.trim()) {
      return `<div class="hljs-line empty-line" data-line="${index + 1}">&nbsp;</div>`
    }

    const highlightedLine = highlightedLines[index] || ''
    const finalLine = spacesHtml + highlightedLine.trimStart()

    // Usa div para garantir que cada linha seja um bloco independente
    return `<div class="hljs-line" data-line="${index + 1}">${finalLine}</div>`
  })

  // Retorna as linhas unidas apenas com quebra de linha
  return formattedLines.join('\n')
}

/**
 * Verifica se o tipo de arquivo é SQL
 * @param {string} fileType - Extensão ou tipo do arquivo
 * @returns {boolean} - True se for um arquivo SQL
 */
export function isSqlFileType (fileType) {
  return ['sql', 'mysql', 'pgsql', 'plsql'].includes(fileType.toLowerCase())
}

/**
 * Obtém a linguagem do highlight.js para um determinado tipo de arquivo
 * @param {string} fileType - Extensão ou tipo do arquivo
 * @returns {string} - Nome da linguagem para o highlight.js
 */
export function getHighlightLanguage (fileType) {
  const type = fileType.toLowerCase().replace('.', '')
  return LANGUAGE_MAP[type] || 'plaintext'
}
