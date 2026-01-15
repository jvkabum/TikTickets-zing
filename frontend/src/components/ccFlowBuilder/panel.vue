<template>
  <div
    v-if="easyFlowVisible"
    :class="{
      'fullscreen bg-white': isFullScreen,
      'flowHeightDefault': !isFullScreen
    }"
  >
    <q-toolbar class="text-grey-8 ">
      <q-toolbar-title>
        <div class="text-h6">{{ data.name }}</div>
      </q-toolbar-title>

      <!-- Primeiro q-space para empurrar para o centro -->
      <q-space />

      <!-- Botão Nova Etapa no centro -->
      <button tabindex="0" type="button" class="q-btn q-btn-item non-selectable no-outline q-btn--standard q-btn--rectangle q-btn--rounded bg-primary text-white q-btn--actionable q-focusable q-hoverable q-btn--wrap" @click="addNodeFromButton('default')"><span class="q-focus-helper" tabindex="-1"></span><span class="q-btn__wrapper col row q-anchor--skip"><span class="q-btn__content text-center col items-center q-anchor--skip justify-center row"><i aria-hidden="true" role="img" class="q-icon on-left mdi mdi-plus"> </i><span class="block">Nova Etapa</span></span></span></button>

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
          <q-item clickable v-close-popup @click="autoOrganizeNodes('hubRadial')">
            <q-item-section avatar>
              <q-icon color="primary" name="mdi-chart-bubble" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Layout Hub Radial</q-item-label>
              <q-item-label caption>Fluxos complexos com vários níveis (como chatbots)</q-item-label>
            </q-item-section>
          </q-item>

          <q-item clickable v-close-popup @click="autoOrganizeNodes('tree')">
            <q-item-section avatar>
              <q-icon color="primary" name="mdi-file-tree" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Layout em árvore</q-item-label>
              <q-item-label caption>Organiza os nós em estrutura hierárquica</q-item-label>
            </q-item-section>
          </q-item>

          <q-item clickable v-close-popup @click="autoOrganizeNodes('level')">
            <q-item-section avatar>
              <q-icon color="primary" name="mdi-view-sequential" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Layout em níveis</q-item-label>
              <q-item-label caption>Organiza os nós horizontalmente em linhas por níveis</q-item-label>
            </q-item-section>
          </q-item>

          <q-item clickable v-close-popup @click="autoOrganizeNodes('circle')">
            <q-item-section avatar>
              <q-icon color="primary" name="mdi-chart-arc" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Layout circular</q-item-label>
              <q-item-label caption>Organiza os nós em círculo (bom para fluxos cíclicos)</q-item-label>
            </q-item-section>
          </q-item>

          <q-item clickable v-close-popup @click="autoOrganizeNodes('grid')">
            <q-item-section avatar>
              <q-icon color="primary" name="mdi-grid" />
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
        @click="saveFlow"
      >
        <q-icon name="mdi-content-save-outline" class="on-left" />
        <span class="block">Salvar</span>
      </q-btn>

    </q-toolbar>
    <q-separator color="text-grey-3" />
    <div
      class="q-mt-sm"
      style="display: flex; height: calc(100% - 60px);"
    >
      <div
        id="efContainer"
        ref="efContainer"
        class="container"
        v-flowDrag
        :style="{ width: isPanelVisible ? 'calc(100% - 500px)' : '100%' }"
      >
        <template v-for="node in data.nodeList" :key="node.id">
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
          >
          </flow-node>
        </template>
        <!-- Forçar área de construção -->
        <div style="position:absolute;top: 2000px;left: 2000px;">&nbsp;</div>
      </div>
      <!-- Configuração node -->
      <div
        :style="{ width: '500px', 'border-left': '1px solid #dce3e8',
                  display: isPanelVisible ? 'block' : 'none' }"
      >
        <flow-node-form
          ref="nodeForm"
          @setLineLabel="setLineLabel"
          @updateLineLabelRealtime="updateLineLabelRealtime"
          @repaintEverything="repaintEverything"
          :filas="cDataFlow.filas"
          :usuarios="cDataFlow.usuarios"
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

<script>
import draggable from 'vuedraggable'
import './jsplumb'
import { easyFlowMixin } from './mixins'
import FlowNode from './node.vue'
import nodeMenu from './node_menu.vue'
import FlowInfo from './info.vue'
import FlowHelp from './help.vue'
import FlowNodeForm from './node_form.vue'
import { cloneDeep } from 'lodash'
import './index.css'
import { uid } from 'quasar'
import { ForceDirected } from './force-directed'

import { UpdateChatFlow } from '../../service/chatFlow'

