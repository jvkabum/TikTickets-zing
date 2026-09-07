<template>
  <div
    v-if="easyFlowVisible"
    :class="{
      'fullscreen bg-white': isFullScreen,
      flowHeightDefault: !isFullScreen
    }"
  >
    <q-toolbar class="text-grey-8">
      <q-toolbar-title>
        <div class="text-h6">{{ data.name }}</div>
      </q-toolbar-title>

      <!-- Primeiro q-space para empurrar para o centro -->
      <q-space />

      <!-- Botão Nova Etapa no centro -->
      <button
        tabindex="0"
        type="button"
        class="q-btn q-btn-item non-selectable no-outline q-btn--standard q-btn--rectangle q-btn--rounded bg-primary text-white q-btn--actionable q-focusable q-hoverable q-btn--wrap"
        @click="addNodeFromButton('default')"
      >
        <span
          class="q-focus-helper"
          tabindex="-1"
        ></span
        ><span class="q-btn__wrapper col row q-anchor--skip"
          ><span class="q-btn__content text-center col items-center q-anchor--skip justify-center row"
            ><i
              aria-hidden="true"
              role="img"
              class="q-icon on-left mdi mdi-plus"
            >
            </i
            ><span class="block">Nova Etapa</span></span
          ></span
        >
      </button>

      <!-- Segundo q-space para empurrar para a direita -->
      <q-space />

      <q-btn
        round
        flat
        icon="mdi-delete"
        @click="deleteElement"
      ></q-btn>
      <q-separator
        inset
        spaced
        vertical
      />

      <q-btn
        round
        flat
        :icon="isFullScreen ? 'mdi-fullscreen-exit' : 'mdi-fullscreen'"
        @click="isFullScreen = !isFullScreen"
      />

      <q-btn
        round
        flat
        :icon="isPanelVisible ? 'mdi-chevron-right' : 'mdi-chevron-left'"
        @click="togglePanel"
        class="q-ml-sm"
      >
        <q-tooltip>{{ isPanelVisible ? 'Esconder painel' : 'Mostrar painel' }}</q-tooltip>
      </q-btn>

      <q-btn-dropdown
        color="primary"
        push
        glossy
        icon="mdi-arrange-send-backward"
        class="q-ml-sm"
        :disable="!data.nodeList || data.nodeList.length < 2"
        label="Organizar"
      >
        <q-tooltip>Escolha um layout para organizar os nós automaticamente</q-tooltip>
        <q-list>
          <q-item
            clickable
            v-close-popup
            @click="autoOrganizeNodes('hubRadial')"
          >
            <q-item-section avatar>
              <q-icon
                color="primary"
                name="mdi-chart-bubble"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label>Layout Hub Radial</q-item-label>
              <q-item-label caption>Fluxos complexos com vários níveis (como chatbots)</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-close-popup
            @click="autoOrganizeNodes('tree')"
          >
            <q-item-section avatar>
              <q-icon
                color="primary"
                name="mdi-file-tree"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label>Layout em árvore</q-item-label>
              <q-item-label caption>Organiza os nós em estrutura hierárquica</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-close-popup
            @click="autoOrganizeNodes('level')"
          >
            <q-item-section avatar>
              <q-icon
                color="primary"
                name="mdi-view-sequential"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label>Layout em níveis</q-item-label>
              <q-item-label caption>Organiza os nós horizontalmente em linhas por níveis</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-close-popup
            @click="autoOrganizeNodes('circle')"
          >
            <q-item-section avatar>
              <q-icon
                color="primary"
                name="mdi-chart-arc"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label>Layout circular</q-item-label>
              <q-item-label caption>Organiza os nós em círculo (bom para fluxos cíclicos)</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-close-popup
            @click="autoOrganizeNodes('grid')"
          >
            <q-item-section avatar>
              <q-icon
                color="primary"
                name="mdi-grid"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label>Layout em grade</q-item-label>
              <q-item-label caption>Organiza os nós em uma grade uniforme</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>

      <q-btn
        round
        flat
        icon="mdi-webhook"
        @click="resetAllConnectionsToBezier"
        class="q-ml-sm"
        color="primary"
      >
        <q-tooltip>Restaurar conexões curvas</q-tooltip>
      </q-btn>

      <q-btn
        standard
        rounded
        class="q-ml-sm"
        color="positive"
        :loading="savingFlow"
        :disable="savingFlow"
        @click="saveFlow"
      >
        <q-icon
          name="mdi-content-save-outline"
          class="on-left"
        />
        <span class="block">{{ savingFlow ? 'Salvando...' : 'Salvar' }}</span>
      </q-btn>
    </q-toolbar>
    <q-separator color="text-grey-3" />
    <div
      class="q-mt-sm"
      style="display: flex; height: calc(100% - 60px)"
    >
      <div
        id="efContainer"
        ref="efContainer"
        class="container"
        v-flowDrag
        :style="{ width: isPanelVisible ? 'calc(100% - 500px)' : '100%' }"
      >
        <template
          v-for="node in data.nodeList"
          :key="node.id"
        >
          <flow-node
            :id="node.id"
            :node="node"
            :activeElement="activeElement"
            @changeNodeSite="changeNodeSite"
            @nodeRightMenu="nodeRightMenu"
            @clickNode="clickNode"
            @updateNodeName="updateNodeName"
            @nodeAction="handleNodeAction"
            @openNodeEditor="openNodeEditor"
            @duplicateNode="duplicateNode"
          >
          </flow-node>
        </template>
        <!-- Forçar área de construção -->
        <div style="position: absolute; top: 2000px; left: 2000px">&nbsp;</div>
      </div>
      <!-- Configuração node -->
      <div
        :style="{
          width: '500px',
          'border-left': '1px solid #dce3e8',
          display: isPanelVisible ? 'block' : 'none'
        }"
      >
        <flow-node-form
          ref="nodeForm"
          @setLineLabel="setLineLabel"
          @updateLineLabelRealtime="updateLineLabelRealtime"
          @repaintEverything="repaintEverything"
          @formMounted="onNodeFormMounted"
          :filas="filas"
          :usuarios="usuarios"
          :nodesList="data"
          @addNode="addNode"
          @deleteLine="deleteLine"
          @addNewLineCondition="addNewLineCondition"
          @saveFlow="saveFlow"
        >
        </flow-node-form>
      </div>
    </div>
    <!-- Visualização Resultado -->
    <flow-info
      v-if="flowInfoVisible"
      ref="flowInfo"
      :data="data"
    ></flow-info>
    <flow-help
      v-if="flowHelpVisible"
      ref="flowHelp"
    ></flow-help>
  </div>
