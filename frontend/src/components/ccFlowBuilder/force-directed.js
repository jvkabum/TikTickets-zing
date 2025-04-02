/**
 * Baseado em https://github.com/chaangliu/ForceDirectedLayout/blob/master/javascript/force-directed.js
 * Algoritmos de layout para organização de nós em um grafo.
 */
const CANVAS_WIDTH = 2000
const CANVAS_HEIGHT = 2000
let k
let mNodeList = []
let mLinkList = []
let mDxMap = {}
let mDyMap = {}
let mNodeMap = {}

// Tamanho padrão de um nó para cálculos de sobreposição
const NODE_WIDTH = 220
const NODE_HEIGHT = 100
// Valores ajustáveis para o espaçamento
const MAX_NODE_DISTANCE = 300 // Distância máxima entre nós quando há poucos
const MIN_NODE_DISTANCE = 180 // Distância mínima entre nós quando há muitos
const SAFETY_MARGIN = 80 // Margem de segurança ajustada

export function ForceDirected (data = {}, layout = 'force') {
  // Limpa as variáveis
  k = 0
  mNodeList = []
  mLinkList = []
  mDxMap = {}
  mDyMap = {}
  mNodeMap = {}

  // Prepara os dados
  const nodeList = data.nodeList
  for (let i = 0; i < nodeList.length; i++) {
    const node = nodeList[i]
    mNodeList.push(node)
  }

  // Converte linhas para arestas
  const lineList = data.lineList
  for (let i = 0; i < lineList.length; i++) {
    const line = lineList[i]
    const edge = new Edge(line.from, line.to)
    mLinkList.push(edge)
  }

  // Cria o mapa de nós para pesquisa rápida
  for (let i = 0; i < mNodeList.length; i++) {
    const node = mNodeList[i]
    if (node) {
      mNodeMap[node.id] = node
    }
  }

  // Calcula o espaçamento ideal com base no número de nós
  // Fórmula adaptativa: menos nós = menor distância, mais nós = maior distância (até o limite)
  const nodeCount = mNodeList.length
  // Ajustamos dinâmicamente a distância entre nós baseado na quantidade
  let dynamicNodeDistance
  if (nodeCount <= 5) {
    // Para poucos nós, usamos um espaçamento menor
    dynamicNodeDistance = MIN_NODE_DISTANCE
  } else if (nodeCount >= 15) {
    // Para muitos nós, usamos o espaçamento maior
    dynamicNodeDistance = MAX_NODE_DISTANCE
  } else {
    // Para quantidades intermediárias, interpolamos linearmente
    const factor = (nodeCount - 5) / 10 // De 0 a 1
    dynamicNodeDistance = MIN_NODE_DISTANCE + factor * (MAX_NODE_DISTANCE - MIN_NODE_DISTANCE)
  }

  // Atribuímos o valor calculado a uma variável global usada pelos algoritmos
  window.currentNodeDistance = dynamicNodeDistance

  // Aplica o layout escolhido
  switch (layout) {
    case 'tree':
      // Layout em árvore - Organiza os nós em uma estrutura hierárquica
      treeLayout()
      break
    case 'level':
      // Layout em níveis - Organiza os nós horizontalmente em linhas por níveis
      levelLayout()
      break
    case 'circle':
      // Layout circular - Organiza os nós em círculos concêntricos, colocando nós conectados próximos
      circleLayout()
      break
    case 'grid':
      // Layout em grade - Organiza os nós em uma grade uniforme
      gridLayout()
      break
    case 'hubRadial':
      // Layout Hub Radial - Organiza nós complexos em torno de um centro
      hubRadialLayout()
      break
    case 'force':
    default:
      // Layout de força dirigida - Organiza os nós usando forças de atração/repulsão
      forceLayout()
      break
  }

  // Verifica e resolve sobreposições
  resolveOverlaps()

  // Garante que nenhum nó fique fora dos limites do container
  ensureNodesWithinBounds()

  // Adiciona 'px' às coordenadas
  for (let i = 0; i < mNodeList.length; i++) {
    const node = mNodeList[i]

    // Tratamento especial para o nó "Início"
    if (node.id === 'start' || node.id === '1') {
      // Garante que o nó "Início" tenha exatamente left: 50px no HTML final
      node.left = '50px'
      node.top = Math.round(node.y) + 'px'
      console.log('Posição final do nó Início (em CSS): left=' + node.left + ', top=' + node.top)
    } else {
      // Processamento normal para os outros nós
      node.left = Math.round(node.x) + 'px'
      node.top = Math.round(node.y) + 'px'
    }

    // Remove as propriedades x e y após conversão
    node.x = undefined
    node.y = undefined
  }

  data.nodeList = mNodeList
  return data
}

/**
 * Verifica e resolve sobreposições entre os nós
 */
function resolveOverlaps () {
  const iterations = 50
  let moved = true
  let iteration = 0

  // Usa o valor dinâmico de espaçamento que calculamos
  const nodeDistance = window.currentNodeDistance || MIN_NODE_DISTANCE

  while (moved && iteration < iterations) {
    moved = false
    iteration++

    for (let i = 0; i < mNodeList.length; i++) {
      const nodeA = mNodeList[i]
      let dx = 0
      let dy = 0

      for (let j = 0; j < mNodeList.length; j++) {
        if (i === j) continue

        const nodeB = mNodeList[j]
        const overlapX = (NODE_WIDTH + nodeDistance) - Math.abs(nodeA.x - nodeB.x)
        const overlapY = (NODE_HEIGHT + nodeDistance) - Math.abs(nodeA.y - nodeB.y)

        // Se há sobreposição em ambas as direções
        if (overlapX > 0 && overlapY > 0) {
          moved = true

          // Cálculo da direção de repulsão
          const dirX = nodeA.x < nodeB.x ? -1 : 1
          const dirY = nodeA.y < nodeB.y ? -1 : 1

          // Move mais na direção onde a sobreposição é menor
          if (overlapX < overlapY) {
            dx += dirX * (overlapX / 2 + 5)
          } else {
            dy += dirY * (overlapY / 2 + 5)
          }
        }
      }

      // Aplica o movimento calculado
      if (dx !== 0 || dy !== 0) {
        nodeA.x += dx
        nodeA.y += dy
      }
    }
  }
}

/**
 * Layout baseado em força dirigida (o original)
 */
function forceLayout () {
  if (mNodeList && mLinkList) {
    // Ajustamos o fator k com base na distância dinâmica entre nós
    const nodeDistance = window.currentNodeDistance || MIN_NODE_DISTANCE
    // Reduzimos o fator quando há poucos nós para não espalhar tanto
    k = Math.sqrt(CANVAS_WIDTH * CANVAS_HEIGHT / (mNodeList.length * 1.5)) * (nodeDistance / 200)
  }

  // Determinar posições iniciais de forma determinística
  // Em vez de usar números aleatórios, usar uma distribuição circular
  const centerX = CANVAS_WIDTH * 0.5
  const centerY = CANVAS_HEIGHT * 0.5
  const nodeCount = mNodeList.length

  // Ajustar o raio inicial com base na quantidade de nós
  // Para poucos nós, usamos um raio menor para manter o grupo mais compacto
  const radius = Math.min(CANVAS_WIDTH, CANVAS_HEIGHT) * (nodeCount < 5 ? 0.15 : (nodeCount < 10 ? 0.25 : 0.35))

  for (let i = 0; i < mNodeList.length; i++) {
    // Distribuição circular uniforme
    const angle = (i / nodeCount) * 2 * Math.PI
    // Variação no raio para evitar sobreposições iniciais
    // Para poucos nós, mantemos o raio mais consistente
    const nodeRadius = nodeCount < 5
      ? radius * (0.85 + (i % 3) * 0.05)
      : radius * (0.7 + (i % 5) * 0.1)

    mNodeList[i].x = centerX + nodeRadius * Math.cos(angle)
    mNodeList[i].y = centerY + nodeRadius * Math.sin(angle)
  }

  // Aumentamos o número de iterações para melhor distribuição
  for (let i = 0; i < 500; i++) {
    calculateRepulsive()
    calculateTraction()
    updateCoordinates()

    // A cada 50 iterações, aplicamos força extra de separação
    if (i % 50 === 0) {
      resolveDirectOverlaps()
    }
  }

  // Aplica forças extras de separação para garantir que não haja sobreposições
  for (let i = 0; i < 8; i++) {
    resolveDirectOverlaps()
  }

  // Aplica o layout final
  applyFinalLayout()
}

/**
 * Resolve diretamente as sobreposições aplicando forças de separação
 */
function resolveDirectOverlaps () {
  // Usa o valor dinâmico para o espaçamento mínimo
  const nodeDistance = window.currentNodeDistance || MIN_NODE_DISTANCE
  const minDistance = nodeDistance * 0.8 + NODE_WIDTH // Ajustamos usando o espaçamento dinâmico

  // Fazemos mais iterações para garantir uma separação efetiva
  for (let iter = 0; iter < 5; iter++) {
    for (let i = 0; i < mNodeList.length; i++) {
      const nodeA = mNodeList[i]

      for (let j = i + 1; j < mNodeList.length; j++) {
        const nodeB = mNodeList[j]

        const dx = nodeB.x - nodeA.x
        const dy = nodeB.y - nodeA.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        // Se os nós estão muito próximos (usando uma distância maior)
        if (distance < minDistance) {
          // Calculamos quanto eles precisam se afastar
          const overlap = minDistance - distance

          // Direção do movimento
          const moveX = dx === 0 ? (Math.random() < 0.5 ? -1 : 1) : dx / distance
          const moveY = dy === 0 ? (Math.random() < 0.5 ? -1 : 1) : dy / distance

          // Movemos cada nó na direção oposta, com força maior para separação rápida
          const adjustX = moveX * overlap * 1.2 // Força de repulsão aumentada
          const adjustY = moveY * overlap * 1.2 // Força de repulsão aumentada

          nodeA.x -= adjustX
          nodeA.y -= adjustY
          nodeB.x += adjustX
          nodeB.y += adjustY
        }
      }
    }
  }
}

