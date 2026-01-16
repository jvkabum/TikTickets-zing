<template>
  <q-dialog
    title="流程数据信息"
    v-model="dialogVisible"
    width="70%"
  >
    <el-alert
      title="使用说明"
      type="warning"
      description="以下流程信息可以被存储起来，方便下一次流程加载"
      show-icon
      close-text="知道了"
    >
    </el-alert>
    <br />
    <!--一个高亮显示的插件-->
    <Codemirror
      v-model="flowJsonData"
      :extensions="extensions"
      :style="{ height: '400px' }"
      class="code"
    />
  </q-dialog>
</template>

<script setup>
import { json } from '@codemirror/lang-json'
import { ref, shallowRef } from 'vue'
import { Codemirror } from 'vue-codemirror'

const props = defineProps({
  data: Object
})

const dialogVisible = ref(false)
const flowJsonData = ref('')
const extensions = shallowRef([json()])

const init = () => {
  dialogVisible.value = true
  flowJsonData.value = JSON.stringify(props.data, null, 4)
}

defineExpose({
  init
})
</script>