</template>

<script setup>
import { cloneDeep } from 'lodash'
import { uid as getUUID } from 'quasar'
import { UpdateChatFlow } from '../../service/chatFlow'
import { useChatFlowStore } from '../../stores/useChatFlowStore'
import { useFilaStore } from '../../stores/useFilaStore'
import { useUsuarioStore } from '../../stores/useUsuarioStore'
import { ForceDirected } from './force-directed'
import FlowHelp from './help.vue'
import './index.css'
import FlowInfo from './info.vue'
// import './jsplumb' // Carregado via public/jsplumb.js
import { jsplumbConnectOptions, jsplumbSetting } from './mixins'
import flowNode from './node.vue'
import FlowNodeForm from './node_form.vue'

const $q = useQuasar()
const chatFlowStore = useChatFlowStore()
const usuarioStore = useUsuarioStore()
const filaStore = useFilaStore()
const { flow: cDataFlow, usuarios, filas } = storeToRefs(chatFlowStore)

const isFullScreen = ref(false)
const isPanelVisible = ref(false)
// eslint-disable-next-line
const jsPlumb = ref(null)
const easyFlowVisible = ref(true)
const flowInfoVisible = ref(false)
const loadEasyFlowFinish = ref(false)
const flowHelpVisible = ref(false)
const data = reactive({
  nodeList: [],
  lineList: [],
  name: ''
})
const activeElement = reactive({
  type: undefined,
  id: undefined,
  sourceId: undefined,
  targetId: undefined
})
const zoom = ref(0.8)
const flowInfo = ref(null)
const flowHelp = ref(null)
const nodeForm = ref(null)
const efContainer = ref(null)
const menu = reactive({
  show: false,
  curNodeId: '',
  top: '0px'
})