/**
 * Calcula forças repulsivas entre os nós.
 */
function calculateRepulsive () {
  // Aumentado para maior força de repulsão
  let ejectFactor = 12
  let distX, distY, dist
  for (let i = 0; i < mNodeList.length; i++) {
    mDxMap[mNodeList[i].id] = 0.0
    mDyMap[mNodeList[i].id] = 0.0
    for (let j = 0; j < mNodeList.length; j++) {
      if (i !== j) {
        distX = mNodeList[i].x - mNodeList[j].x
        distY = mNodeList[i].y - mNodeList[j].y
        dist = Math.sqrt(distX * distX + distY * distY)
      }
      if (dist < 80) { // Aumentado para detectar proximidade maior
        ejectFactor = 15 // Força maior para nós muito próximos
      }
      // Efeito em distâncias maiores para melhorar distribuição
      if (dist > 0 && dist < 400) {
        const id = mNodeList[i].id
        mDxMap[id] = mDxMap[id] + distX / dist * k * k / dist * ejectFactor
        mDyMap[id] = mDyMap[id] + distY / dist * k * k / dist * ejectFactor
      }
    }
  }
}

/**
 * Calcula forças de atração nas arestas.
 */
function calculateTraction () {
  // Reduzido para permitir maior distância entre nós conectados
  const condenseFactor = 2.0
  let startNode, endNode
  for (let e = 0; e < mLinkList.length; e++) {
    const eStartID = mLinkList[e].source
    const eEndID = mLinkList[e].target
    startNode = mNodeMap[eStartID]
    endNode = mNodeMap[eEndID]
    if (!startNode) {
      console.log('Cannot find start node id: ' + eStartID + ', please check it out.')
      return
    }
    if (!endNode) {
      console.log('Cannot find end node id: ' + eEndID + ', please check it out.')
      return
    }
    const distX = startNode.x - endNode.x
    const distY = startNode.y - endNode.y
    const dist = Math.sqrt(distX * distX + distY * distY)

    // Limita a atração para não juntar demais os nós
    const capDist = Math.min(dist, NODE_WIDTH * 3)

    mDxMap[eStartID] = mDxMap[eStartID] - distX * capDist / k * condenseFactor
    mDyMap[eStartID] = mDyMap[eStartID] - distY * capDist / k * condenseFactor
    mDxMap[eEndID] = mDxMap[eEndID] + distX * capDist / k * condenseFactor
    mDyMap[eEndID] = mDyMap[eEndID] + distY * capDist / k * condenseFactor
  }
}

/**
 * Atualiza as coordenadas dos nós.
 */
function updateCoordinates () {
  // Aumentados para permitir movimentos maiores
  const maxt = 8, maxty = 7
  for (let v = 0; v < mNodeList.length; v++) {
    const node = mNodeList[v]
    let dx = Math.floor(mDxMap[node.id])
    let dy = Math.floor(mDyMap[node.id])

    if (dx < -maxt) dx = -maxt
    if (dx > maxt) dx = maxt
    if (dy < -maxty) dy = -maxty
    if (dy > maxty) dy = maxty

    // Limita o movimento para manter dentro dos limites do canvas
    const newX = node.x + dx
    const newY = node.y + dy

    if (newX >= SAFETY_MARGIN && newX <= CANVAS_WIDTH - SAFETY_MARGIN) {
      node.x = newX
    } else {
      // Se for sair dos limites, aplica uma força contrária
      node.x = node.x - dx * 0.5
    }

    if (newY >= SAFETY_MARGIN && newY <= CANVAS_HEIGHT - SAFETY_MARGIN) {
      node.y = newY
    } else {
      // Se for sair dos limites, aplica uma força contrária
      node.y = node.y - dy * 0.5
    }
  }
}

/**
 * Garante que todos os nós fiquem dentro dos limites do container
 */
function ensureNodesWithinBounds () {
  // Encontra os valores mínimos e máximos atuais de x e y
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (let i = 0; i < mNodeList.length; i++) {
    const node = mNodeList[i]
    minX = Math.min(minX, node.x)
    minY = Math.min(minY, node.y)
    maxX = Math.max(maxX, node.x)
    maxY = Math.max(maxY, node.y)
  }

  // Calcula quanto precisa deslocar para todos ficarem visíveis
  const offsetX = minX < SAFETY_MARGIN ? SAFETY_MARGIN - minX : 0
  const offsetY = minY < SAFETY_MARGIN ? SAFETY_MARGIN - minY : 0

  // Verifica se está excedendo limites à direita/abaixo
  const rightLimit = CANVAS_WIDTH - SAFETY_MARGIN
  const bottomLimit = CANVAS_HEIGHT - SAFETY_MARGIN
  const scaleX = maxX + offsetX > rightLimit ? (rightLimit - SAFETY_MARGIN) / (maxX + offsetX - SAFETY_MARGIN) : 1
  const scaleY = maxY + offsetY > bottomLimit ? (bottomLimit - SAFETY_MARGIN) / (maxY + offsetY - SAFETY_MARGIN) : 1

  // Aplica o menor fator de escala para manter a proporção
  const scale = Math.min(scaleX, scaleY, 1)

  // Ajusta todos os nós
  for (let i = 0; i < mNodeList.length; i++) {
    const node = mNodeList[i]

    // Primeiro adiciona offset para evitar corte na esquerda/acima
    node.x += offsetX
    node.y += offsetY

    // Depois aplica escala se necessário para evitar corte na direita/abaixo
    if (scale < 1) {
      const centerX = CANVAS_WIDTH / 2
      const centerY = CANVAS_HEIGHT / 2
      node.x = centerX + (node.x - centerX) * scale
      node.y = centerY + (node.y - centerY) * scale
    }
  }
}

/**
 * Layout em árvore vertical
 * Organiza os nós em uma estrutura hierárquica
 */