export default {
  data () {
    return {
      isFullScreen: false,
      isPanelVisible: false,
      jsPlumb: null,
      easyFlowVisible: true,
      flowInfoVisible: false,
      loadEasyFlowFinish: false,
      flowHelpVisible: false,
      data: {},
      activeElement: {
        type: undefined,
        nodeId: undefined,
        sourceId: undefined,
        targetId: undefined
      },
      zoom: 0.5
    }
  },
  props: {
    filas: {
      type: Array,
      default: () => []
    },
    usuarios: {
      type: Array,
      default: () => []
    }
  },
  mixins: [easyFlowMixin],
  components: {
    // eslint-disable-next-line vue/no-unused-components
    draggable, flowNode, nodeMenu, FlowInfo, FlowNodeForm, FlowHelp
  },
  directives: {
    flowDrag: {
      mounted (el, binding, vnode, oldNode) {
        if (!binding) {
          return
        }
        el.onmousedown = (e) => {
          if (e.button == 2) {
            return
          }
          let disX = e.clientX
          let disY = e.clientY
          el.style.cursor = 'move'

          document.onmousemove = function (e) {
            e.preventDefault()
            const left = e.clientX - disX
            disX = e.clientX
            el.scrollLeft += -left

            const top = e.clientY - disY
            disY = e.clientY
            el.scrollTop += -top
          }

          document.onmouseup = function (e) {
            el.style.cursor = 'auto'
            document.onmousemove = null
            document.onmouseup = null
          }
        }
      }
    }
  },
  computed: {
    cDataFlow () {
      return this.$store.state.chatFlow
    }
  },
  methods: {
    getUUID () {
      return uid()
    },
    addNewLineCondition (from, to, oldTo) {
      if (!this.jsPlumpConsist({ sourceId: from, targetId: to })) {
        return
      }

      // Buscar os nós de origem e destino
      const sourceNode = this.data.nodeList.find(node => node.id === from)
      const targetNode = this.data.nodeList.find(node => node.id === to)

      // Verificar se já existe uma conexão entre estes nós
      const existingConnection = this.jsPlumb.getConnections({
        source: from,
        target: to
      })[0]

      // Se já existe uma conexão, não criar outra
      if (existingConnection) {
        // Apenas atualizar o rótulo se necessário
        if (targetNode) {
          this.setLineLabel(from, to, `Rotear para ${targetNode.name}`)
        }
      } else {
        // Se não existe conexão, criar uma nova
        const connParam = {
          source: from,
          target: to,
          paintStyle: { strokeWidth: 3, stroke: '#8db1dd' },
          connector: ['Bezier', { curviness: 70 }],
          overlays: [
            ['Label', {
              label: targetNode ? `Rotear para ${targetNode.name}` : 'Valor',
              cssClass: 'connection-label editable-label',
              location: 0.5
            }]
          ]
        }

        // Aplicar o conector e determinar os pontos de ancoragem
        const conn = this.jsPlumb.connect(connParam, this.jsplumbConnectOptions)

        // Determinar os melhores pontos de ancoragem com base na posição relativa
        try {
          // Obter posições absolutas dos nós
          const sourcePos = this.jsPlumb.getOffset(from)
          const targetPos = this.jsPlumb.getOffset(to)

          // Calcular os vetores direcionais entre os nós
          const dx = targetPos.left - sourcePos.left
          const dy = targetPos.top - sourcePos.top

          // Calcular distâncias absolutas para comparação
          const absDx = Math.abs(dx)
          const absDy = Math.abs(dy)

          // Calcular o ângulo entre os nós (em graus)
          const angle = Math.atan2(dy, dx) * 180 / Math.PI

          let sourceAnchor, targetAnchor

          // Verificar primeiro se há uma diferença vertical significativa
          // Priorizar conexões verticais quando o nó está claramente acima ou abaixo
          if (absDy > absDx * 0.8) {
            // Conexão vertical predominante
            if (dy > 0) {
              // Target está abaixo
              sourceAnchor = 'Bottom'
              targetAnchor = 'Top'
            } else {
              // Target está acima
              sourceAnchor = 'Top'
              targetAnchor = 'Bottom'
            }
          } else {
            if (angle > -45 && angle <= 45) {
              // Target está à direita
              sourceAnchor = 'Right'
              targetAnchor = 'Left'
            } else if (angle > 45 && angle <= 135) {
              // Target está abaixo
              sourceAnchor = 'Bottom'
              targetAnchor = 'Top'
            } else if ((angle > 135 && angle <= 180) || (angle <= -135 && angle >= -180)) {
              // Target está à esquerda
              sourceAnchor = 'Left'
              targetAnchor = 'Right'
            } else if (angle > -135 && angle <= -45) {
              // Target está acima
              sourceAnchor = 'Top'
              targetAnchor = 'Bottom'
            }
          }

          // Aplicar as âncoras
          conn.endpoints[0].setAnchor(sourceAnchor)
          conn.endpoints[1].setAnchor(targetAnchor)
        } catch (e) {
          console.log('Erro ao configurar âncoras na nova conexão:', e)
        }
      }

      if (oldTo) {
        const conn = this.jsPlumb.getConnections({
          source: from,
          target: oldTo
        })[0]
        if (conn) {
          this.jsPlumb.deleteConnection(conn)
        }
      }

      // Buscar e atualizar o nó de origem e configurar a condição
      if (sourceNode && targetNode) {
        // Verificar se já existe uma condição para esta conexão
        const existingConditionIndex = sourceNode.conditions
          ? sourceNode.conditions.findIndex(c => c.nextNode === to || c.nextStepId === to) : -1

        if (existingConditionIndex === -1 && !['start', 'exception'].includes(sourceNode.type)) {
          // Se não existe, cria uma nova condição padrão
          if (!sourceNode.conditions) {
            sourceNode.conditions = []
          }

          // Adiciona condição padrão para rotear para o nó de destino
          sourceNode.conditions.push({
            id: this.getUUID(),
            type: 'R', // Respostas específicas em vez de Qualquer resposta
            condition: [targetNode.name], // Inicializar com o nome do nó destino
            action: 0, // Etapa
            nextNode: to,
            nextStepId: to,
            description: `Rotear para ${targetNode.name}`
          })
        } else if (existingConditionIndex !== -1) {
          // Se a condição já existe, garantir que action esteja definido como 0 (Etapa)
          sourceNode.conditions[existingConditionIndex].action = 0
        }
      }

      // Atualizar a interface
      this.$nextTick(() => {
        this.clickNode(from)
        if (this.$refs.nodeForm && this.$refs.nodeForm.updateNodeConditions) {
          this.$refs.nodeForm.updateNodeConditions()
        }
      })
    },
    saveFlow () {
      // Preparar os dados para salvar
      const data = {
        ...this.cDataFlow.flow,
        flow: {
          nodeList: this.data.nodeList.map(node => ({
            ...node,
            id: node.id || this.getUUID(),
            nodeId: node.nodeId || node.id || this.getUUID(),
            conditions: (node.conditions || []).map(condition => ({
              ...condition,
              id: condition.id || this.getUUID(),
              nodeId: condition.nodeId || condition.target || condition.nextNode || condition.nextStepId,
              nextStepId: condition.nextStepId || condition.nextNode || condition.target
            }))
          })),
          lineList: this.data.lineList.map(line => ({
            ...line,
            from: line.from || '',
            to: line.to || '',
            label: line.label || ''
          }))
        }
      }

      // Garantir que todas as conexões estejam usando o estilo Bezier antes de salvar
      this.resetAllConnectionsToBezier()

      // Salvar diretamente sem perguntar sobre organização
      this.finalizeSave(data)
    },
    finalizeSave (data) {
      UpdateChatFlow(data).then(res => {
        this.$q.notify({
          message: 'Fluxo salvo com sucesso!',
          type: 'positive',
          position: 'top',
          timeout: 2000
        })
      }).catch(error => {
        console.error('Erro detalhado:', error.response?.data || error)
        this.$q.notify({
          message: 'Erro ao salvar o fluxo. Verifique o console para mais detalhes.',
          type: 'negative',
          position: 'top',
          timeout: 2000
        })
      })
    },
    jsPlumpConsist (evt) {
      const from = evt.sourceId
      const to = evt.targetId
      if (from === to) {
        this.$q.notify({
          type: 'negative',
          progress: true,
          position: 'top',
          timeout: 2500,
          message: 'Não é possível conectar o elemento a si mesmo.',
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
        return false
      }
      return true
    },
    jsPlumbInit () {
      this.jsPlumb.ready(() => {
        this.jsPlumb.importDefaults(this.jsplumbSetting)
        this.jsPlumb.setSuspendDrawing(false, true)
        this.loadEasyFlow()

        // Eventos de clique em conexões existentes
        this.jsPlumb.bind('click', (conn, originalEvent) => {
          // this.activeElement.type = 'line'
          this.activeElement.sourceId = conn.sourceId
          this.activeElement.targetId = conn.targetId
          this.$refs.nodeForm.lineInit({
            from: conn.sourceId,
            to: conn.targetId,
            label: conn.getLabel()
          })
        })

        // Eventos de duplo clique para editar o label da conexão
        this.jsPlumb.bind('dblclick', (conn, originalEvent) => {
          // Verificar se o clique foi no label da conexão
          if (originalEvent.target.classList.contains('jtk-overlay') ||
              originalEvent.target.parentElement.classList.contains('jtk-overlay')) {
            this.activeElement.type = 'line'
            this.activeElement.sourceId = conn.sourceId
            this.activeElement.targetId = conn.targetId

            // Abrir o painel lateral e inicializar a edição da linha
            this.isPanelVisible = true

            this.$refs.nodeForm.lineInit({
              from: conn.sourceId,
              to: conn.targetId,
              label: conn.getLabel()
            })

            // Notificar o usuário
            this.$q.notify({
              type: 'info',
              message: 'Editando chave da conexão',
              position: 'top',
              timeout: 1500
            })
          }
        })

        // Eventos para conexões criadas
        this.jsPlumb.bind('connection', (evt) => {
          if (!this.jsPlumpConsist(evt)) {
            return
          }
          const from = evt.source.id
          const to = evt.target.id
          if (this.loadEasyFlowFinish) {
            // Obter o nome do nó de destino para usar no rótulo
            const targetNode = this.data.nodeList.find(node => node.id === to)
            const defaultLabel = targetNode ? `Rotear para ${targetNode.name}` : 'Valor'

            // Configurar o conector para ser curvo e organizado
            // Priorizar conexões verticais
            try {
              // Verificar a posição relativa dos nós
              const sourcePos = this.jsPlumb.getOffset(from)
              const targetPos = this.jsPlumb.getOffset(to)

              // Determinar posição relativa e configurar âncoras apropriadas
              const isBelow = targetPos.top > sourcePos.top + 10 // 10px de tolerância
              const isAbove = targetPos.top < sourcePos.top - 10

              // Sempre preferir conexões verticais
              if (isBelow) {
                // Target está abaixo - use Bottom -> Top
                evt.connection.endpoints[0].setAnchor('Bottom')
                evt.connection.endpoints[1].setAnchor('Top')
              } else if (isAbove) {
                // Target está acima - use Top -> Bottom
                evt.connection.endpoints[0].setAnchor('Top')
                evt.connection.endpoints[1].setAnchor('Bottom')
              } else {
                // Estão na mesma altura - use horizontal
                const isRight = targetPos.left > sourcePos.left
                evt.connection.endpoints[0].setAnchor(isRight ? 'Right' : 'Left')
                evt.connection.endpoints[1].setAnchor(isRight ? 'Left' : 'Right')
              }
            } catch (e) {
              console.log('Erro ao configurar âncoras:', e)
            }

            // Adicionar à lista de linhas com o rótulo padrão
            this.data.lineList.push({ from: from, to: to, label: defaultLabel })

            // Inicializar a linha com o rótulo padrão
            this.$refs.nodeForm.lineInit({
              from,
              to,
              label: defaultLabel
            })

            // Definir o rótulo na conexão
            this.setLineLabel(from, to, defaultLabel)

            // Configurar automaticamente a condição para rotear para o nó de destino
            this.$nextTick(() => {
              const sourceNode = this.data.nodeList.find(node => node.id === from)
              if (sourceNode && targetNode) {
                // Ativar a aba de condições automaticamente
                this.$refs.nodeForm.activateSection('conditions')

                // Configurar a condição de roteamento automaticamente
                // Verifica se já existe uma condição para esta conexão
                const existingConditionIndex = sourceNode.conditions
                  ? sourceNode.conditions.findIndex(c => c.nextNode === to) : -1

                if (existingConditionIndex === -1) {
                  // Se não existe, cria uma nova condição padrão
                  if (!sourceNode.conditions) {
                    sourceNode.conditions = []
                  }

                  // Adiciona condição padrão para rotear para o nó de destino
                  sourceNode.conditions.push({
                    id: this.getUUID(),
                    type: 'R', // Respostas específicas em vez de Qualquer resposta
                    condition: [targetNode.name], // Inicializar com o nome do nó destino
                    action: 0, // Etapa
                    nextNode: to,
                    nextStepId: to,
                    description: `Rotear para ${targetNode.name}`
                  })
                }

                // Isso irá forçar o nodeForm a atualizar suas condições
                this.$refs.nodeForm.updateNodeConditions()

                // Extrair opções de resposta automaticamente após um pequeno atraso
                // para garantir que as condições foram processadas
                setTimeout(() => {
                  this.$refs.nodeForm.extrairOpcoesAutomaticamente()
                }, 100)
              }
            })

            // Adicionar animação de feedback visual na conexão
            const newConn = evt.connection
            newConn.addOverlay(['Label', {
              label: '<div class="connection-drop-effect">✓</div>',
              location: 0.5,
              cssClass: 'connection-success-label'
            }])

            // Remover o overlay após 1 segundo
            setTimeout(() => {
              if (newConn && newConn.getOverlay('connection-success-label')) {
                newConn.removeOverlay('connection-success-label')
              }
            }, 1000)

            // Marcar os endpoints conectados com uma classe CSS
            this.updateEndpointClasses()
          }
        })

        // Evento quando uma conexão é separada
        this.jsPlumb.bind('connectionDetached', (evt) => {
          this.deleteLine(evt.sourceId, evt.targetId)

          // Atualizar classes dos endpoints após desconexão
          this.$nextTick(() => {
            this.updateEndpointClasses()
          })
        })

        // Evento quando uma conexão é movida
        this.jsPlumb.bind('connectionMoved', (evt) => {
          this.changeLine(evt.originalSourceId, evt.originalTargetId)

          // Atualizar classes dos endpoints após mover conexão
          this.updateEndpointClasses()
        })

        // Quando começa a arrastar uma conexão
        this.jsPlumb.bind('connectionDrag', (connection) => {
          // Adicionar classe ao elemento de origem
          if (connection.source) {
            connection.source.classList.add('dragging-connection')
          }

          // Destacar todos os endpoints disponíveis como alvos
          document.querySelectorAll('.jtk-endpoint').forEach(ep => {
            const epInfo = this.jsPlumb.getEndpoint(ep.getAttribute('id'))
            if (epInfo && epInfo.isTarget) {
              ep.classList.add('highlight-target')
            }
          })
        })

        // Quando para de arrastar uma conexão
        this.jsPlumb.bind('connectionDragStop', (connection) => {
          // Remover classe do elemento de origem
          if (connection.source) {
            connection.source.classList.remove('dragging-connection')
          }

          // Remover destaque de todos os endpoints
          document.querySelectorAll('.highlight-target').forEach(ep => {
            ep.classList.remove('highlight-target')
          })

          // Atualizar classes dos endpoints após arrastar conexão
          this.updateEndpointClasses()
        })

        // Hover sobre conexões
        this.jsPlumb.bind('connectionMouseOver', (connection) => {
          if (connection.connector) {
            connection.connector.canvas.classList.add('jtk-hover')
          }
        })

        this.jsPlumb.bind('connectionMouseOut', (connection) => {
          if (connection.connector) {
            connection.connector.canvas.classList.remove('jtk-hover')
          }
        })

        // Eventos restantes
        this.jsPlumb.bind('contextmenu', (evt) => {
          console.log('contextmenu', evt)
        })

        this.jsPlumb.bind('beforeDrop', (evt) => {
          return this.jsPlumpConsist(evt)
        })

        this.jsPlumb.bind('beforeDetach', (conn) => {
          // Perguntar antes de desconectar
          return this.$q.dialog({
            title: 'Confirmar desconexão',
            message: 'Deseja realmente remover esta conexão?',
            cancel: {
              label: 'Não',
              color: 'primary',
              push: true
            },
            ok: {
              label: 'Sim',
              color: 'negative',
              push: true
            },
            persistent: true
          }).onOk(() => {
            return true
          }).onCancel(() => {
            return false
          }).onDismiss(() => {
            return false
          })
        })

        this.jsPlumb.setContainer(this.$refs.efContainer)
      })
    },

    loadEasyFlow () {
      // Primeiro limpar quaisquer endpoints existentes
      if (this.jsPlumb && this.data.nodeList) {
        this.data.nodeList.forEach(node => {
          this.jsPlumb.removeAllEndpoints(node.id)
        })
      }

      // Configurar os nós
      for (var i = 0; i < this.data.nodeList.length; i++) {
        const node = this.data.nodeList[i]
        // Configurar endpoint de origem (source)
        this.jsPlumb.makeSource(node.id, this.jsplumbSourceOptions)

        // Configurar endpoint de destino (target)
        this.jsPlumb.makeTarget(node.id, this.jsplumbTargetOptions)

        // Adicionar endpoints visíveis nos 4 lados do nó (só para nós que não sejam 'start' ou 'exception')
        if (!node.viewOnly && !['start', 'exception'].includes(node.type)) {
          // Endpoints de saída (prioritariamente na parte inferior)
          this.jsPlumb.addEndpoint(node.id, {
            anchor: 'Bottom',
            isSource: true,
            isTarget: false,
            maxConnections: -1,
            cssClass: 'jtk-source-endpoint primary-endpoint',
            hoverClass: 'jtk-source-endpoint-hover',
            dragAllowedWhenFull: true,
            connectorStyle: { stroke: '#8db1dd', strokeWidth: 3 },
            connectorHoverStyle: { stroke: '#2e6da4', strokeWidth: 4 },
            endpoint: ['Dot', { radius: 6 }],
            connector: ['Bezier', {
              curviness: 70
            }]
          })

          // Adicionar apenas mais um endpoint de saída à direita para casos especiais
          this.jsPlumb.addEndpoint(node.id, {
            anchor: 'Right',
            isSource: true,
            isTarget: false,
            maxConnections: -1,
            cssClass: 'jtk-source-endpoint secondary-endpoint',
            hoverClass: 'jtk-source-endpoint-hover',
            dragAllowedWhenFull: true,
            connectorStyle: { stroke: '#8db1dd', strokeWidth: 3 },
            connectorHoverStyle: { stroke: '#2e6da4', strokeWidth: 4 },
            endpoint: ['Dot', { radius: 6 }],
            connector: ['Bezier', {
              curviness: 70
            }]
          })

          // Endpoints de entrada (prioritariamente na parte superior)
          this.jsPlumb.addEndpoint(node.id, {
            anchor: 'Top',
            isTarget: true,
            isSource: false,
            maxConnections: -1,
            cssClass: 'jtk-target-endpoint',
            hoverClass: 'jtk-target-endpoint-hover',
            dropOptions: { hoverClass: 'ef-drop-hover' },
            endpoint: ['Dot', { radius: 6 }]
          })

          // Adicionar apenas mais um endpoint de entrada à esquerda para casos especiais
          this.jsPlumb.addEndpoint(node.id, {
            anchor: 'Left',
            isTarget: true,
            isSource: false,
            maxConnections: -1,
            cssClass: 'jtk-target-endpoint',
            hoverClass: 'jtk-target-endpoint-hover',
            dropOptions: { hoverClass: 'ef-drop-hover' },
            endpoint: ['Dot', { radius: 6 }]
          })
        } else if (node.type === 'start') {
          // Para nós do tipo 'start', adicionar apenas endpoints de saída (inferior e direita)
          this.jsPlumb.addEndpoint(node.id, {
            anchor: 'Bottom',
            isSource: true,
            isTarget: false,
            maxConnections: -1,
            cssClass: 'jtk-source-endpoint node-color-start primary-endpoint',
            hoverClass: 'jtk-source-endpoint-hover',
            dragAllowedWhenFull: true,
            connectorStyle: { stroke: '#8db1dd', strokeWidth: 3 },
            connectorHoverStyle: { stroke: '#2e6da4', strokeWidth: 4 },
            endpoint: ['Dot', { radius: 6 }]
          })

          this.jsPlumb.addEndpoint(node.id, {
            anchor: 'Right',
            isSource: true,
            isTarget: false,
            maxConnections: -1,
            cssClass: 'jtk-source-endpoint node-color-start secondary-endpoint',
            hoverClass: 'jtk-source-endpoint-hover',
            dragAllowedWhenFull: true,
            connectorStyle: { stroke: '#8db1dd', strokeWidth: 3 },
            connectorHoverStyle: { stroke: '#2e6da4', strokeWidth: 4 },
            endpoint: ['Dot', { radius: 6 }]
          })
        } else if (node.type === 'exception') {
          // Para nós do tipo 'exception', adicionar apenas endpoints de entrada (esquerda e superior)
          this.jsPlumb.addEndpoint(node.id, {
            anchor: 'Left',
            isTarget: true,
            isSource: false,
            maxConnections: -1,
            cssClass: 'jtk-target-endpoint node-color-exception',
            hoverClass: 'jtk-target-endpoint-hover',
            dropOptions: { hoverClass: 'ef-drop-hover' },
            endpoint: ['Dot', { radius: 6 }]
          })

          this.jsPlumb.addEndpoint(node.id, {
            anchor: 'Top',
            isTarget: true,
            isSource: false,
            maxConnections: -1,
            cssClass: 'jtk-target-endpoint node-color-exception',
            hoverClass: 'jtk-target-endpoint-hover',
            dropOptions: { hoverClass: 'ef-drop-hover' },
            endpoint: ['Dot', { radius: 6 }]
          })
        }

        // Aplicar draggable a todos os nós, incluindo start e configurations
        this.jsPlumb.draggable(node.id, {
          containment: 'parent',
          stop: (el) => {
            console.log('arraste para o final: ', el)
            // Salvar a nova posição do nó no modelo de dados
            this.changeNodeSite({
              id: node.id,
              left: el.el.style.left,
              top: el.el.style.top
            })
            // Reorganizar automaticamente as conexões após mover um nó
            this.optimizeConnections(node.id)
          }
        })
      }

      // Criar um Map para rastrear conexões únicas
      const connectionMap = new Map()

      // Processar a lista de linhas para remover duplicatas
      const uniqueLines = this.data.lineList.reduce((acc, line) => {
        const key = `${line.from}-${line.to}`
        if (!connectionMap.has(key)) {
          connectionMap.set(key, line)
          acc.push(line)
        }
        return acc
      }, [])

      // Carregar conexões únicas
      uniqueLines.forEach(line => {
        var connParam = {
          source: line.from,
          target: line.to,
          connector: line.connector ? line.connector : ['Bezier', { curviness: 70 }],
          paintStyle: { strokeWidth: 3, stroke: '#8db1dd' },
          overlays: [
            ['Label', {
              label: line.label || '',
              cssClass: 'connection-label editable-label',
              location: 0.5
            }]
          ]
        }
        this.jsPlumb.connect(connParam, this.jsplumbConnectOptions)
      })

      // Marcar os endpoints conectados após carregar todas as conexões
      this.$nextTick(() => {
        // Otimizar todas as conexões após o carregamento inicial
        this.data.nodeList.forEach(node => {
          this.optimizeConnections(node.id)
        })

        this.updateEndpointClasses()
        this.loadEasyFlowFinish = true

        // Repintar tudo após as otimizações
        this.jsPlumb.repaintEverything()
      })
    },

    // Método para atualizar as classes CSS dos endpoints baseado nas conexões
    updateEndpointClasses () {
      // Obter todas as bolinhas (endpoints) e remover classes conectadas
      document.querySelectorAll('.jtk-endpoint').forEach(ep => {
        // Remover a classe de endpoint conectado para iniciar todas como cinza
        ep.classList.remove('jtk-endpoint-connected')

        // Remover quaisquer classes específicas de cor de nó
        ep.classList.remove('node-color-default')
        ep.classList.remove('node-color-exception')
        ep.classList.remove('node-color-start')
      })

      // Obter todas as conexões
      const connections = this.jsPlumb.getAllConnections()

      // Para cada conexão, marcar seus endpoints como conectados
      connections.forEach(conn => {
        if (conn.endpoints && conn.endpoints.length > 0) {
          // Marcar o endpoint de origem (source) como conectado
          if (conn.endpoints[0] && conn.endpoints[0].canvas) {
            conn.endpoints[0].canvas.classList.add('jtk-endpoint-connected')
          }

          // Marcar o endpoint de destino (target) como conectado
          if (conn.endpoints[1] && conn.endpoints[1].canvas) {
            conn.endpoints[1].canvas.classList.add('jtk-endpoint-connected')
          }
        }
      })

      // Repintar para aplicar as alterações visuais
      if (this.loadEasyFlowFinish) {
        this.jsPlumb.repaintEverything()
      }
    },

    setLineLabel (from, to, label) {
      // Obter a conexão entre os nós
      var conn = this.jsPlumb.getConnections({
        source: from,
        target: to
      })[0]

      if (!conn) {
        console.error('Conexão não encontrada:', from, to)
        return
      }

      // Atualizar a aparência da conexão baseado no label
      if (!label || label === '') {
        conn.removeClass('flowLabel')
        conn.addClass('emptyFlowLabel')
      } else {
        conn.addClass('flowLabel')
        conn.removeClass('emptyFlowLabel')
      }

      // Definir o label com a classe para estilização
      conn.setLabel({
        label: label,
        cssClass: 'connection-label editable-label',
        location: 0.5
      })

      // Atualizar o estilo da conexão
      conn.setPaintStyle({ strokeWidth: 3, stroke: '#8db1dd' })

      // Atualizar a lista de linhas do modelo de dados
      let lineUpdated = false
      this.data.lineList.forEach(function (line) {
        if (line.from == from && line.to == to) {
          line.label = label
          lineUpdated = true
        }
      })

      // Se a linha não existir na lista, adicionar
      if (!lineUpdated) {
        this.data.lineList.push({
          from: from,
          to: to,
          label: label
        })
      }

      // Atualizar também a condição correspondente no nó de origem
      const sourceNode = this.data.nodeList.find(node => node.id === from)
      if (sourceNode && sourceNode.conditions) {
        sourceNode.conditions.forEach(condition => {
          const targetNodeId = condition.nextNode || condition.nextStepId
          if (targetNodeId === to) {
            condition.description = label
          }
        })
      }
    },

    deleteElement () {
      if (this.activeElement.type === 'node') {
        // Verificar se é um nó protegido (start ou configurations)
        const node = this.data.nodeList.find(n => n.id === this.activeElement.id)
        if (node && ['start', 'configurations'].includes(node.type)) {
          this.$q.notify({
            type: 'warning',
            message: 'Este nó não pode ser excluído',
            position: 'top',
            timeout: 2000
          })
          return
        }

        this.deleteNode(this.activeElement)
      } else if (this.activeElement.type === 'line') {
        this.$q.dialog({
          title: 'Atenção!!',
          message: 'Deseja realmente deletar a linha selecionada?',
          cancel: {
            label: 'Não',
            color: 'primary',
            push: true
          },
          ok: {
            label: 'Sim',
            color: 'negative',
            push: true
          },
          persistent: true
        }).onOk(async () => {
          var conn = this.jsPlumb.getConnections({
            source: this.activeElement.sourceId,
            target: this.activeElement.targetId
          })[0]
          this.jsPlumb.deleteConnection(conn)
        })
      }
    },

    deleteLine (sourceId, targetId) {
      // Obter todas as conexões do JSPlumb
      const connections = this.jsPlumb.getAllConnections()

      // Identificar e remover a conexão entre os nós específicos
      connections.forEach(conn => {
        if (conn.sourceId === sourceId && conn.targetId === targetId) {
          this.jsPlumb.deleteConnection(conn)
        }
      })

      // Remover as condições associadas à conexão
      const sourceNode = this.data.nodeList.find(node => node.id === sourceId)
      if (sourceNode && sourceNode.conditions) {
        // Filtrar as condições, removendo aquelas que apontam para o nó de destino
        sourceNode.conditions = sourceNode.conditions.filter(condition =>
          condition.nextNode !== targetId && condition.nextStepId !== targetId
        )
      }

      // Atualizar a interface do nodeForm se o nó atual for o nó de origem
      if (this.$refs.nodeForm && this.activeElement.id === sourceId) {
        this.$refs.nodeForm.updateNodeConditions()
      }
    },

    changeLine (oldFrom, oldTo) {
      this.deleteLine(oldFrom, oldTo)
    },

    changeNodeSite (data) {
      for (var i = 0; i < this.data.nodeList.length; i++) {
        const node = this.data.nodeList[i]
        if (node.id === data.id) {
          node.left = data.left
          node.top = data.top
        }
      }
    },

    addNode (evt, nodeMenu, mousePosition) {
      var screenX = evt.originalEvent.clientX, screenY = evt.originalEvent.clientY
      const efContainer = this.$refs.efContainer
      var containerRect = efContainer.getBoundingClientRect()
      var left = screenX, top = screenY
      if (left < containerRect.x || left > containerRect.width + containerRect.x || top < containerRect.y || containerRect.y > containerRect.y + containerRect.height) {
        this.$notificarErro('Arraste o elemento para a tela.')
        return
      }
      left = left - containerRect.x + efContainer.scrollLeft
      top = top - containerRect.y + efContainer.scrollTop
      left -= 85
      top -= 16
      var nodeId = this.getUUID()
      var origName = nodeMenu.name
      var nodeName = origName
      var index = 1
      while (index < 10000) {
        var repeat = false
        for (var i = 0; i < this.data.nodeList.length; i++) {
          const node = this.data.nodeList[i]
          if (node.name === nodeName) {
            nodeName = origName + index
            repeat = true
          }
        }
        if (repeat) {
          index++
          continue
        }
        break
      }
      var node = {
        id: nodeId,
        name: nodeName,
        type: nodeMenu.type,
        left: left + 'px',
        top: top + 'px',
        ico: nodeMenu.ico,
        state: 'success',
        actions: nodeMenu?.actions,
        conditions: nodeMenu?.conditions,
        interactions: nodeMenu?.interactions
      }
      this.data.nodeList.push(node)
      this.$nextTick(function () {
        this.jsPlumb.makeSource(nodeId, this.jsplumbSourceOptions)
        this.jsPlumb.makeTarget(nodeId, this.jsplumbTargetOptions)
        this.jsPlumb.draggable(nodeId, {
          containment: 'parent',
          stop: function (el) {
            console.log('arastado para o final: ', el)
          }
        })
      })
    },

    deleteNode (node) {
      // Verificar se é um nó protegido (start ou configurations)
      if (node && ['start', 'configurations'].includes(node.type)) {
        this.$q.notify({
          type: 'warning',
          message: 'Este nó não pode ser excluído',
          position: 'top',
          timeout: 2000
        })
        return false
      }

      this.$q.dialog({
        title: 'Atenção!!',
        message: `Deseja realmente deletar o elemento (${node.name})?`,
        cancel: {
          label: 'Não',
          color: 'primary',
          push: true
        },
        ok: {
          label: 'Sim',
          color: 'negative',
          push: true
        },
        persistent: true
      }).onOk(async () => {
        this.data.nodeList = this.data.nodeList.filter(n => n.id !== node.id)
        this.$nextTick(function () {
          this.jsPlumb.removeAllEndpoints(node.id)
        })
      })

      return true
    },

    clickNode (nodeId) {
      const node = this.data.nodeList.find(n => n.id === nodeId)
      this.activeElement = node
      this.$refs.nodeForm.nodeInit(this.data, nodeId)

      // Se o nó não for do tipo start ou exception, ativar a aba de condições
      if (node && !['start', 'exception'].includes(node.type)) {
        this.$nextTick(() => {
          this.$refs.nodeForm.activateSection('conditions')
        })
      }
    },

    hasLine (from, to) {
      for (var i = 0; i < this.data.lineList.length; i++) {
        var line = this.data.lineList[i]
        if (line.from === from && line.to === to) {
          return true
        }
      }
      return false
    },
    hashOppositeLine (from, to) {
      return this.hasLine(to, from)
    },
    nodeRightMenu (nodeId, evt) {
      // Se a ação for delete, remover o nó diretamente
      if (evt.action === 'delete') {
        const node = this.data.nodeList.find(n => n.id === nodeId)
        if (node) {
          this.deleteNode(node)
        }
        return
      }

      // Comportamento original para clique com botão direito
      this.menu.show = true
      this.menu.curNodeId = nodeId
      this.menu.left = evt.x + 'px'
      this.menu.top = evt.y + 'px'
    },
    repaintEverything () {
      this.jsPlumb.repaint()
    },
    dataInfo () {
      this.flowInfoVisible = true
      this.$nextTick(function () {
        this.$refs.flowInfo.init()
      })
    },
    dataReload (data) {
      this.easyFlowVisible = false
      this.data.nodeList = []
      this.data.lineList = []
      this.$nextTick(() => {
        data = cloneDeep(data)
        this.easyFlowVisible = true
        this.data = data
        this.$nextTick(() => {
          // eslint-disable-next-line no-undef
          this.jsPlumb = jsPlumb.getInstance()
          this.$nextTick(() => {
            this.jsPlumbInit()
          })
        })
      })
    },
    zoomAdd () {
      if (this.zoom >= 1) {
        return
      }
      this.zoom = this.zoom + 0.1
      this.$refs.efContainer.style.transform = `scale(${this.zoom})`
      this.jsPlumb.setZoom(this.zoom)
    },
    zoomSub () {
      if (this.zoom <= 0) {
        return
      }
      this.zoom = this.zoom - 0.1
      this.$refs.efContainer.style.transform = `scale(${this.zoom})`
      this.jsPlumb.setZoom(this.zoom)
    },
    downloadData () {
      this.$q.dialog({
        title: 'Oi!!',
        message: 'Confirma o download?',
        cancel: {
          label: 'Não',
          color: 'primary',
          push: true
        },
        ok: {
          label: 'Sim',
          color: 'negative',
          push: true
        },
        persistent: true
      }).onOk(async () => {
        var datastr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.data, null, '\t'))
        var downloadAnchorNode = document.createElement('a')
        downloadAnchorNode.setAttribute('href', datastr)
        downloadAnchorNode.setAttribute('download', 'data.json')
        downloadAnchorNode.click()
        downloadAnchorNode.remove()
        this.$notificarSucesso('Baixando, por favor aguarde...')
      })
    },
    openHelp () {
      this.flowHelpVisible = true
      this.$nextTick(function () {
        this.$refs.flowHelp.init()
      })
    },
    autoOrganizeNodes (layout) {
      if (!this.data.nodeList || this.data.nodeList.length < 2) {
        this.$notificarErro('Não há nós suficientes para organizar.')
        return
      }

      // Define mensagem personalizada para cada layout
      let layoutName = ''
      switch (layout) {
        case 'hubRadial':
          layoutName = 'Layout Hub Radial'
          break
        case 'tree':
          layoutName = 'Layout em árvore'
          break
        case 'level':
          layoutName = 'Layout em níveis'
          break
        case 'circle':
          layoutName = 'Layout circular'
          break
        case 'grid':
          layoutName = 'Layout em grade'
          break
        default:
          layoutName = 'Layout automático'
      }

      // Mostra um aviso de processamento
      this.$q.notify({
        type: 'ongoing',
        message: `Aplicando ${layoutName}, aguarde...`,
        timeout: 1000
      })

      // Aplica o algoritmo para reorganizar os nós
      try {
        // Clona os dados para não afetar o original caso haja erro
        const clonedData = cloneDeep(this.data)

        // Tenta aplicar o layout solicitado
        const organizedData = ForceDirected(clonedData, layout)

        // Atualiza as posições dos nós
        this.data.nodeList.forEach((node, index) => {
          if (organizedData.nodeList[index]) {
            node.left = organizedData.nodeList[index].left
            node.top = organizedData.nodeList[index].top
          }
        })

        // Redesenha as conexões e otimiza todas elas
        this.$nextTick(() => {
          this.optimizeAllConnections()
          this.$notificarSucesso(`${layoutName} aplicado com sucesso!`)
        })
      } catch (error) {
        console.error(`Erro ao aplicar ${layoutName}:`, error)

        // Notifica o usuário sobre o erro
        this.$q.notify({
          type: 'warning',
          message: `Não foi possível aplicar ${layoutName}. Tentando Layout em grade...`,
          position: 'top',
          timeout: 2000
        })

        // Tenta aplicar o layout de grade como fallback
        if (layout !== 'grid') {
          setTimeout(() => {
            this.autoOrganizeNodes('grid')
          }, 500)
        } else {
          this.$notificarErro('Não foi possível organizar os nós. Tente mover manualmente.')
        }
      }
    },
    updateNodeName (data) {
      const node = this.data.nodeList.find(n => n.id === data.id)
      if (node) {
        node.name = data.name
        // Notificar o usuário sobre a alteração
        this.$notificarSucesso('Nome atualizado com sucesso!')

        // Repintar as conexões para atualizar qualquer label que possa conter o nome do nó
        this.$nextTick(() => {
          this.jsPlumb.repaintEverything()
        })
      }
    },
    // Método para lidar com ações diretas nos nós
    handleNodeAction (action) {
      // Primeiro, selecionar o nó para que o painel lateral seja atualizado
      this.clickNode(action.nodeId)

      // Em seguida, enviar a ação para o nodeForm
      this.$nextTick(() => {
        // Selecionar a aba/seção apropriada no formulário de nó
        if (this.$refs.nodeForm) {
          // Ativar a seção apropriada com base no tipo de ação
          switch (action.actionType) {
            case 'message':
              this.$refs.nodeForm.activateSection('messages')
              break
            case 'flow':
              this.$refs.nodeForm.activateSection('flow')
              break
            case 'condition':
              this.$refs.nodeForm.activateSection('conditions')
              break
            case 'advanced':
              this.$refs.nodeForm.activateSection('advanced')
              break
            default:
              // Configuração padrão
              break
          }
        }
      })
    },
    togglePanel () {
      this.isPanelVisible = !this.isPanelVisible
      this.$nextTick(() => {
        this.jsPlumb.repaintEverything()
      })
    },
    // Método para otimizar as conexões de um nó após movê-lo
    optimizeConnections (nodeId) {
      // Obter todas as conexões deste nó
      const connections = this.jsPlumb.getConnections({
        source: nodeId
      }).concat(this.jsPlumb.getConnections({
        target: nodeId
      }))

      // Para cada conexão, recalcular o roteamento
      connections.forEach(conn => {
        // Obter posições absolutas dos nós
        const sourcePos = this.jsPlumb.getOffset(conn.sourceId)
        const targetPos = this.jsPlumb.getOffset(conn.targetId)

        // Calcular os vetores direcionais entre os nós
        const dx = targetPos.left - sourcePos.left
        const dy = targetPos.top - sourcePos.top

        // Calcular distâncias absolutas para comparação
        const absDx = Math.abs(dx)
        const absDy = Math.abs(dy)

        // Calcular o ângulo entre os nós (em graus)
        // Math.atan2 retorna o ângulo em radianos
        const angle = Math.atan2(dy, dx) * 180 / Math.PI

        let sourceAnchor, targetAnchor

        // Verificar primeiro se há uma diferença vertical significativa
        // Priorizar conexões verticais quando o nó está claramente acima ou abaixo
        if (absDy > absDx * 0.8) {
          // Conexão vertical predominante
          if (dy > 0) {
            // Target está abaixo
            sourceAnchor = 'Bottom'
            targetAnchor = 'Top'
          } else {
            // Target está acima
            sourceAnchor = 'Top'
            targetAnchor = 'Bottom'
          }
        } else {
          if (angle > -45 && angle <= 45) {
            // Target está à direita
            sourceAnchor = 'Right'
            targetAnchor = 'Left'
          } else if (angle > 45 && angle <= 135) {
            // Target está abaixo
            sourceAnchor = 'Bottom'
            targetAnchor = 'Top'
          } else if ((angle > 135 && angle <= 180) || (angle <= -135 && angle >= -180)) {
            // Target está à esquerda
            sourceAnchor = 'Left'
            targetAnchor = 'Right'
          } else if (angle > -135 && angle <= -45) {
            // Target está acima
            sourceAnchor = 'Top'
            targetAnchor = 'Bottom'
          }
        }

        // Aplicar novas âncoras - MANTER BEZIER
        conn.setConnector(['Bezier', {
          curviness: 70
        }])

        // Tentar aplicar novas âncoras
        try {
          conn.endpoints[0].setAnchor(sourceAnchor)
          conn.endpoints[1].setAnchor(targetAnchor)
        } catch (e) {
          console.log('Erro ao ajustar âncoras:', e)
        }
      })

      // Repintar tudo após as mudanças
      this.jsPlumb.repaintEverything()
    },
    // Método para otimizar todas as conexões do fluxo
    optimizeAllConnections () {
      // Primeiro, otimizar as conexões de cada nó
      this.data.nodeList.forEach(node => {
        this.optimizeConnections(node.id)
      })

      // Repintar tudo após as otimizações
      this.jsPlumb.repaintEverything()
    },
    // Método para restaurar todas as conexões para o estilo Bezier
    resetAllConnectionsToBezier () {
      // Obter todas as conexões
      const connections = this.jsPlumb.getAllConnections()

      // Para cada conexão, definir o conector para Bezier
      connections.forEach(conn => {
        conn.setConnector(['Bezier', {
          curviness: 70
        }])
      })

      // Otimizar todas as conexões após resetar o estilo
      this.optimizeAllConnections()
    },
    saveNode (node) {
      // Encontrar o nó no nodeList e atualizar
      const nodeIndex = this.data.nodeList.findIndex(n => n.id === node.id)
      if (nodeIndex !== -1) {
        // Atualizar o nó mantendo a referência
        Object.assign(this.data.nodeList[nodeIndex], node)

        // Notificar sucesso
        this.$q.notify({
          type: 'positive',
          message: 'Interações salvas com sucesso!',
          position: 'top',
          timeout: 2000
        })

        // Repintar o diagrama
        this.$nextTick(() => {
          this.repaintEverything()
        })
      }
    },
    openNodeEditor (nodeId) {
      // Garante que o painel está visível
      this.isPanelVisible = true

      // Seleciona o nó e atualiza o activeElement
      this.clickNode(nodeId)

      // Se o nodeForm tiver um método para focar no campo de nome, podemos chamá-lo
      this.$nextTick(() => {
        // Ativa a primeira aba do formulário (interações)
        if (this.$refs.nodeForm && this.$refs.nodeForm.activateSection) {
          this.$refs.nodeForm.activateSection('interacoes')
        }
      })
    },
    updateLineLabelRealtime (from, to, label) {
      // Versão simplificada do setLineLabel para atualizações em tempo real
      var conn = this.jsPlumb.getConnections({
        source: from,
        target: to
      })[0]

      if (!conn) return

      conn.setLabel({
        label: label,
        cssClass: 'connection-label editable-label',
        location: 0.5
      })
    },
    addNodeFromButton (type) {
      // Criar um nó no mesmo formato que é criado pelo menu lateral (método addNode em node_form.vue)
      const nodeMenu = {
        id: this.getUUID(),
        nodeId: this.getUUID(),
        name: 'Nova etapa',
        type: 'node',
        ico: undefined,
        interactions: [],
        conditions: [],
        actions: []
      }

      // Obter a área visível do container
      const efContainer = this.$refs.efContainer
      const containerRect = efContainer.getBoundingClientRect()

      // Criar um evento simulado no centro da tela
      const simulatedEvent = {
        originalEvent: {
          clientX: containerRect.x + containerRect.width / 2,
          clientY: containerRect.y + containerRect.height / 2
        }
      }

      // Chamar o método addNode com o evento simulado e o tipo de nó
      this.addNode(simulatedEvent, nodeMenu)

      // Mostrar uma notificação de sucesso
      this.$q.notify({
        type: 'positive',
        message: `Novo nó "${nodeMenu.name}" adicionado com sucesso`,
        position: 'top',
        timeout: 2000
      })

      // Ativar o painel lateral para editar o novo nó
      this.isPanelVisible = true
    },
    // Método chamado quando uma conexão é estabelecida
    onConnect (info) {
      // Para as condições, precisamos dos IDs dos nós de origem e destino
      const sourceId = info.sourceId
      const targetId = info.targetId

      // Otimizar âncoras com base na posição relativa dos nós
      try {
        // Obter posições absolutas dos nós
        const sourcePos = this.jsPlumb.getOffset(sourceId)
        const targetPos = this.jsPlumb.getOffset(targetId)

        // Calcular os vetores direcionais entre os nós
        const dx = targetPos.left - sourcePos.left
        const dy = targetPos.top - sourcePos.top

        // Calcular distâncias absolutas para comparação
        const absDx = Math.abs(dx)
        const absDy = Math.abs(dy)

        // Calcular o ângulo entre os nós (em graus)
        const angle = Math.atan2(dy, dx) * 180 / Math.PI

        let sourceAnchor, targetAnchor

        // Verificar primeiro se há uma diferença vertical significativa
        // Priorizar conexões verticais quando o nó está claramente acima ou abaixo
        if (absDy > absDx * 0.8) {
          // Conexão vertical predominante
          if (dy > 0) {
            // Target está abaixo
            sourceAnchor = 'Bottom'
            targetAnchor = 'Top'
          } else {
            // Target está acima
            sourceAnchor = 'Top'
            targetAnchor = 'Bottom'
          }
        } else {
          if (angle > -45 && angle <= 45) {
            // Target está à direita
            sourceAnchor = 'Right'
            targetAnchor = 'Left'
          } else if (angle > 45 && angle <= 135) {
            // Target está abaixo
            sourceAnchor = 'Bottom'
            targetAnchor = 'Top'
          } else if ((angle > 135 && angle <= 180) || (angle <= -135 && angle >= -180)) {
            // Target está à esquerda
            sourceAnchor = 'Left'
            targetAnchor = 'Right'
          } else if (angle > -135 && angle <= -45) {
            // Target está acima
            sourceAnchor = 'Top'
            targetAnchor = 'Bottom'
          }
        }

        // Aplicar âncoras otimizadas
        info.connection.endpoints[0].setAnchor(sourceAnchor)
        info.connection.endpoints[1].setAnchor(targetAnchor)
      } catch (e) {
        console.log('Erro ao otimizar âncoras da nova conexão:', e)
      }

      // Encontrar o nó de origem para adicionar condições
      const sourceNode = this.data.nodeList.find(node => node.id === sourceId)
      const targetNode = this.data.nodeList.find(node => node.id === targetId)

      // Se não encontramos o nó de origem, não podemos continuar
      if (!sourceNode || !targetNode) {
        console.error('Nó não encontrado para criar condição', { sourceId, targetId })
        return
      }

      // Iniciamos o array de condições se não existir
      if (!sourceNode.conditions) {
        sourceNode.conditions = []
      }

      // Verificar se já existe uma condição para este destino
      const existingCondition = sourceNode.conditions.find(cond => cond.target === targetId)

      // Se não existe, criamos uma nova condição para este destino
      if (!existingCondition) {
        sourceNode.conditions.push({
          id: this.getUUID(),
          nodeId: targetId,
          target: targetId,
          value: targetNode.name,
          details: '',
          type: 'Equals'
        })

        // Notificar o usuário
        this.$q.notify({
          message: `Condição para "${targetNode.name}" adicionada`,
          position: 'top',
          timeout: 2000
        })
      }

      // Forçar o node_form a atualizar as condições
      this.$nextTick(() => {
        if (this.$refs.nodeForm) {
          this.$refs.nodeForm.updateNodeConditions()

          // Adicionar um timeout para garantir que a extração de opções
          // seja executada depois que as condições forem atualizadas
          setTimeout(() => {
            if (this.$refs.nodeForm) {
              this.$refs.nodeForm.extrairOpcoesAutomaticamente()
            }
          }, 100)
        }
      })
    },
    // Método separado para organizar o fluxo em árvore
    organizarFluxo () {
      this.$q.dialog({
        title: 'Organizar fluxo',
        message: 'Deseja organizar automaticamente os nós em formato de árvore vertical?',
        cancel: {
          label: 'NÃO',
          flat: true
        },
        ok: {
          label: 'SIM',
          flat: true
        },
        persistent: true
      }).onOk(() => {
        this.autoOrganizeNodes('tree')
      })
    }
  },
  mounted () {
    // eslint-disable-next-line no-undef
    this.jsPlumb = jsPlumb.getInstance()
    this.$nextTick(() => {
      this.dataReload(this.cDataFlow.flow.flow)
    })
  }
}
</script>
