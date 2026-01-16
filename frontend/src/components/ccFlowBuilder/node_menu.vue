<template>
  <div
    class="flow-menu"
    ref="tool"
  >
    <div
      v-for="menu in menuList"
      :key="menu.id"
    >
      <span
        class="ef-node-pmenu"
        @click="menu.open = !menu.open"
      >
        <q-icon :name="menu.open ? 'mdi-menu-down' : 'mdi-menu-up'" />&nbsp;{{ menu.name }}
      </span>
      <ul
        v-show="menu.open"
        class="ef-node-menu-ul"
      >
        <draggable
          :list="menu.children"
          item-key="id"
          @end="end"
          @start="move"
          :clone="cloneNode"
          :group="{ name: 'flow', pull: 'clone', put: false }"
          :sort="false"
        >
          <template #item="{ element }">
            <li
              class="ef-node-menu-li"
              :type="element.type"
            >
              <q-icon :name="element.ico" /> {{ element.name }}
            </li>
          </template>
        </draggable>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import draggable from 'vuedraggable'

const emit = defineEmits(['addNode'])

const mousePosition = reactive({
  left: -1,
  top: -1
})

const menuList = ref([
  {
    id: '1',
    type: 'group',
    name: 'Inicial',
    ico: 'mdi-play',
    open: true,
    children: [
      {
        id: '11',
        type: 'timer',
        name: 'Acesso de dados',
        ico: 'mdi-clock-outline',
        style: {}
      },
      {
        id: '12',
        type: 'task',
        name: 'Chamada de interface',
        ico: 'mdi-speedometer-medium',
        style: {}
      }
    ]
  },
  {
    id: '2',
    type: 'group',
    name: 'Final',
    ico: 'mdi-pause',
    open: true,
    children: [
      {
        id: '21',
        type: 'end',
        name: 'Fim do processo',
        ico: 'mdi-arrow-right',
        style: {}
      },
      {
        id: '22',
        type: 'over',
        name: 'Limpeza de dados',
        ico: 'mdi-close',
        style: {}
      }
    ]
  }
])

const nodeMenu = ref({})

const isFirefox = () => {
  return navigator.userAgent.indexOf('Firefox') > -1
}

onMounted(() => {
  if (isFirefox()) {
    document.body.ondrop = function (event) {
      mousePosition.left = event.layerX
      mousePosition.top = event.clientY - 50
      event.preventDefault()
      event.stopPropagation()
    }
  }
})

const getMenuByType = type => {
  for (const group of menuList.value) {
    const found = group.children.find(c => c.type === type)
    if (found) return found
  }
}

const move = evt => {
  const type = evt.item.getAttribute('type')
  nodeMenu.value = getMenuByType(type)
}

const end = evt => {
  emit('addNode', evt, nodeMenu.value, mousePosition)
}

const cloneNode = node => {
  return { ...node }
}
</script>

<style lang="scss" scoped></style>