function treeLayout () {
  // Encontra o nó raiz (aquele que não tem arestas de entrada)
  const incomingEdges = {}

  // Inicializa contagem de arestas de entrada
  for (let i = 0; i < mNodeList.length; i++) {
    incomingEdges[mNodeList[i].id] = 0
  }

  // Conta arestas de entrada para cada nó
  for (let i = 0; i < mLinkList.length; i++) {
    const edge = mLinkList[i]
    incomingEdges[edge.target] = (incomingEdges[edge.target] || 0) + 1
  }

  // Encontra possíveis raízes (nós sem arestas de entrada)
  let roots = []
  for (let i = 0; i < mNodeList.length; i++) {
    const nodeId = mNodeList[i].id
    if (incomingEdges[nodeId] === 0) {
      roots.push(nodeId)
    }
  }

  // Se não houver raiz clara, usa o primeiro nó
  if (roots.length === 0 && mNodeList.length > 0) {
    roots = [mNodeList[0].id]
  }

  // Largura e altura do layout
  const levelHeight = 500 // Espaçamento vertical entre níveis - MUITO AUMENTADO
  const nodeWidth = 500 // Espaçamento horizontal entre nós - MUITO AUMENTADO

  // Encontrar o nó "Início" como raiz do fluxo
  let inicioId = null

  // Encontra o nó "Início" ou "inicio"
  for (let i = 0; i < mNodeList.length; i++) {
    const nodeLabel = mNodeList[i].label || ''
    if (nodeLabel.includes('Início') || nodeLabel.includes('inicio') || nodeLabel.includes('Inicio')) {
      inicioId = mNodeList[i].id
      break
    }
  }

  // Se não encontrou o nó "Início", usa o primeiro nó raiz
  if (!inicioId && roots.length > 0) {
    inicioId = roots[0]
  }

  // Use as conexões existentes para determinar a hierarquia
  // Criamos um mapa das conexões existentes
  const connections = {}

  // Inicializa conexões vazias para cada nó
  for (let i = 0; i < mNodeList.length; i++) {
    connections[mNodeList[i].id] = []
  }

  // Preencher as conexões do grafo real
  for (let i = 0; i < mLinkList.length; i++) {
    const edge = mLinkList[i]
    connections[edge.source].push(edge.target)
  }

  // Análise automática da hierarquia
  const hierarchyLevels = {}
  const hierarchyParent = {}

  // Inicializa o nó raiz (Início)
  if (inicioId) {
    hierarchyLevels[inicioId] = 0
  } else if (roots.length > 0) {
    hierarchyLevels[roots[0]] = 0
    inicioId = roots[0]
  } else if (mNodeList.length > 0) {
    // Se não houver raízes nem início, usa o primeiro nó
    inicioId = mNodeList[0].id
    hierarchyLevels[inicioId] = 0
  }

  // BFS para definir a hierarquia
  const queue = inicioId ? [inicioId] : []
  const visited = {}

  while (queue.length > 0) {
    const currentId = queue.shift()
    visited[currentId] = true
    const currentLevel = hierarchyLevels[currentId] || 0

    // Processa os filhos deste nó
    const childrenIds = connections[currentId] || []
    for (const childId of childrenIds) {
      if (!visited[childId]) {
        hierarchyLevels[childId] = currentLevel + 1
        hierarchyParent[childId] = currentId
        queue.push(childId)
      }
    }
  }

  // Se houver nós não visitados, adicioná-los ao final
  for (let i = 0; i < mNodeList.length; i++) {
    const nodeId = mNodeList[i].id
    if (!hierarchyLevels[nodeId]) {
      hierarchyLevels[nodeId] = 1 // Nível 1 por padrão se não conectado
    }
  }

  // Agrupa nós por nível
  const nodesByLevel = {}
  let maxLevel = 0

  for (const nodeId in hierarchyLevels) {
    const level = hierarchyLevels[nodeId]
    maxLevel = Math.max(maxLevel, level)

    if (!nodesByLevel[level]) {
      nodesByLevel[level] = []
    }
    nodesByLevel[level].push(nodeId)
  }

  // Posiciona os nós em cada nível, do topo para baixo
  for (let level = 0; level <= maxLevel; level++) {
    const nodesInLevel = nodesByLevel[level] || []

    // Calcula a largura total que os nós ocuparão
    const totalWidth = nodesInLevel.length * nodeWidth
    // Posição inicial para centralizar o nível
    const startX = (CANVAS_WIDTH - totalWidth) / 2 + nodeWidth / 2

    // Posiciona cada nó no nível
    for (let i = 0; i < nodesInLevel.length; i++) {
      const nodeId = nodesInLevel[i]

      // Encontra o nó e atualiza sua posição
      for (let j = 0; j < mNodeList.length; j++) {
        if (mNodeList[j].id === nodeId) {
          // Posição X baseada no índice no nível
          mNodeList[j].x = startX + i * nodeWidth
          // Posição Y baseada no nível (de cima para baixo)
          mNodeList[j].y = 100 + level * levelHeight
          break
        }
      }
    }
  }

  // Alinhamento vertical de filhos com seus pais
  // Para cada pai, encontramos seus filhos diretos
  const childrenByParent = {}

  // Agrupa filhos por pai
  for (const childId in hierarchyParent) {
    const parentId = hierarchyParent[childId]

    if (!childrenByParent[parentId]) {
      childrenByParent[parentId] = []
    }

    childrenByParent[parentId].push(childId)
  }

  // Para cada pai com filhos, alinha verticalmente
  for (const parentId in childrenByParent) {
    const childrenIds = childrenByParent[parentId]

    // Encontra o nó pai
    const parentNode = mNodeList.find(node => node.id === parentId)
    if (!parentNode) continue

    // Se tiver apenas um filho, alinha diretamente
    if (childrenIds.length === 1) {
      const childId = childrenIds[0]
      const childNode = mNodeList.find(node => node.id === childId)

      if (childNode) {
        childNode.x = parentNode.x
      }
    } else if (childrenIds.length > 1) {
      const totalWidth = (childrenIds.length - 1) * nodeWidth
      const startX = parentNode.x - totalWidth / 2

      for (let i = 0; i < childrenIds.length; i++) {
        const childId = childrenIds[i]
        const childNode = mNodeList.find(node => node.id === childId)

        if (childNode) {
          childNode.x = startX + i * nodeWidth
        }
      }
    }
  }
}

/**
 * Layout em níveis - organiza os nós em níveis horizontais
 */
function levelLayout () {
  // Análise topológica para encontrar níveis
  const incomingEdges = {}

  // Inicializa contagem de arestas de entrada
  for (let i = 0; i < mNodeList.length; i++) {
    incomingEdges[mNodeList[i].id] = 0
  }

  // Conta arestas de entrada para cada nó
  for (let i = 0; i < mLinkList.length; i++) {
    const edge = mLinkList[i]
    incomingEdges[edge.target] = (incomingEdges[edge.target] || 0) + 1
  }

  // Ordenação topológica simplificada para determinar níveis
  const nodeLevels = {}

  // Primeiro, identifica todos os nós iniciais (sem arestas de entrada)
  const initialNodes = []
  for (let i = 0; i < mNodeList.length; i++) {
    const nodeId = mNodeList[i].id
    if (incomingEdges[nodeId] === 0) {
      nodeLevels[nodeId] = 0
      initialNodes.push(nodeId)
    }
  }

  // Se não houver nós iniciais, escolhe o primeiro nó como inicial
  if (initialNodes.length === 0 && mNodeList.length > 0) {
    const firstNodeId = mNodeList[0].id
    nodeLevels[firstNodeId] = 0
    initialNodes.push(firstNodeId)
  }

  // Mapeamento de conexões de saída
  const outConnections = {}
  for (let i = 0; i < mNodeList.length; i++) {
    outConnections[mNodeList[i].id] = []
  }

  for (let i = 0; i < mLinkList.length; i++) {
    const edge = mLinkList[i]
    outConnections[edge.source].push(edge.target)
  }

  // Propaga níveis através das conexões
  let hasChanges = true
  const tempIncomingEdges = { ...incomingEdges }

  while (hasChanges) {
    hasChanges = false

    // Para cada nó já nivelado
    for (const nodeId in nodeLevels) {
      const level = nodeLevels[nodeId]

      // Para cada conexão de saída
      for (const targetId of outConnections[nodeId]) {
        // Decrementa a contagem de arestas não processadas
        tempIncomingEdges[targetId]--

        // Se todas as arestas de entrada foram processadas, atribui nível
        if (tempIncomingEdges[targetId] === 0) {
          if (nodeLevels[targetId] === undefined || nodeLevels[targetId] < level + 1) {
            nodeLevels[targetId] = level + 1
            hasChanges = true
          }
        }
      }
    }
  }

  // Para nós não nivelados (devido a ciclos), atribui níveis manualmente
  for (let i = 0; i < mNodeList.length; i++) {
    const nodeId = mNodeList[i].id
    if (nodeLevels[nodeId] === undefined) {
      // Procura um nível baseado em suas conexões
      let maxSourceLevel = -1

      // Verifica se alguma de suas fontes tem nível
      for (let j = 0; j < mLinkList.length; j++) {
        const edge = mLinkList[j]
        if (edge.target === nodeId && nodeLevels[edge.source] !== undefined) {
          maxSourceLevel = Math.max(maxSourceLevel, nodeLevels[edge.source])
        }
      }

      if (maxSourceLevel >= 0) {
        nodeLevels[nodeId] = maxSourceLevel + 1
      } else {
        // Se não tem fontes niveladas, coloca no nível máximo + 1
        let maxLevel = 0
        for (const id in nodeLevels) {
          maxLevel = Math.max(maxLevel, nodeLevels[id])
        }
        nodeLevels[nodeId] = maxLevel + 1
      }
    }
  }

  // Agrupa nós por nível
  const nodesByLevel = {}
  let maxLevel = 0

  for (let i = 0; i < mNodeList.length; i++) {
    const nodeId = mNodeList[i].id
    const level = nodeLevels[nodeId]
    maxLevel = Math.max(maxLevel, level)

    if (!nodesByLevel[level]) {
      nodesByLevel[level] = []
    }
    nodesByLevel[level].push(nodeId)
  }

  // Dimensões - aumentadas para criar mais espaço
  const levelHeight = 500 // Distância vertical entre níveis - MUITO AUMENTADO
  const horizontalSpacing = 600 // Espaçamento horizontal entre nós - MUITO AUMENTADO

  // NOVA ABORDAGEM: Construir uma hierarquia de nós para preservar relações pai-filho
  const nodeParents = {}
  const nodeChildren = {}

  // Inicializa listas de filhos
  for (let i = 0; i < mNodeList.length; i++) {
    nodeChildren[mNodeList[i].id] = []
  }

  // Constrói mapa de pai-filho baseado nas conexões
  for (let i = 0; i < mLinkList.length; i++) {
    const edge = mLinkList[i]
    const sourceLevel = nodeLevels[edge.source]
    const targetLevel = nodeLevels[edge.target]

    // Se o nó de destino está exatamente um nível abaixo do nó de origem
    if (targetLevel === sourceLevel + 1) {
      nodeParents[edge.target] = edge.source
      nodeChildren[edge.source].push(edge.target)
    }
  }

  // Primeira passagem: posicionar os nós do primeiro nível uniformemente
  const level0Nodes = nodesByLevel[0] || []
  const totalWidth0 = level0Nodes.length * horizontalSpacing
  const startX0 = Math.max(150, (CANVAS_WIDTH - totalWidth0) / 2)

  // Mapa para armazenar as posições X de cada nó
  const nodePositionsX = {}

  // Posiciona os nós do nível 0
  for (let i = 0; i < level0Nodes.length; i++) {
    const nodeId = level0Nodes[i]
    nodePositionsX[nodeId] = startX0 + i * horizontalSpacing

    // Encontra o nó e atualiza posição
    for (let j = 0; j < mNodeList.length; j++) {
      if (mNodeList[j].id === nodeId) {
        mNodeList[j].x = nodePositionsX[nodeId]
        mNodeList[j].y = 120
        break
      }
    }
  }

  // Segunda passagem: posicionar os nós de cada nível subsequente sob seus pais
  for (let level = 1; level <= maxLevel; level++) {
    const nodesInLevel = nodesByLevel[level] || []

    // Sem nós neste nível, pula
    if (nodesInLevel.length === 0) continue

    // Primeiro, agrupa os nós por seu pai
    const nodesByParent = {}
    const nodesWithoutParent = []

    for (const nodeId of nodesInLevel) {
      const parentId = nodeParents[nodeId]

      if (parentId && nodePositionsX[parentId] !== undefined) {
        if (!nodesByParent[parentId]) {
          nodesByParent[parentId] = []
        }
        nodesByParent[parentId].push(nodeId)
      } else {
        nodesWithoutParent.push(nodeId)
      }
    }

    // Para cada grupo de nós com o mesmo pai
    for (const parentId in nodesByParent) {
      const childrenIds = nodesByParent[parentId]
      const parentX = nodePositionsX[parentId]

      // Se há apenas um filho, alinha-o diretamente sob o pai
      if (childrenIds.length === 1) {
        const childId = childrenIds[0]
        nodePositionsX[childId] = parentX

        // Encontra o nó e atualiza sua posição
        for (let j = 0; j < mNodeList.length; j++) {
          if (mNodeList[j].id === childId) {
            mNodeList[j].x = parentX
            mNodeList[j].y = 120 + level * levelHeight
            break
          }
        }
      } else if (childrenIds.length > 1) {
        const totalChildWidth = (childrenIds.length - 1) * horizontalSpacing
        const startChildX = parentX - totalChildWidth / 2

        for (let i = 0; i < childrenIds.length; i++) {
          const childId = childrenIds[i]
          const childX = startChildX + i * horizontalSpacing
          nodePositionsX[childId] = childX

          // Encontra o nó e atualiza sua posição
          for (let j = 0; j < mNodeList.length; j++) {
            if (mNodeList[j].id === childId) {
              mNodeList[j].x = childX
              mNodeList[j].y = 120 + level * levelHeight
              break
            }
          }
        }
      }
    }

    // Posiciona os nós sem pais conhecidos
    if (nodesWithoutParent.length > 0) {
      // Encontra o espaço livre à direita
      let maxX = -Infinity
      for (const nodeId in nodePositionsX) {
        if (nodeLevels[nodeId] === level) {
          maxX = Math.max(maxX, nodePositionsX[nodeId])
        }
      }

      // Se não houver nós posicionados, começa do princípio
      if (maxX === -Infinity) {
        maxX = Math.max(150, (CANVAS_WIDTH - (nodesWithoutParent.length * horizontalSpacing)) / 2) - horizontalSpacing
      }

      // Posiciona cada nó sem pai à direita dos outros
      for (let i = 0; i < nodesWithoutParent.length; i++) {
        const nodeId = nodesWithoutParent[i]
        maxX += horizontalSpacing
        nodePositionsX[nodeId] = maxX

        // Encontra o nó e atualiza sua posição
        for (let j = 0; j < mNodeList.length; j++) {
          if (mNodeList[j].id === nodeId) {
            mNodeList[j].x = maxX
            mNodeList[j].y = 120 + level * levelHeight
            break
          }
        }
      }
    }
  }

  // Última verificação: garantir que todos os nós tenham posições válidas
  for (let i = 0; i < mNodeList.length; i++) {
    const node = mNodeList[i]
    const level = nodeLevels[node.id]

    // Se por algum motivo o nó não foi posicionado, atribui uma posição
    if (node.x === undefined || node.y === undefined) {
      node.y = 120 + level * levelHeight

      // Encontra uma posição X não utilizada
      let newX = CANVAS_WIDTH / 2
      let found = false

      while (!found) {
        found = true
        for (let j = 0; j < mNodeList.length; j++) {
          if (i !== j && mNodeList[j].x === newX && mNodeList[j].y === node.y) {
            found = false
            newX += horizontalSpacing
            break
          }
        }
      }

      node.x = newX
    }
  }

  // Força uma separação adicional para garantir que não haja sobreposições
  resolveHorizontalOverlaps()
}

