<template>
  <div
    ref="node"
    :style="nodeContainerStyle"
    @click="clickNode"
    @mouseup="changeNodeSite"
    :class="nodeContainerClass"
    class="nodeStyle text-body1"
  >
    <q-tooltip>
      {{ node.name }}
    </q-tooltip>

    <!-- Botão de exclusão de nó que aparece ao passar o mouse -->
    <div
      v-if="!['start', 'configurations'].includes(node.type)"
      class="node-delete-btn"
      @click.stop="deleteNode"
      title="Remover nó"
    >
      <q-tooltip>Excluir nó</q-tooltip>
      <i class="mdi mdi-close"></i>
    </div>

    <!-- Botão de edição que aparece ao passar o mouse -->
    <div
      v-if="!['start', 'configurations'].includes(node.type)"
      class="node-edit-btn"
      @click.stop="startEditing"
      title="Editar nome"
    >
      <q-tooltip>Editar nome</q-tooltip>
      <i class="mdi mdi-pencil"></i>
    </div>

    <!-- Botão para abrir o editor lateral -->
    <div
      class="node-config-btn"
      @click.stop="openNodeEditor"
      title="Abrir editor"
    >
      <q-tooltip>Abrir editor</q-tooltip>
      <i class="mdi mdi-cog"></i>
    </div>

    <div
      class="ef-node-text q-pa-sm"
      :title="node.name"
      @dblclick.stop="!['start', 'configurations'].includes(node.type) && startEditing()"
    >
      <q-tooltip>
        <span v-if="!['start', 'configurations'].includes(node.type)">Duplo clique para editar o nome</span>
        <span v-else>Este nó não pode ser editado</span>
      </q-tooltip>
      <q-icon
        size="20px"
        :name="node.ico"
        :class="nodeIcoClass"
        class="absolute-top-left q-pa-xs"
      />

      <!-- Campo editável para o nome do nó -->
      <div v-if="!isEditing" class="text-truncate node-name">{{node.name}}</div>
      <input
        v-else
        ref="nameInput"
        type="text"
        v-model="editingName"
        class="node-name-input"
        @blur="saveNodeName"
        @keyup.enter="saveNodeName"
        @keyup.esc="cancelEditing"
        @click.stop
      />
    </div>
    <div class="ef-node-right-ico">
      <i
        class="el-icon-circle-check el-node-state-success"
        v-show="node.state === 'success'"
      ></i>
      <i
        class="el-icon-circle-close el-node-state-error"
        v-show="node.state === 'error'"
      ></i>
      <i
        class="el-icon-warning-outline el-node-state-warning"
        v-show="node.state === 'warning'"
      ></i>
      <i
        class="el-icon-loading el-node-state-running"
        v-show="node.state === 'running'"
      ></i>
    </div>

  </div>
</template>