// Diretiva v-flowDrag para evitar o aviso
const vFlowDrag = {
  created(el, binding) {
    // jsPlumb gerencia o drag, então esta diretiva pode ser apenas um marcador ou ter lógica minimalista se necessário.
    // Se houver lógica específica de drag anterior, ela deveria estar aqui.
    // Por enquanto, deixamos vazio para silenciar o erro.
  }
}

const nodeRightMenu = (nodeId, { action, x, y }) => {
  menu.show = true
  menu.curNodeId = nodeId
  menu.left = `${x}px`
  menu.top = `${y}px`

  // Se a ação for delete, já executa. Caso contrário abre o menu.
  if (action === 'delete') {
    const node = data.nodeList.find(n => n.id === nodeId)
    deleteNode(node)
    menu.show = false
  }
}

const addNewLineCondition = (from, to, oldTo) => {
  const sourceNode = data.nodeList.find(node => node.id === from)
  const targetNode = data.nodeList.find(node => node.id === to)

  const existingConnection = jsPlumb.value.getConnections({ source: from, target: to })[0]

  if (existingConnection) {
    if (targetNode) {
      setLineLabel(from, to, `Rotear para ${targetNode.name}`)
    }
  } else {
    const connParam = {
      source: from,
      target: to,
      paintStyle: { strokeWidth: 3, stroke: '#8db1dd' },
      connector: ['Bezier', { curviness: 70 }],
      overlays: [
        [
          'Label',
          {
            label: targetNode ? `Rotear para ${targetNode.name}` : 'Valor',
            cssClass: 'connection-label editable-label',
            location: 0.5
          }
        ]
      ]
    }

    const conn = jsPlumb.value.connect(connParam, jsplumbConnectOptions)
    
    // Garantir que a linha seja adicionada à lista de dados para persistência
    if (!data.lineList.some(line => line.from === from && line.to === to)) {
      data.lineList.push({
        from,
        to,
        label: targetNode ? `Rotear para ${targetNode.name}` : '',
        connector: ['Bezier', { curviness: 70 }]
      })
    }

    try {
      const sourcePos = jsPlumb.value.getOffset(from)
      const targetPos = jsPlumb.value.getOffset(to)
      const dx = targetPos.left - sourcePos.left
      const dy = targetPos.top - sourcePos.top
      const absDx = Math.abs(dx)
      const absDy = Math.abs(dy)
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI

      let sourceAnchor, targetAnchor
      if (absDy > absDx * 0.8) {
        if (dy > 0) {
          sourceAnchor = 'Bottom'
          targetAnchor = 'Top'
        } else {
          sourceAnchor = 'Top'
          targetAnchor = 'Bottom'
        }
      } else {
        if (angle > -45 && angle <= 45) {
          sourceAnchor = 'Right'
          targetAnchor = 'Left'
        } else if (angle > 45 && angle <= 135) {
          sourceAnchor = 'Bottom'
          targetAnchor = 'Top'
        } else if ((angle > 135 && angle <= 180) || (angle <= -135 && angle >= -180)) {
          sourceAnchor = 'Left'
          targetAnchor = 'Right'
        } else {
          sourceAnchor = 'Top'
          targetAnchor = 'Bottom'
        }
      }
      conn.endpoints[0].setAnchor(sourceAnchor)
      conn.endpoints[1].setAnchor(targetAnchor)
    } catch (e) {
      console.log('Erro ao configurar âncoras:', e)
    }
  }

  if (oldTo) {
    const conn = jsPlumb.value.getConnections({ source: from, target: oldTo })[0]
    if (conn) jsPlumb.value.deleteConnection(conn)
  }

  if (sourceNode && targetNode) {
    if (!sourceNode.conditions) sourceNode.conditions = []
    const index = sourceNode.conditions.findIndex(c => (c.nextNode || c.nextStepId) === to)
    if (index === -1) {
      sourceNode.conditions.push({
        id: getUUID(),
        nextNode: to,
        target: to,
        description: `Rotear para ${targetNode.name}`,
        type: 'Equals'
      })
    }
  }

  nextTick(() => {
    if (nodeForm.value) nodeForm.value.updateNodeConditions()
  })
}