/**
 * Resolve sobreposições horizontais específicas para o layout em níveis
 */
function resolveHorizontalOverlaps () {
  const minDistance = NODE_WIDTH * 2.0 // Aumentado significativamente
  let hasChanges = true
  const iterations = 8 // Mais iterações para garantir separação adequada

  // Itera mais vezes para resolver sobreposições
  for (let iter = 0; iter < iterations && hasChanges; iter++) {
    hasChanges = false

    // Para cada par de nós
    for (let i = 0; i < mNodeList.length; i++) {
      for (let j = i + 1; j < mNodeList.length; j++) {
        // Se estão aproximadamente na mesma linha horizontal
        // Usando uma distância vertical maior para detecção
        if (Math.abs(mNodeList[i].y - mNodeList[j].y) < NODE_HEIGHT) {
          // Verifica distância horizontal
          const dx = Math.abs(mNodeList[i].x - mNodeList[j].x)

          if (dx < minDistance) {
            hasChanges = true
            // Calcula ajuste necessário - aumentado para mais separação
            const adjustment = (minDistance - dx) / 1.5 + 15

            // Afasta os nós horizontalmente com mais força
            if (mNodeList[i].x < mNodeList[j].x) {
              mNodeList[i].x -= adjustment
              mNodeList[j].x += adjustment
            } else {
              mNodeList[i].x += adjustment
              mNodeList[j].x -= adjustment
            }
          }
        }
      }
    }
  }
}

/**
 * Layout circular - organiza os nós em círculos concêntricos, colocando nós conectados próximos
 */