<script>
export default {
  props: {
    node: Object,
    activeElement: Object
  },

  data () {
    return {
      expanded: true,
      isEditing: false,
      editingName: ''
    }
  },
  computed: {
    nodeContainerClass () {
      return {
        'ef-node-container': true,
        'border-left-exception': this.node.type === 'exception',
        'node-color-default': !['start', 'exception'].includes(this.node.type),
        'node-color-exception': this.node.type === 'exception',
        'node-color-start': this.node.type === 'start',
        'ef-node-active shadow-8 bg-blue-3 text-white': this.activeElement.type !== 'line' ? this.activeElement.id === this.node.id : false
      }
    },
    nodeContainerStyle () {
      return {
        top: this.node.top,
        left: this.node.left,
        ...this.node.style
      }
    },
    nodeIcoClass () {
      var nodeIcoClass = {}
      nodeIcoClass[this.node.ico] = true
      nodeIcoClass['flow-node-drag'] = !this.node.viewOnly
      return nodeIcoClass
    }
  },
  methods: {
    clickNode () {
      if (!this.isEditing) {
        this.$emit('clickNode', this.node.id)
      }
    },
    changeNodeSite () {
      if (this.node.left == this.$refs.node.style.left && this.node.top == this.$refs.node.style.top) {
        return
      }
      this.$emit('changeNodeSite', {
        id: this.node.id,
        left: this.$refs.node.style.left,
        top: this.$refs.node.style.top
      })
    },
    deleteNode (event) {
      // Confirmar exclusão com diálogo
      this.$q.dialog({
        title: 'Atenção!!',
        message: `Deseja realmente excluir o nó "${this.node.name}"?`,
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
        this.$emit('nodeRightMenu', this.node.id, {
          action: 'delete',
          x: event.clientX,
          y: event.clientY
        })
      })
    },
    // Métodos para edição in-place do nome do nó
    startEditing () {
      // Verificar se é um nó protegido
      if (['start', 'configurations'].includes(this.node.type)) {
        this.$q.notify({
          message: 'Este nó não pode ser editado',
          color: 'warning',
          icon: 'mdi-alert',
          position: 'top',
          timeout: 1000
        })
        return
      }
      
      this.isEditing = true
      this.editingName = this.node.name
      this.$nextTick(() => {
        this.$refs.nameInput.focus()
        this.$refs.nameInput.select()

        // Notificar que o modo de edição foi ativado
        this.$q.notify({
          message: 'Editando nome diretamente',
          color: 'info',
          icon: 'mdi-pencil',
          position: 'top',
          timeout: 1000
        })
      })
    },
    saveNodeName () {
      if (this.editingName && this.editingName.trim() !== '') {
        const oldName = this.node.name
        const newName = this.editingName.trim()

        // Verificar se o nome realmente mudou
        if (oldName !== newName) {
          // Emitir evento para atualizar o nome no componente pai
          this.$emit('updateNodeName', {
            id: this.node.id,
            name: newName
          })

          // Notificar sobre a alteração
          this.$q.notify({
            message: 'Nome atualizado com sucesso',
            color: 'positive',
            icon: 'mdi-check',
            position: 'top',
            timeout: 1000
          })
        }
      } else {
        // Se o campo estiver vazio, reverter para o nome original
        this.editingName = this.node.name

        // Notificar que o nome não foi alterado
        this.$q.notify({
          message: 'Nome não alterado (vazio)',
          color: 'warning',
          icon: 'mdi-alert',
          position: 'top',
          timeout: 1000
        })
      }
      this.isEditing = false
    },
    cancelEditing () {
      this.isEditing = false
      this.editingName = this.node.name
    },
    // Método para abrir o diálogo/configuração correspondente
    openDialog (type) {
      // Disparar evento para o componente pai lidar com a ação
      this.$emit('nodeAction', {
        nodeId: this.node.id,
        actionType: type
      })

      // Selecionar o nó também para manter a consistência
      this.$emit('clickNode', this.node.id)
    },
    // Método para abrir o editor do nó ao fazer duplo clique
    openNodeEditor () {
      // Primeiro seleciona o nó
      this.$emit('clickNode', this.node.id)

      // Notificar que o editor lateral será aberto
      this.$q.notify({
        message: 'Abrindo editor do nó',
        color: 'primary',
        icon: 'mdi-cog',
        position: 'top',
        timeout: 1000
      })

      // Emite um evento para que o painel abra o editor do nó
      this.$emit('openNodeEditor', this.node.id)
    }
  }
}
</script>

<style>
.nodeStyle {
  min-height: 80px !important;
  min-width: 160px !important;
  max-width: 220px !important;
  border-left: 5px solid #0288d1 !important;
  position: absolute !important;
  background-color: white !important;
  border: 1px solid #dcdfe6 !important;
  border-radius: 4px !important;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1) !important;
  z-index: 1;
}
.border-left-exception {
  border-left: 5px solid red !important;
}
.ef-node-active {
  transform: scale(1.1);
  z-index: 10 !important;
}
.ef-node-text {
  word-break: break-word;
  padding-left: 20px;
  padding-top: 5px;
  overflow: hidden;
  cursor: pointer;
  transition: background-color 0.2s;
}
.ef-node-text:hover .node-name {
  background-color: rgba(25, 118, 210, 0.1);
  border-radius: 4px;
  padding: 2px 4px;
}
.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Estilo para o botão de exclusão */
.node-delete-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 18px;
  height: 18px;
  background-color: #ff5252;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s, transform 0.2s;
  z-index: 5;
}