const jsPlumbInit = () => {
  jsPlumb.value.importDefaults(jsplumbSetting)
  jsPlumb.value.ready(() => {
    jsPlumb.value.bind('click', conn => {
      activeElement.type = 'line'
      activeElement.id = conn.id
      activeElement.sourceId = conn.sourceId
      activeElement.targetId = conn.targetId
    })

    jsPlumb.value.bind('connection', info => {
      const from = info.sourceId
      const to = info.targetId
      if (loadEasyFlowFinish.value) {
        if (!data.lineList.some(line => line.from === from && line.to === to)) {
          data.lineList.push({ from, to, label: '', connector: ['Bezier', { curviness: 70 }] })
        }
      }
      onConnect(info)
    })

    jsPlumb.value.bind('beforeDrop', evt => {
      if (evt.sourceId === evt.targetId) {
        $q.notify({ type: 'warning', message: 'Nós não podem se conectar a si mesmos' })
        return false
      }
      return true
    })

    jsPlumb.value.bind('beforeDetach', conn => {
      return $q.dialog({
        title: 'Confirmar desconexão',
        message: 'Deseja realmente remover esta conexão?',
        cancel: true,
        persistent: true
      })
    })

    jsPlumb.value.bind('connectionDetached', info => {
      data.lineList = data.lineList.filter(line => !(line.from === info.sourceId && line.to === info.targetId))
    })

    jsPlumb.value.setContainer(efContainer.value)
  })
}

const loadEasyFlow = () => {
  if (jsPlumb.value && data.nodeList) {
    data.nodeList.forEach(node => {
      jsPlumb.value.removeAllEndpoints(node.id)
    })
  }

  for (const node of data.nodeList) {


    if (!node.viewOnly && !['start', 'exception'].includes(node.type)) {
      jsPlumb.value.addEndpoint(node.id, {
        anchor: 'Bottom',
        isSource: true,
        isTarget: false,
        maxConnections: -1,
        cssClass: 'jtk-source-endpoint primary-endpoint',
        hoverClass: 'jtk-source-endpoint-hover',
        connectorStyle: { stroke: '#8db1dd', strokeWidth: 3 },
        endpoint: ['Dot', { radius: 6 }],
        connector: ['Bezier', { curviness: 70 }]
      })

      jsPlumb.value.addEndpoint(node.id, {
        anchor: 'Top',
        isTarget: true,
        isSource: false,
        maxConnections: -1,
        cssClass: 'jtk-target-endpoint',
        endpoint: ['Dot', { radius: 6 }]
      })
    } else if (node.type === 'start') {
      jsPlumb.value.addEndpoint(node.id, {
        anchor: 'Bottom',
        isSource: true,
        isTarget: false,
        maxConnections: -1,
        cssClass: 'jtk-source-endpoint node-color-start primary-endpoint',
        endpoint: ['Dot', { radius: 6 }]
      })
    }

    jsPlumb.value.draggable(node.id, {
      containment: 'parent',
      stop: el => {
        changeNodeSite({
          id: node.id,
          left: el.el.style.left,
          top: el.el.style.top
        })
        optimizeConnections(node.id)
      }
    })
  }

  data.lineList.forEach(line => {
    jsPlumb.value.connect(
      {
        source: line.from,
        target: line.to,
        connector: line.connector || ['Bezier', { curviness: 70 }],
        paintStyle: { strokeWidth: 3, stroke: '#8db1dd' },
        overlays: [
          [
            'Label',
            {
              label: line.label || '',
              cssClass: 'connection-label editable-label',
              location: 0.5
            }
          ]
        ]
      },
      jsplumbConnectOptions
    )
  })

  nextTick(() => {
    data.nodeList.forEach(node => optimizeConnections(node.id))
    updateEndpointClasses()
    loadEasyFlowFinish.value = true
    jsPlumb.value.repaintEverything()
  })
}