function circleLayout () {
  const nodeCount = mNodeList.length
  if (nodeCount === 0) return

  const centerX = CANVAS_WIDTH / 2
  const centerY = CANVAS_HEIGHT / 2

  // Passo 1: Analisar a estrutura de conexões
  const connectionCounts = {}
  const connectedNodes = {}
  const outgoingConnections = {}
  const incomingConnections = {}

  // Inicialização
  for (let i = 0; i < mNodeList.length; i++) {
    const nodeId = mNodeList[i].id
    connectionCounts[nodeId] = 0
    connectedNodes[nodeId] = []
    outgoingConnections[nodeId] = []
    incomingConnections[nodeId] = []
  }

  // Montar mapa de conexões
  for (let i = 0; i < mLinkList.length; i++) {
    const edge = mLinkList[i]
    connectionCounts[edge.source]++
    connectionCounts[edge.target]++
    connectedNodes[edge.source].push(edge.target)
    connectedNodes[edge.target].push(edge.source)
    outgoingConnections[edge.source].push(edge.target)
    incomingConnections[edge.target].push(edge.source)
  }

  // Passo 2: Identificar nós "Bem Vindo" e "Início"
  let bemVindoNodeId = null
  let inicioNodeId = null

  for (let i = 0; i < mNodeList.length; i++) {
    // Remove a pontuação e converte para minúsculas para comparação mais flexível
    const nodeLabelClean = ((mNodeList[i].label || '').toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '')).trim()
    const nodeId = mNodeList[i].id

    // Identifica "Bem Vindo" ou "Boas vindas" pelo texto ou ID
    if (nodeLabelClean.includes('bem vindo') ||
        nodeLabelClean.includes('boas vindas') ||
        nodeId === 'nodeC' ||
        nodeId === '2') {
      bemVindoNodeId = mNodeList[i].id
    }

    // Identifica "Início" ou "Inicio" pelo texto ou ID
    if (nodeLabelClean.includes('início') ||
        nodeLabelClean.includes('inicio') ||
        nodeId === 'start' ||
        nodeId === '1') {
      inicioNodeId = mNodeList[i].id
    }
  }

  // Passo 3: Posicionar "Bem Vindo" e "Início" lado a lado à esquerda
  const leftMargin = 50 // Exatamente 50px da borda lateral (antes era 40px)
  const initialY = CANVAS_HEIGHT * 0.4 // 40% da altura
  const nodeSpacing = NODE_WIDTH * 1.5 // Espaçamento entre "Bem Vindo" e "Início"

  // Debug - verificar IDs identificados
  console.log('Nós especiais identificados:', { bemVindoNodeId, inicioNodeId })
  console.log('Lista de nós total:', mNodeList.map(n => ({ id: n.id, label: n.label })))

  // Verifica se o nó "Início" existe na lista
  const inicioExists = mNodeList.some(node =>
    node.id === 'start' ||
    node.id === '1' ||
    (node.label && (node.label.toLowerCase().includes('início') || node.label.toLowerCase().includes('inicio')))
  )

  // Verifica se o nó "Boas vindas" existe na lista
  const boasVindasExists = mNodeList.some(node =>
    node.id === 'nodeC' ||
    node.id === '2' ||
    (node.label && (node.label.toLowerCase().includes('boas vindas') || node.label.toLowerCase().includes('bem vindo')))
  )

  console.log('Existência dos nós:', { inicioExists, boasVindasExists })

  // Posicionando nó "Início" primeiro - MODIFICADO: agora fica ANTES do Boas vindas
  if (inicioNodeId && inicioExists) {
    for (let i = 0; i < mNodeList.length; i++) {
      if (mNodeList[i].id === inicioNodeId) {
        // Início fica à esquerda agora (primeira posição)
        mNodeList[i].x = 50 // Posição EXATA de 50px da esquerda
        mNodeList[i].y = initialY

        // Garante que o estilo existe
        if (!mNodeList[i].style) mNodeList[i].style = {}

        // Aplica estilo destacado
        mNodeList[i].style.backgroundColor = '#90CAF9'
        mNodeList[i].style.zIndex = '10'

        console.log('Posicionando nó Início com x=50px EXATO:', mNodeList[i].id, mNodeList[i].label, { x: mNodeList[i].x, y: mNodeList[i].y })
        break
      }
    }
  } else {
    console.log('Nó Início não foi posicionado porque não existe no fluxo atual')
  }

  // Posicionando nó "Bem Vindo"/"Boas vindas" - MODIFICADO: agora fica após o Início
  if (bemVindoNodeId) {
    for (let i = 0; i < mNodeList.length; i++) {
      if (mNodeList[i].id === bemVindoNodeId) {
        // Boas vindas fica à direita do Início
        mNodeList[i].x = inicioNodeId ? leftMargin + nodeSpacing : leftMargin
        mNodeList[i].y = initialY

        // Garante que o estilo existe
        if (!mNodeList[i].style) mNodeList[i].style = {}

        // Aplica estilo destacado
        mNodeList[i].style.backgroundColor = '#90CAF9'
        mNodeList[i].style.zIndex = '10'

        console.log('Posicionando nó Boas vindas:', mNodeList[i].id, mNodeList[i].label, { x: mNodeList[i].x, y: mNodeList[i].y })
        break
      }
    }
  }

  // NOVO: Posicionando o nó "configurations" abaixo do "Início"
  for (let i = 0; i < mNodeList.length; i++) {
    const node = mNodeList[i]
    if (node.id === 'configurations') {
      // Procura a posição do nó Início para referenciar
      let inicioX = leftMargin + nodeSpacing // Posição padrão
      let inicioY = initialY

      // Encontra as coordenadas exatas do nó Início
      for (let j = 0; j < mNodeList.length; j++) {
        if (mNodeList[j].id === inicioNodeId) {
          inicioX = mNodeList[j].x
          inicioY = mNodeList[j].y
          break
        }
      }

      // Posiciona configurations exatamente 100px abaixo do Início
      node.x = inicioX
      node.y = inicioY + 100 // Exatamente 100px abaixo do Início

      console.log('Posicionando nó Configurations 100px abaixo do Início:', node.id, { x: node.x, y: node.y })
      break
    }
  }

  // Força aplicação de posição para IDs específicos (garantia adicional)
  for (let i = 0; i < mNodeList.length; i++) {
    const node = mNodeList[i]

    // Verificação direta por ID conhecido para Início, apenas se existir
    if ((node.id === 'start' || node.id === '1') && inicioExists) {
      // Início agora é o primeiro elemento com posição FIXA em 50px
      node.x = 50 // Posição EXATA de 50px da esquerda
      node.y = initialY
      if (!node.style) node.style = {}
      node.style.backgroundColor = '#90CAF9'
      node.style.zIndex = '10'
      console.log('Forçando posição para Início (ID) com x=50px EXATO:', node.id, node.label)
    }

    // Verificação direta por ID conhecido para Boas vindas
    if (node.id === 'nodeC' || node.id === '2') {
      const inicioNode = mNodeList.find(n =>
        n.id === 'start' || n.id === '1' ||
        ((n.label || '').toLowerCase().includes('início') ||
         (n.label || '').toLowerCase().includes('inicio'))
      )

      // Posiciona "Boas vindas" ao lado de "Início" se ele existir
      node.x = inicioNode ? leftMargin + nodeSpacing : leftMargin
      node.y = initialY
      if (!node.style) node.style = {}
      node.style.backgroundColor = '#90CAF9'
      node.style.zIndex = '10'
      console.log('Forçando posição para Boas vindas (ID):', node.id, node.label)
    }
  }

  // Passo 4: Definir níveis hierárquicos a partir de um nó central (excluindo "Bem Vindo" e "Início")
  const nodeLevels = {}
  const nodeParents = {}
  const visited = {}

  // Escolher o nó "Boas vindas" como ponto de partida para o fluxo
  let centralNodeId = bemVindoNodeId || inicioNodeId

  // Se nenhum dos nós especiais foi encontrado, usa o nó com mais conexões de saída
  if (!centralNodeId) {
    let maxOutgoing = -1
    for (const nodeId in outgoingConnections) {
      if (outgoingConnections[nodeId].length > maxOutgoing) {
        maxOutgoing = outgoingConnections[nodeId].length
        centralNodeId = nodeId
      }
    }
  }

  // BFS para atribuir níveis a partir do nó central
  const queue = [centralNodeId]
  nodeLevels[centralNodeId] = 0
  visited[centralNodeId] = true

  while (queue.length > 0) {
    const currentId = queue.shift()
    const currentLevel = nodeLevels[currentId]

    // Priorizar conexões de saída para criar um fluxo da esquerda para a direita
    const neighbors = outgoingConnections[currentId]

    for (const neighborId of neighbors) {
      if (!visited[neighborId]) {
        visited[neighborId] = true
        nodeLevels[neighborId] = currentLevel + 1
        nodeParents[neighborId] = currentId
        queue.push(neighborId)
      }
    }
  }

  // Atribuir nível aos nós não visitados
  for (let i = 0; i < mNodeList.length; i++) {
    const nodeId = mNodeList[i].id
    if (!nodeLevels[nodeId]) {
      // Se não foi visitado pelo BFS, atribui um nível baseado nas conexões de entrada
      if (incomingConnections[nodeId] && incomingConnections[nodeId].length > 0) {
        let parentLevel = -1
        for (const potentialParent of incomingConnections[nodeId]) {
          if (nodeLevels[potentialParent] !== undefined &&
             (parentLevel === -1 || nodeLevels[potentialParent] > parentLevel)) {
            parentLevel = nodeLevels[potentialParent]
            nodeParents[nodeId] = potentialParent
          }
        }

        if (parentLevel !== -1) {
          nodeLevels[nodeId] = parentLevel + 1
        } else {
          nodeLevels[nodeId] = 1 // Nível padrão
        }
      } else {
        nodeLevels[nodeId] = 1 // Nível padrão para nós sem conexões
      }
    }
  }

  // Passo 5: Organizar nós por níveis
  const nodesByLevel = {}
  let maxLevel = 0

  for (const nodeId in nodeLevels) {
    const level = nodeLevels[nodeId]
    maxLevel = Math.max(maxLevel, level)
    if (!nodesByLevel[level]) nodesByLevel[level] = []
    nodesByLevel[level].push(nodeId)
  }

  // Passo 6: Calcular raios para cada nível - aumentados para melhor visualização
  const baseRadius = Math.min(CANVAS_WIDTH, CANVAS_HEIGHT) * 0.22 // Aumentado
  const radiusIncrement = Math.min(CANVAS_WIDTH, CANVAS_HEIGHT) * 0.18 // Aumentado

  // Passo 7: Posicionar os nós em leque da esquerda para a direita
  for (let level = 1; level <= maxLevel; level++) {
    const nodesInLevel = nodesByLevel[level].filter(
      id => id !== bemVindoNodeId && id !== inicioNodeId // Exclui "Bem Vindo" e "Início"
    )

    if (nodesInLevel.length === 0) continue

    // Aumentando o raio a cada nível para criar uma distribuição mais espaçada
    const radius = baseRadius + (level - 1) * radiusIncrement

    // Ajusta o ângulo para distribuir os nós em um leque de -60° a 60° (em radianos)
    const minAngle = -Math.PI / 3 // -60°
    const maxAngle = Math.PI / 3 // 60°
    const angleStep = (maxAngle - minAngle) / Math.max(nodesInLevel.length - 1, 1)

    // Organiza os nós por suas conexões com o nível anterior
    nodesInLevel.sort((a, b) => {
      const parentA = nodeParents[a]
      const parentB = nodeParents[b]

      // Se ambos têm o mesmo pai, mantém a ordem
      if (parentA === parentB) return 0

      // Se apenas um tem pai, prioriza o que tem pai
      if (parentA && !parentB) return -1
      if (!parentA && parentB) return 1

      // Se ambos têm pais diferentes, compara os índices dos pais
      if (parentA && parentB) {
        const indexA = nodesByLevel[level - 1]?.indexOf(parentA) || 0
        const indexB = nodesByLevel[level - 1]?.indexOf(parentB) || 0
        return indexA - indexB
      }

      return 0
    })

    // Posiciona cada nó no nível
    for (let i = 0; i < nodesInLevel.length; i++) {
      const nodeId = nodesInLevel[i]
      let angle

      if (nodesInLevel.length === 1) {
        // Se houver apenas um nó no nível, coloca-o no centro do arco
        angle = 0
      } else {
        // Distribui os nós uniformemente ao longo do arco
        angle = minAngle + i * angleStep
      }

      // Calcula a posição baseada no ângulo e raio
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)

      // Aplica a posição ao nó
      for (let j = 0; j < mNodeList.length; j++) {
        if (mNodeList[j].id === nodeId) {
          mNodeList[j].x = x
          mNodeList[j].y = y
          break
        }
      }
    }
  }

  // Passo 8: Resolver sobreposições
  resolveCircularOverlaps(nodesByLevel, nodeLevels, centerX, centerY)

  // Passo 9: Ajustes finais
  finalizeCircularLayout(centerX, centerY, nodeLevels)
}

/**
 * Finaliza o layout circular com ajustes finos para melhor visualização
 */