.nodeStyle:hover .node-delete-btn {
  opacity: 0.8;
}

.node-delete-btn:hover {
  opacity: 1 !important;
  transform: scale(1.2);
}

/* Estilo para o botão de edição */
.node-edit-btn {
  position: absolute;
  top: 4px;
  right: 28px;
  width: 18px;
  height: 18px;
  background-color: #1976D2;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s, transform 0.2s;
  z-index: 5;
}

.nodeStyle:hover .node-edit-btn {
  opacity: 0.8;
}

.node-edit-btn:hover {
  opacity: 1 !important;
  transform: scale(1.2);
}

/* Estilo para o campo de edição do nome */
.node-name-input {
  width: 100%;
  border: 1px solid #1976D2;
  border-radius: 3px;
  padding: 2px 5px;
  outline: none;
  font-size: 14px;
  background-color: white;
  color: #333;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.node-name {
  min-height: 24px;
  cursor: text;
  transition: background-color 0.2s;
  padding: 2px 4px;
  border-radius: 3px;
}

.node-name:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.node-name::after {
  content: "✏️";
  font-size: 10px;
  margin-left: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.node-name:hover::after {
  opacity: 1;
}
</style>

<style scoped>
.ef-node {
  position: absolute;
  min-width: 150px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.3s;
  z-index: 10;
  border-radius: 6px;
  border: 1px solid #ddd;
  overflow: hidden;
  background-color: #fff;
}

.ef-node:hover {
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.3);
  transform: translateY(-2px);
}

.ef-node-header {
  display: flex;
  align-items: center;
  padding: 5px 10px;
  border-bottom: 1px solid #eee;
}

.ef-node-content {
  min-height: 20px;
  padding: 5px 10px;
}

.ef-node-drag {
  cursor: move;
}

/* Realça as áreas onde os endpoints (bolinhas) serão colocados */
.node-color-default {
  /* Adiciona uma borda pontilhada nos lados para indicar onde as bolinhas vão aparecer */
  position: relative;
}

.node-color-default::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 2px dashed transparent;
  border-radius: 6px;
  pointer-events: none;
  transition: all 0.3s;
}

.node-color-default:hover::before {
  border-color: rgba(33, 150, 243, 0.3);
}

/* Estilos específicos para nós do tipo 'start' */
.node-color-start {
  background-color: #e8f5e9;
  border-color: #81c784;
}

.node-color-start .ef-node-header {
  background-color: #81c784;
  color: #1b5e20;
}

/* Estilos específicos para nós do tipo 'exception' */
.node-color-exception {
  background-color: #ffebee;
  border-color: #e57373;
}

.node-color-exception .ef-node-header {
  background-color: #e57373;
  color: #b71c1c;
}

/* Adiciona efeito de pulsação nos nós que podem receber conexões */
@keyframes pulse-border {
  0% {
    box-shadow: 0 0 0 0 rgba(33, 150, 243, 0.4);
  }
  70% {
    box-shadow: 0 0 0 5px rgba(33, 150, 243, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(33, 150, 243, 0);
  }
}

/* Cursor customizado quando estiver sobre a área onde pode conectar */
.ef-node:hover {
  cursor: pointer;
}

/* Estilo para o botão de configuração */
.node-config-btn {
  position: absolute;
  top: 4px;
  right: 52px;
  width: 18px;
  height: 18px;
  background-color: #009688;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s, transform 0.2s;
  z-index: 5;
}

.nodeStyle:hover .node-config-btn {
  opacity: 0.8;
}

.node-config-btn:hover {
  opacity: 1 !important;
  transform: scale(1.2);
}
</style>