const updateEndpointClasses = () => {
  document.querySelectorAll('.jtk-endpoint').forEach(ep => {
    ep.classList.remove('jtk-endpoint-connected')
  })

  const connections = jsPlumb.value.getAllConnections()
  connections.forEach(conn => {
    if (conn.endpoints) {
      conn.endpoints.forEach(ep => {
        if (ep.canvas) ep.canvas.classList.add('jtk-endpoint-connected')
      })
    }
  })

  if (loadEasyFlowFinish.value) {
    jsPlumb.value.repaintEverything()
  }
}

const setLineLabel = (from, to, label) => {
  const connections = jsPlumb.value.getConnections({ source: from, target: to })
  if (connections.length === 0) return

  const conn = connections[0]
  conn.setLabel({
    label,
    cssClass: 'connection-label editable-label',
    location: 0.5
  })

  const line = data.lineList.find(l => l.from === from && l.to === to)
  if (line) {
    line.label = label
  } else {
    data.lineList.push({ from, to, label })
  }

  const sourceNode = data.nodeList.find(node => node.id === from)
  if (sourceNode && sourceNode.conditions) {
    sourceNode.conditions.forEach(condition => {
      if ((condition.nextNode || condition.nextStepId) === to) {
        condition.description = label
      }
    })
  }
}

const deleteElement = () => {
  if (activeElement.type === 'node') {
    const node = data.nodeList.find(n => n.id === activeElement.id)
    if (node && ['start', 'configurations'].includes(node.type)) {
      $q.notify({ type: 'warning', message: 'Este nó não pode ser excluído' })
      return
    }
    deleteNode(node)
  } else if (activeElement.type === 'line') {
    $q.dialog({
      title: 'Deletar linha',
      message: 'Deseja realmente deletar a linha selecionada?',
      cancel: true
    }).onOk(() => {
      const conn = jsPlumb.value.getConnections({
        source: activeElement.sourceId,
        target: activeElement.targetId
      })[0]
      if (conn) jsPlumb.value.deleteConnection(conn)
    })
  }
}

const deleteLine = (sourceId, targetId) => {
  const connections = jsPlumb.value.getAllConnections()
  connections.forEach(conn => {
    if (conn.sourceId === sourceId && conn.targetId === targetId) {
      jsPlumb.value.deleteConnection(conn)
    }
  })

  const sourceNode = data.nodeList.find(node => node.id === sourceId)
  if (sourceNode && sourceNode.conditions) {
    sourceNode.conditions = sourceNode.conditions.filter(c => c.nextNode !== targetId && c.nextStepId !== targetId)
  }

  if (nodeForm.value && activeElement.id === sourceId) {
    nodeForm.value.updateNodeConditions()
  }
}