function finalizeCircularLayout (centerX, centerY, nodeLevels) {
  // Para cada nó, verifique se está bem posicionado
  for (let i = 0; i < mNodeList.length; i++) {
    const node = mNodeList[i]

    // Verifica se o nó está dentro dos limites do canvas
    const margin = 50
    if (node.x < margin) node.x = margin
    if (node.x > CANVAS_WIDTH - margin) node.x = CANVAS_WIDTH - margin
    if (node.y < margin) node.y = margin
    if (node.y > CANVAS_HEIGHT - margin) node.y = CANVAS_HEIGHT - margin

    // Para nós mais distantes do centro, verifica se tem espaço suficiente
    if (nodeLevels[node.id] > 2) {
      let hasTooCloseNeighbors = false

      // Verifica se o nó está muito próximo de outros nós
      for (let j = 0; j < mNodeList.length; j++) {
        if (i === j) continue

        const otherNode = mNodeList[j]
        const dx = node.x - otherNode.x
        const dy = node.y - otherNode.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < NODE_WIDTH * 1.2) {
          hasTooCloseNeighbors = true
          break
        }
      }

      // Se estiver muito próximo de outros nós, ajusta sua posição
      if (hasTooCloseNeighbors) {
        // Calcula o ângulo atual em relação ao centro
        const angle = Math.atan2(node.y - centerY, node.x - centerX)

        // Calcula o raio atual
        const radius = Math.sqrt(
          Math.pow(node.x - centerX, 2) +
          Math.pow(node.y - centerY, 2)
        )

        // Aumenta um pouco o raio para afastar o nó dos outros
        const newRadius = radius * 1.05

        // Aplica a nova posição
        node.x = centerX + newRadius * Math.cos(angle)
        node.y = centerY + newRadius * Math.sin(angle)
      }
    }
  }
}

/**
 * Layout em grade - organiza os nós em uma grade uniforme
 */
function gridLayout () {
  const nodeCount = mNodeList.length
  if (nodeCount === 0) return

  // Calcula o número de colunas e linhas para distribuição uniforme
  const cols = Math.ceil(Math.sqrt(nodeCount))
  const rows = Math.ceil(nodeCount / cols)

  const marginX = 150 // Aumentado para garantir visibilidade nas bordas
  const marginY = 150
  const cellWidth = (CANVAS_WIDTH - 2 * marginX) / Math.max(1, cols - 1) * 1.1 // 10% mais espaço
  const cellHeight = (CANVAS_HEIGHT - 2 * marginY) / Math.max(1, rows - 1) * 1.1

  for (let i = 0; i < nodeCount; i++) {
    const row = Math.floor(i / cols)
    const col = i % cols

    mNodeList[i].x = marginX + col * cellWidth
    mNodeList[i].y = marginY + row * cellHeight
  }
}

/**
 * Layout Hub Radial - combina o conceito de hub central com distribuição radial para fluxos complexos
 */
function hubRadialLayout () {
  // Análise de conectividade e centralidade dos nós
  const connections = {}
  const outgoing = {}
  const incoming = {}

  // Inicializa contadores
  for (let i = 0; i < mNodeList.length; i++) {
    const nodeId = mNodeList[i].id
    connections[nodeId] = 0
    outgoing[nodeId] = 0
    incoming[nodeId] = 0
  }

  // Conta conexões
  for (let i = 0; i < mLinkList.length; i++) {
    const edge = mLinkList[i]
    connections[edge.source]++
    connections[edge.target]++
    outgoing[edge.source]++
    incoming[edge.target]++
  }

  // Encontra o nó central (com mais conexões ou primeiro nó sem entrada)
  let centralNodeId = null
  let maxConnections = -1

  // Primeiro tenta encontrar o nó com mais conexões
  for (const nodeId in connections) {
    if (connections[nodeId] > maxConnections) {
      maxConnections = connections[nodeId]
      centralNodeId = nodeId
    }
  }

  // Se não conseguiu, procura por nós sem entrada (possíveis pontos de início)
  if (!centralNodeId && mNodeList.length > 0) {
    for (const nodeId in incoming) {
      if (incoming[nodeId] === 0) {
        centralNodeId = nodeId
        break
      }
    }
  }

  // Se ainda não conseguiu, usa o primeiro nó
  if (!centralNodeId && mNodeList.length > 0) {
    centralNodeId = mNodeList[0].id
  }

  // Mapeamento de níveis a partir do nó central usando BFS
  const levels = {}
  const visited = {}
  const children = {}
  const sectors = {}

  // Inicializa estruturas
  for (let i = 0; i < mNodeList.length; i++) {
    const nodeId = mNodeList[i].id
    children[nodeId] = []
    visited[nodeId] = false
  }

  // Prepara a estrutura de filhos (para ambas as direções)
  for (let i = 0; i < mLinkList.length; i++) {
    const edge = mLinkList[i]
    children[edge.source].push(edge.target)
  }

  // BFS para atribuir níveis
  const queue = [centralNodeId]
  levels[centralNodeId] = 0
  visited[centralNodeId] = true

  while (queue.length > 0) {
    const nodeId = queue.shift()
    const level = levels[nodeId]

    for (let i = 0; i < children[nodeId].length; i++) {
      const childId = children[nodeId][i]
      if (!visited[childId]) {
        visited[childId] = true
        levels[childId] = level + 1
        queue.push(childId)
      }
    }
  }

  // Atribui nós não visitados a níveis maiores
  let maxLevel = 0
  for (const nodeId in levels) {
    maxLevel = Math.max(maxLevel, levels[nodeId])
  }

  for (let i = 0; i < mNodeList.length; i++) {
    const nodeId = mNodeList[i].id
    if (!visited[nodeId]) {
      levels[nodeId] = maxLevel + 1
    }
  }

  // Agrupa nós por nível
  const nodesByLevel = {}
  for (let i = 0; i <= maxLevel + 1; i++) {
    nodesByLevel[i] = []
  }

  for (let i = 0; i < mNodeList.length; i++) {
    const nodeId = mNodeList[i].id
    const level = levels[nodeId]
    nodesByLevel[level].push(nodeId)
  }

  // Distribui os nós em anéis concêntricos
  const centerX = CANVAS_WIDTH / 2
  const centerY = CANVAS_HEIGHT / 2
  const baseRadius = 220 // Raio inicial aumentado
  const radiusIncrement = 200 // Incremento de raio por nível ajustado

  // Posiciona o nó central
  for (let i = 0; i < mNodeList.length; i++) {
    if (mNodeList[i].id === centralNodeId) {
      mNodeList[i].x = centerX
      mNodeList[i].y = centerY

      // Destaca o nó central com estilo diferenciado (se supportado)
      if (mNodeList[i].style === undefined) {
        mNodeList[i].style = {}
      }

      // As propriedades style são aplicadas via CSS no componente node.vue
      mNodeList[i].style.backgroundColor = '#90CAF9'
      mNodeList[i].style.zIndex = '10'
      mNodeList[i].style.transform = 'scale(1.05)'
      break
    }
  }

  // Distribui grupos de nós em setores principais
  // Estratégia adaptativa para o layout:
  // 1. Para poucos nós no nível 1, usa distribuição circular completa
  // 2. Para muitos nós no nível 1, agrupa em setores lógicos

  const firstLevelNodes = nodesByLevel[1] || []

  if (firstLevelNodes.length <= 8) {
    // Distribuição em círculo completo para poucos nós
    const sectorAngle = (2 * Math.PI) / Math.max(firstLevelNodes.length, 1)

    for (let i = 0; i < firstLevelNodes.length; i++) {
      const nodeId = firstLevelNodes[i]
      const angle = i * sectorAngle
      const radius = baseRadius

      // Posição do hub secundário
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)

      // Atualiza a posição do nó
      for (let j = 0; j < mNodeList.length; j++) {
        if (mNodeList[j].id === nodeId) {
          mNodeList[j].x = x
          mNodeList[j].y = y

          // Armazena o ângulo do setor deste hub
          sectors[nodeId] = angle
          break
        }
      }
    }
  } else {
    // Distribuição em setores para muitos nós
    // Usa apenas a parte superior para melhor visualização (180 graus)
    const sectorAngle = Math.PI / Math.max(firstLevelNodes.length - 1, 1)

    for (let i = 0; i < firstLevelNodes.length; i++) {
      const nodeId = firstLevelNodes[i]
      // Distribui os nós em um semicírculo na parte superior (de -90° a 90°)
      const angle = (i * sectorAngle) - (Math.PI / 2)
      // Usa o mesmo raio base definido anteriormente

      // Posição do hub secundário
      const x = centerX + baseRadius * Math.cos(angle)
      const y = centerY + baseRadius * Math.sin(angle)

      // Atualiza a posição do nó
      for (let j = 0; j < mNodeList.length; j++) {
        if (mNodeList[j].id === nodeId) {
          mNodeList[j].x = x
          mNodeList[j].y = y

          // Armazena o ângulo do setor deste hub
          sectors[nodeId] = angle
          break
        }
      }
    }
  }

  // Distribui os nós dos níveis seguintes
  for (let level = 2; level <= maxLevel + 1; level++) {
    const currentLevelNodes = nodesByLevel[level] || []

    // Agrupa nós por seu "hub pai" (nó mais próximo no nível anterior)
    const nodesByParent = {}

    for (let i = 0; i < currentLevelNodes.length; i++) {
      const nodeId = currentLevelNodes[i]
      let parentId = null
      let minDistance = Infinity

      // Encontra o pai mais próximo no nível anterior
      const previousLevelNodes = nodesByLevel[level - 1] || []

      // Verifica conexões diretas primeiro
      let directParent = false
      for (let j = 0; j < mLinkList.length; j++) {
        const edge = mLinkList[j]
        if (edge.target === nodeId && levels[edge.source] === level - 1) {
          parentId = edge.source
          directParent = true
          break
        }
      }

      // Se não houver conexão direta, usa o hub mais próximo
      if (!directParent) {
        for (let j = 0; j < previousLevelNodes.length; j++) {
          const possibleParentId = previousLevelNodes[j]

          // Calcula "distância" com base em conectividade
          // Nós que compartilham conexões são considerados mais próximos
          let connectionDistance = 1000

          for (let k = 0; k < mLinkList.length; k++) {
            const edge = mLinkList[k]
            if ((edge.source === nodeId && edge.target === possibleParentId) ||
                (edge.target === nodeId && edge.source === possibleParentId)) {
              connectionDistance = 0 // Nós diretamente conectados
              break
            }
          }

          if (connectionDistance < minDistance) {
            minDistance = connectionDistance
            parentId = possibleParentId
          }
        }
      }

      // Se ainda não encontrou um pai, usa o primeiro hub do nível anterior
      if (!parentId && previousLevelNodes.length > 0) {
        parentId = previousLevelNodes[0]
      }

      // Agrupa por pai
      if (parentId) {
        if (!nodesByParent[parentId]) {
          nodesByParent[parentId] = []
        }
        nodesByParent[parentId].push(nodeId)
      }
    }

    // Distribui os nós agrupados por pai
    for (const parentId in nodesByParent) {
      const parentAngle = sectors[parentId] || 0
      const childNodes = nodesByParent[parentId]

      // Encontra a posição do pai
      let parentX = centerX
      let parentY = centerY

      for (let i = 0; i < mNodeList.length; i++) {
        if (mNodeList[i].id === parentId) {
          parentX = mNodeList[i].x
          parentY = mNodeList[i].y
          break
        }
      }

      // Calcula o raio relativo ao nó pai - ajustado para nós com muitos filhos
      const relativeRadius = Math.max(180, 120 + childNodes.length * 15)

      // Ajusta a distribuição angular baseada no número de filhos
      let angleSpread
      if (childNodes.length <= 3) {
        angleSpread = Math.PI / 6 // 30° para poucos filhos
      } else if (childNodes.length <= 6) {
        angleSpread = Math.PI / 4 // 45° para mais filhos
      } else {
        angleSpread = Math.PI / 3 // 60° para muitos filhos
      }

      const startAngle = parentAngle - angleSpread / 2
      const angleStep = childNodes.length > 1 ? angleSpread / (childNodes.length - 1) : 0

      for (let i = 0; i < childNodes.length; i++) {
        const nodeId = childNodes[i]
        let angle = startAngle + i * angleStep

        // Se tiver apenas um filho, coloca na mesma direção do pai
        if (childNodes.length === 1) {
          angle = parentAngle
        }

        const x = parentX + relativeRadius * Math.cos(angle)
        const y = parentY + relativeRadius * Math.sin(angle)

        // Atualiza a posição do nó
        for (let j = 0; j < mNodeList.length; j++) {
          if (mNodeList[j].id === nodeId) {
            mNodeList[j].x = x
            mNodeList[j].y = y
            sectors[nodeId] = angle
            break
          }
        }
      }
    }
  }

  // Aplica ajustes finais para evitar sobreposições
  // Primeiro verifica se há muitos nós e ajusta o layout conforme necessário
  if (mNodeList.length > 15) {
    // Para muitos nós, aumenta o espaçamento entre níveis
    for (let i = 0; i < mNodeList.length; i++) {
      const node = mNodeList[i]
      const level = levels[node.id] || 0

      if (level > 0) {
        // Calcula o ângulo em relação ao centro
        const angle = Math.atan2(node.y - centerY, node.x - centerX)
        // Ajusta o raio com base no nível e no número total de nós
        const newRadius = baseRadius + (level * radiusIncrement * (1 + (mNodeList.length / 50)))

        node.x = centerX + newRadius * Math.cos(angle)
        node.y = centerY + newRadius * Math.sin(angle)
      }
    }
  } else {
    // Para poucos nós, mantém o layout mais compacto
    for (let i = 0; i < mNodeList.length; i++) {
      const node = mNodeList[i]
      const level = levels[node.id] || 0

      if (level > 0) {
        // Calcula o ângulo em relação ao centro
        const angle = Math.atan2(node.y - centerY, node.x - centerX)
        const newRadius = baseRadius + level * radiusIncrement

        node.x = centerX + newRadius * Math.cos(angle)
        node.y = centerY + newRadius * Math.sin(angle)
      }
    }
  }

  // Resolve sobreposições entre nós do mesmo nível
  const iterations = 5
  for (let iter = 0; iter < iterations; iter++) {
    // Para cada nível
    for (let level = 1; level <= maxLevel + 1; level++) {
      const nodesInLevel = nodesByLevel[level] || []

      // Compara cada par de nós no mesmo nível
      for (let i = 0; i < nodesInLevel.length; i++) {
        const nodeAId = nodesInLevel[i]
        let nodeA = null

        // Encontra o objeto do nó A
        for (let k = 0; k < mNodeList.length; k++) {
          if (mNodeList[k].id === nodeAId) {
            nodeA = mNodeList[k]
            break
          }
        }

        if (!nodeA) continue

        for (let j = i + 1; j < nodesInLevel.length; j++) {
          const nodeBId = nodesInLevel[j]
          let nodeB = null

          // Encontra o objeto do nó B
          for (let k = 0; k < mNodeList.length; k++) {
            if (mNodeList[k].id === nodeBId) {
              nodeB = mNodeList[k]
              break
            }
          }

          if (!nodeB) continue

          // Calcula a distância entre os nós
          const dx = nodeB.x - nodeA.x
          const dy = nodeB.y - nodeA.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          // Se os nós estão muito próximos
          if (distance < NODE_WIDTH) {
            // Calcula ângulos para ambos os nós em relação ao centro
            const angleA = Math.atan2(nodeA.y - centerY, nodeA.x - centerX)
            const angleB = Math.atan2(nodeB.y - centerY, nodeB.x - centerX)

            // Ajusta ligeiramente os ângulos
            const newAngleA = angleA - 0.05
            const newAngleB = angleB + 0.05

            // Mantém o mesmo raio mas ajusta o ângulo
            const radius = Math.sqrt(
              Math.pow(nodeA.x - centerX, 2) +
              Math.pow(nodeA.y - centerY, 2)
            )

            // Aplica novos ângulos
            nodeA.x = centerX + radius * Math.cos(newAngleA)
            nodeA.y = centerY + radius * Math.sin(newAngleA)
            nodeB.x = centerX + radius * Math.cos(newAngleB)
            nodeB.y = centerY + radius * Math.sin(newAngleB)
          }
        }
      }
    }
  }
}

// eslint-disable-next-line no-unused-vars
function Node (id = null) {
  this.id = id
  this.x = 22
  this.y = null
}

function Edge (source = null, target = null) {
  this.source = source
  this.target = target
}

// eslint-disable-next-line no-unused-vars
function Result (nodes = null, links = null) {
  this.nodes = nodes
  this.links = links
}

/**
 * Aplica um layout final mais organizado aos nós
 */
function applyFinalLayout () {
  // Encontra os limites atuais
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (const node of mNodeList) {
    minX = Math.min(minX, node.x)
    minY = Math.min(minY, node.y)
    maxX = Math.max(maxX, node.x)
    maxY = Math.max(maxY, node.y)
  }

  // Calcula as dimensões e o centro
  const width = Math.max(maxX - minX, 500)
  const height = Math.max(maxY - minY, 500)
  const centerX = (minX + maxX) / 2
  const centerY = (minY + maxY) / 2

  // Fator de escala para aumentar a distribuição
  // Ajusta o fator de escala com base no tamanho da área
  const scaleFactor = Math.min(2.0, Math.max(1.5, 900 / Math.max(width, height)))

  // Ajusta as posições para ficarem dentro dos limites com margem de segurança
  for (const node of mNodeList) {
    // Preserva a posição exata do nó "Início"
    if (node.id === 'start' || node.id === '1') {
      // Garante que o nó "Início" permaneça na posição fixa
      node.x = 50 // Mantém a posição exata definida anteriormente
      continue // Pula para o próximo nó
    }

    // Centraliza primeiro
    const relX = node.x - centerX
    const relY = node.y - centerY

    // Aplica escala para espalhar mais
    node.x = centerX + relX * scaleFactor
    node.y = centerY + relY * scaleFactor

    // Garante posições mínimas para evitar posicionamento fora da área visível
    node.x = Math.max(node.x, NODE_WIDTH / 2 + 20)
    node.y = Math.max(node.y, NODE_HEIGHT / 2 + 20)
  }

  // Executa uma última checagem de sobreposições para garantir
  resolveAllOverlaps()

  // Após tudo, garante mais uma vez a posição do nó Início
  enforceStartNodePosition()
}

/**
 * Força a posição do nó "Início" para garantir que esteja em 50px da esquerda
 */
function enforceStartNodePosition () {
  for (let i = 0; i < mNodeList.length; i++) {
    const node = mNodeList[i]
    if (node.id === 'start' || node.id === '1') {
      node.x = 50 // Força posição exata a 50px da esquerda
      console.log('Posição final do nó Início forçada para x=50px')
      break
    }
  }
}

/**
 * Verifica e resolve todas as sobreposições possíveis
 */