const deleteNode = node => {
  if (node && ['start', 'configurations'].includes(node.type)) {
    $q.notify({ type: 'warning', message: 'Este nó não pode ser excluído' })
    return false
  }

  $q.dialog({
    title: 'Atenção!!',
    message: `Deseja realmente deletar o elemento (${node.name || 'nó'})?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    data.nodeList = data.nodeList.filter(n => n.id !== node.id)
    nextTick(() => {
      jsPlumb.value.removeAllEndpoints(node.id)
    })
  })
  return true
}

const clickNode = nodeId => {
  const node = data.nodeList.find(n => n.id === nodeId)
  if (node) {
    // Replicar Vue 2.7: activeElement = node (mesma referência que data.nodeList)
    activeElement.type = 'node'
    activeElement.id = node.id
    // Passar a referência do nó explicitamente para o form usar a mesma que data.nodeList
    if (nodeForm.value) nodeForm.value.nodeInit(data, nodeId, node)
    if (node && !['start', 'exception'].includes(node.type)) {
      nextTick(() => {
        if (nodeForm.value) nodeForm.value.activateSection('conditions')
      })
    }
  }
}

/** Re-sincroniza o form com o nó selecionado quando o form monta (ex.: após remount). */
const onNodeFormMounted = () => {
  if (activeElement.type === 'node' && activeElement.id && nodeForm.value) {
    const node = data.nodeList.find(n => n.id === activeElement.id)
    if (node) nodeForm.value.nodeInit(data, activeElement.id, node)
  }
}

const addNode = (evt, nodeMenu) => {
  const screenX = evt.originalEvent.clientX
  const screenY = evt.originalEvent.clientY
  const container = efContainer.value
  const rect = container.getBoundingClientRect()

  const left = screenX - rect.x + container.scrollLeft - 85
  const top = screenY - rect.y + container.scrollTop - 16

  const id = getUUID()
  const newNode = {
    ...nodeMenu,
    id,
    left: `${left}px`,
    top: `${top}px`,
    state: 'success'
  }

  data.nodeList.push(newNode)
  nextTick(() => {

    jsPlumb.value.draggable(id, {
      containment: 'parent',
      stop: el => {
        changeNodeSite({
          id: id,
          left: el.el.style.left,
          top: el.el.style.top
        })
      }
    })

    if (!newNode.viewOnly && !['start', 'exception'].includes(newNode.type)) {
      jsPlumb.value.addEndpoint(id, {
        anchor: 'Bottom',
        isSource: true,
        isTarget: false,
        maxConnections: -1,
        cssClass: 'jtk-source-endpoint primary-endpoint',
        hoverClass: 'jtk-source-endpoint-hover',
        connectorStyle: { stroke: '#8db1dd', strokeWidth: 3 },
        endpoint: ['Dot', { radius: 6 }],
        connector: ['Bezier', { curviness: 70 }]
      })

      jsPlumb.value.addEndpoint(id, {
        anchor: 'Top',
        isTarget: true,
        isSource: false,
        maxConnections: -1,
        cssClass: 'jtk-target-endpoint',
        endpoint: ['Dot', { radius: 6 }]
      })
    }
  })
}

const addNodeFromButton = type => {
  const id = getUUID()
  const newNode = {
    id,
    nodeId: id,
    name: 'Nova etapa',
    type: 'node',
    left: '100px',
    top: '100px',
    state: 'success',
    interactions: [],
    conditions: [],
    actions: []
  }
  data.nodeList.push(newNode)
  nextTick(() => {

    jsPlumb.value.draggable(id, {
      containment: 'parent',
      stop: el => {
        changeNodeSite({
          id: id,
          left: el.el.style.left,
          top: el.el.style.top
        })
      }
    })

    if (!newNode.viewOnly && !['start', 'exception'].includes(newNode.type)) {
      jsPlumb.value.addEndpoint(id, {
        anchor: 'Bottom',
        isSource: true,
        isTarget: false,
        maxConnections: -1,
        cssClass: 'jtk-source-endpoint primary-endpoint',
        hoverClass: 'jtk-source-endpoint-hover',
        connectorStyle: { stroke: '#8db1dd', strokeWidth: 3 },
        endpoint: ['Dot', { radius: 6 }],
        connector: ['Bezier', { curviness: 70 }]
      })

      jsPlumb.value.addEndpoint(id, {
        anchor: 'Top',
        isTarget: true,
        isSource: false,
        maxConnections: -1,
        cssClass: 'jtk-target-endpoint',
        endpoint: ['Dot', { radius: 6 }]
      })
    }
  })
}





const duplicateNode = nodeId => {
  const originalNode = data.nodeList.find(n => n.id === nodeId)
  if (!originalNode) return

  const id = getUUID()
  const newNode = cloneDeep(originalNode)
  
  newNode.id = id
  newNode.nodeId = id
  newNode.name = `${newNode.name} (Cópia)`
  
  const left = parseInt(originalNode.left || '0') + 30
  const top = parseInt(originalNode.top || '0') + 30
  newNode.left = `${left}px`
  newNode.top = `${top}px`

  data.nodeList.push(newNode)

  nextTick(() => {

    jsPlumb.value.draggable(id, {
      containment: 'parent',
      stop: el => {
        changeNodeSite({
          id: id,
          left: el.el.style.left,
          top: el.el.style.top
        })
      }
    })
  })
}

const onConnect = info => {
  const from = info.sourceId
  const to = info.targetId
  const sourceNode = data.nodeList.find(n => n.id === from)
  const targetNode = data.nodeList.find(n => n.id === to)

  if (sourceNode && targetNode) {
    if (!sourceNode.conditions) sourceNode.conditions = []
    const index = sourceNode.conditions.findIndex(c => (c.nextNode || c.nextStepId) === to)
    if (index === -1) {
      sourceNode.conditions.push({
        id: getUUID(),
        nextNode: to,
        target: to,
        description: `Rotear para ${targetNode.name}`,
        type: 'Equals'
      })
    }
  }
}

const repaintEverything = () => {
  if (jsPlumb.value) jsPlumb.value.repaintEverything()
}

const dataReload = newData => {
  easyFlowVisible.value = false
  data.nodeList = []
  data.lineList = []
  nextTick(() => {
    const cloned = cloneDeep(newData)
    Object.assign(data, cloned)
    easyFlowVisible.value = true
    nextTick(() => {
      if (window.jsPlumb) {
        jsPlumb.value = window.jsPlumb.getInstance()
        jsPlumbInit()
        loadEasyFlow()
      }
    })
  })
}

const savingFlow = ref(false)
const saveFlow = async () => {
  savingFlow.value = true
  try {
    // Alinhado ao Vue 2.7: garantir conector Bezier antes de salvar
    resetAllConnectionsToBezier()

    // Normalização de nodeList (igual Vue 2.7): id, nodeId, conditions com nextStepId
    const normalizedNodeList = (data.nodeList || []).map(node => ({
      ...node,
      id: node.id || getUUID(),
      nodeId: node.nodeId || node.id || getUUID(),
      conditions: (node.conditions || []).map(condition => ({
        ...condition,
        id: condition.id || getUUID(),
        nodeId: condition.nodeId ?? condition.target ?? condition.nextNode ?? condition.nextStepId,
        nextStepId: condition.nextStepId ?? condition.nextNode ?? condition.target
      }))
    }))

    // Normalização de lineList (igual Vue 2.7): from, to, label com fallback
    const normalizedLineList = (data.lineList || []).map(line => ({
      ...line,
      from: line.from || '',
      to: line.to || '',
      label: line.label || ''
    }))

    // Payload como no Vue 2.7: top-level do registro + flow apenas com nodeList e lineList
    const payload = {
      ...cDataFlow.value,
      flow: { nodeList: normalizedNodeList, lineList: normalizedLineList }
    }
    await UpdateChatFlow(payload)
    $q.notify({ type: 'positive', message: 'Fluxo salvo com sucesso!' })
  } catch (err) {
    $q.notify({ type: 'negative', message: 'Erro ao salvar o fluxo.' })
  } finally {
    savingFlow.value = false
  }
}

const togglePanel = () => {
  isPanelVisible.value = !isPanelVisible.value
  nextTick(() => repaintEverything())
}

const autoOrganizeNodes = layout => {
  try {
    const organized = ForceDirected(cloneDeep(data), layout)
    data.nodeList.forEach((node, i) => {
      if (organized.nodeList[i]) {
        node.left = organized.nodeList[i].left
        node.top = organized.nodeList[i].top
      }
    })
    nextTick(() => repaintEverything())
  } catch (e) {
    $q.notify({ type: 'negative', message: 'Erro ao organizar nós.' })
  }
}

const optimizeConnections = nodeId => {
  repaintEverything()
}

const resetAllConnectionsToBezier = () => {
  const connections = jsPlumb.value.getAllConnections()
  connections.forEach(conn => {
    conn.setConnector(['Bezier', { curviness: 70 }])
  })
  repaintEverything()
}

const changeNodeSite = nodeData => {
  const node = data.nodeList.find(n => n.id === nodeData.id)
  if (node) {
    node.left = nodeData.left
    node.top = nodeData.top
  }
}

const updateNodeName = (nodeId, name) => {
  const node = data.nodeList.find(n => n.id === nodeId)
  if (node) node.name = name
}

const handleNodeAction = action => {
  if (typeof action === 'object' && action.nodeId) {
    clickNode(action.nodeId)
  }
}

const openNodeEditor = nodeId => {
  isPanelVisible.value = true
  clickNode(nodeId)
}

const updateLineLabelRealtime = (from, to, label) => {
  const conn = jsPlumb.value.getConnections({ source: from, target: to })[0]
  if (conn) {
    conn.setLabel({ label, cssClass: 'connection-label editable-label', location: 0.5 })
  }
}

watch(
  () => cDataFlow.value?.flow,
  val => {
    if (val) dataReload(val)
  },
  { deep: true }
)

onMounted(async () => {
  if (window.jsPlumb) {
    jsPlumb.value = window.jsPlumb.getInstance()
    jsPlumbInit()
    if (cDataFlow.value?.flow) {
      dataReload(cDataFlow.value.flow)
    } else {
      const stored = localStorage.getItem('currentChatFlow')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          chatFlowStore.setFlowData({
            flow: parsed,
            usuarios: chatFlowStore.usuarios,
            filas: chatFlowStore.filas
          })
          dataReload(parsed.flow)
        } catch (e) {
          console.error('Erro ao recuperar fluxo do localStorage', e)
        }
      }
    }
  } else {
    console.error('jsPlumb não foi carregado corretamente.')
  }
  // Fallback: Fetch data if missing (e.g. on page refresh)
  if (!chatFlowStore.usuarios || chatFlowStore.usuarios.length === 0) {
    try {
      const { users } = await usuarioStore.listarUsuarios({ pageNumber: 1, searchParam: null, hasMore: true })
      chatFlowStore.usuarios = users
    } catch (e) {
      console.error('Erro ao carregar usuarios no panel', e)
    }
  }
  if (!chatFlowStore.filas || chatFlowStore.filas.length === 0) {
    try {
      await filaStore.listarFilas()
      chatFlowStore.filas = filaStore.filas
    } catch (e) {
      console.error('Erro ao carregar filas no panel', e)
    }
  }
})

defineExpose({
  loadEasyFlow,
  repaintEverything,
  dataReload,
  saveFlow
})
</script>

<style lang="css">
#efContainer {
  position: relative;
  flex: 1;
  height: 100%;
  overflow: hidden;
  background-image: radial-gradient(circle, #d7d7d7 1px, rgba(0, 0, 0, 0) 1px);
  background-size: 20px 20px;
}
.flowHeightDefault {
  height: calc(100vh - 120px) !important;
}
.jtk-endpoint {
  z-index: 100 !important;
  cursor: crosshair !important;
}
.jtk-endpoint-connected {
  /* display: none !important; */
}
.jtk-connector {
  z-index: 99 !important;
}
.jtk-overlay {
  z-index: 101 !important;
}
.connection-label {
  background-color: white;
  padding: 4px 8px;
  border: 1px solid #8db1dd;
  border-radius: 4px;
  font-size: 12px;
  color: #2c3e50;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  pointer-events: all !important;
  cursor: pointer;
}
.editable-label:hover {
  background-color: #f8f9fa;
  border-color: #3498db;
}
</style>