function resolveAllOverlaps () {
  const minDistanceX = NODE_WIDTH * 3 // Aumentado DRASTICAMENTE
  const minDistanceY = NODE_HEIGHT * 3 // Aumentado DRASTICAMENTE

  let overlapsResolved = false
  let iterations = 0
  const maxIterations = 15 // Aumentado o número máximo de iterações

  // Continue resolvendo sobreposições até que não haja mais ou atinja o limite
  while (!overlapsResolved && iterations < maxIterations) {
    overlapsResolved = true
    iterations++

    for (let i = 0; i < mNodeList.length; i++) {
      const nodeA = mNodeList[i]

      // Preserva a posição do nó "Início"
      const isNodeAInicio = nodeA.id === 'start' || nodeA.id === '1'

      for (let j = i + 1; j < mNodeList.length; j++) {
        const nodeB = mNodeList[j]

        // Preserva a posição do nó "Início"
        const isNodeBInicio = nodeB.id === 'start' || nodeB.id === '1'

        // Calcula a distância entre os centros dos nós
        const dx = Math.abs(nodeB.x - nodeA.x)
        const dy = Math.abs(nodeB.y - nodeA.y)

        // Verifica se há sobreposição nos eixos X e Y
        const overlapX = dx < minDistanceX
        const overlapY = dy < minDistanceY

        // Se houver sobreposição em ambos os eixos
        if (overlapX && overlapY) {
          overlapsResolved = false

          // Decide em qual direção mover (na direção de menos sobreposição)
          if ((minDistanceX - dx) < (minDistanceY - dy)) {
            // Mais fácil corrigir no eixo X
            if (nodeA.x < nodeB.x) {
              // Somente move o nó A se não for o "Início"
              if (!isNodeAInicio) nodeA.x -= (minDistanceX - dx) / 1.5
              // Somente move o nó B se não for o "Início"
              if (!isNodeBInicio) nodeB.x += (minDistanceX - dx) / 1.5
            } else {
              // Somente move o nó A se não for o "Início"
              if (!isNodeAInicio) nodeA.x += (minDistanceX - dx) / 1.5
              // Somente move o nó B se não for o "Início"
              if (!isNodeBInicio) nodeB.x -= (minDistanceX - dx) / 1.5
            }
          } else {
            // Mais fácil corrigir no eixo Y
            if (nodeA.y < nodeB.y) {
              // Somente move o nó A se não for o "Início"
              if (!isNodeAInicio) nodeA.y -= (minDistanceY - dy) / 1.5
              // Somente move o nó B se não for o "Início"
              if (!isNodeBInicio) nodeB.y += (minDistanceY - dy) / 1.5
            } else {
              // Somente move o nó A se não for o "Início"
              if (!isNodeAInicio) nodeA.y += (minDistanceY - dy) / 1.5
              // Somente move o nó B se não for o "Início"
              if (!isNodeBInicio) nodeB.y -= (minDistanceY - dy) / 1.5
            }
          }
        }
      }
    }
  }

  // Depois de resolver sobreposições, garante novamente a posição do nó Início
  enforceStartNodePosition()
}

export default {
  forceLayout (nodes, edges) {
    // Inicializa as variáveis de estado
    mNodeList = nodes.map(node => ({
      ...node,
      vx: 0,
      vy: 0,
      fx: null,
      fy: null
    }))

    mLinkList = edges.map(edge => ({
      source: mNodeList.find(node => node.id === edge.source),
      target: mNodeList.find(node => node.id === edge.target),
      value: 1
    }))

    // Posicionamento inicial mais espalhado
    distributeNodesInCircle()

    // Cria e executa a simulação
    runSimulation()

    // Resolve sobreposições diretas
    resolveDirectOverlaps()

    // Aplica o layout final organizado
    applyFinalLayout()

    // Garante posições exatas para nós especiais após todas as outras operações
    enforceStartNodePosition()

    // Retorna os nós com as posições atualizadas
    return {
      nodes: mNodeList.map(({ id, x, y }) => ({ id, x, y })),
      edges: edges
    }
  }
}

function distributeNodesInCircle () {
  const centerX = CANVAS_WIDTH / 2
  const centerY = CANVAS_HEIGHT / 2
  const radius = Math.min(CANVAS_WIDTH, CANVAS_HEIGHT) * 0.35

  // Distribuir os nós em um círculo
  for (let i = 0; i < mNodeList.length; i++) {
    const angle = (i / mNodeList.length) * 2 * Math.PI
    mNodeList[i].x = centerX + radius * Math.cos(angle)
    mNodeList[i].y = centerY + radius * Math.sin(angle)
  }
}

function runSimulation () {
  // Simular forças para distribuir os nós
  for (let iteration = 0; iteration < 50; iteration++) {
    applyForcesIteration()
  }
}

/**
 * Aplica uma iteração das forças
 */
function applyForcesIteration () {
  // Aplicar forças repulsivas (todos os nós se repelem)
  for (let i = 0; i < mNodeList.length; i++) {
    for (let j = i + 1; j < mNodeList.length; j++) {
      applyRepulsiveForce(mNodeList[i], mNodeList[j])
    }
  }

  // Aplicar forças atrativas (nós conectados se atraem)
  for (let i = 0; i < mLinkList.length; i++) {
    applyAttractiveForce(mLinkList[i].source, mLinkList[i].target)
  }

  // Atualizar posições
  for (let i = 0; i < mNodeList.length; i++) {
    mNodeList[i].x += Math.min(Math.max(mNodeList[i].vx, -5), 5)
    mNodeList[i].y += Math.min(Math.max(mNodeList[i].vy, -5), 5)

    // Resetar velocidades para a próxima iteração
    mNodeList[i].vx = 0
    mNodeList[i].vy = 0
  }
}

/**
 * Aplica força repulsiva entre dois nós
 */
function applyRepulsiveForce (nodeA, nodeB) {
  const dx = nodeB.x - nodeA.x
  const dy = nodeB.y - nodeA.y
  const distance = Math.sqrt(dx * dx + dy * dy) || 1

  // Força inversamente proporcional à distância
  const force = k * k / distance

  // Componentes da força
  const fx = (dx / distance) * force
  const fy = (dy / distance) * force

  // Aplicar às velocidades (com sinais opostos para repulsão)
  nodeA.vx -= fx
  nodeA.vy -= fy
  nodeB.vx += fx
  nodeB.vy += fy
}

/**
 * Aplica força atrativa entre dois nós conectados
 */
function applyAttractiveForce (nodeA, nodeB) {
  const dx = nodeB.x - nodeA.x
  const dy = nodeB.y - nodeA.y
  const distance = Math.sqrt(dx * dx + dy * dy) || 1

  // Força proporcional à distância
  const force = distance * distance / k

  // Componentes da força
  const fx = (dx / distance) * force
  const fy = (dy / distance) * force

  // Aplicar às velocidades (com mesmo sinal para atração)
  nodeA.vx += fx
  nodeA.vy += fy
  nodeB.vx -= fx
  nodeB.vy -= fy
}

/**
 * Resolve sobreposições entre nós em um layout circular
 */
function resolveCircularOverlaps (nodesByLevel, nodeLevels, centerX, centerY) {
  const iterations = 5

  for (let iter = 0; iter < iterations; iter++) {
    let overlapsExist = false

    // Para cada nível
    for (const level in nodesByLevel) {
      const nodesInLevel = nodesByLevel[level]

      // Compara cada par de nós no mesmo nível
      for (let i = 0; i < nodesInLevel.length; i++) {
        const nodeAId = nodesInLevel[i]
        let nodeA = null

        // Encontra o objeto do nó A
        for (let k = 0; k < mNodeList.length; k++) {
          if (mNodeList[k].id === nodeAId) {
            nodeA = mNodeList[k]
            break
          }
        }

        if (!nodeA) continue

        for (let j = i + 1; j < nodesInLevel.length; j++) {
          const nodeBId = nodesInLevel[j]
          let nodeB = null

          // Encontra o objeto do nó B
          for (let k = 0; k < mNodeList.length; k++) {
            if (mNodeList[k].id === nodeBId) {
              nodeB = mNodeList[k]
              break
            }
          }

          if (!nodeB) continue

          // Calcula a distância entre os nós
          const dx = nodeB.x - nodeA.x
          const dy = nodeB.y - nodeA.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          // Se os nós estão muito próximos
          if (distance < NODE_WIDTH * 1.5) {
            overlapsExist = true

            // Calcula os ângulos em relação ao centro
            const angleA = Math.atan2(nodeA.y - centerY, nodeA.x - centerX)
            const angleB = Math.atan2(nodeB.y - centerY, nodeB.x - centerX)

            // Calcula o raio atual
            const radiusA = Math.sqrt(Math.pow(nodeA.x - centerX, 2) + Math.pow(nodeA.y - centerY, 2))
            const radiusB = Math.sqrt(Math.pow(nodeB.x - centerX, 2) + Math.pow(nodeB.y - centerY, 2))

            // Ajusta os ângulos para afastar os nós
            const newAngleA = angleA - 0.05
            const newAngleB = angleB + 0.05

            // Aplica os novos ângulos, mantendo o mesmo raio
            nodeA.x = centerX + radiusA * Math.cos(newAngleA)
            nodeA.y = centerY + radiusA * Math.sin(newAngleA)
            nodeB.x = centerX + radiusB * Math.cos(newAngleB)
            nodeB.y = centerY + radiusB * Math.sin(newAngleB)
          }
        }
      }
    }

    // Se não houver mais sobreposições, termina as iterações
    if (!overlapsExist) break
  }
}
