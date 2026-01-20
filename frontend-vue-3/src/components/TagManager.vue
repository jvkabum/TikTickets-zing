<template>
  <div>
    <h2>Gerenciar Etiquetas</h2>
    <input
      v-model="newTag"
      placeholder="Adicionar nova etiqueta"
    />
    <button @click="addTag">Adicionar</button>
    <ul>
      <li
        v-for="tag in tags"
        :key="tag.id"
      >
        {{ tag.name }}
        <button @click="editTag(tag)">Editar</button>
        <button @click="deleteTag(tag.id)">Excluir</button>
      </li>
    </ul>
  </div>
</template>

<script setup>
const etiquetaStore = useEtiquetaStore()
const { etiquetas: tags } = storeToRefs(etiquetaStore)
const newTag = ref('')

const fetchTags = async () => {
  await etiquetaStore.listarEtiquetas()
}

const addTag = async () => {
  if (newTag.value) {
    try {
      await etiquetaStore.criarEtiqueta({ name: newTag.value, color: '#000000' })
      newTag.value = ''
    } catch (error) {
      // Erro já é notificado na store
    }
  }
}

const editTag = async tag => {
  const updatedName = prompt('Editar etiqueta:', tag.name)
  if (updatedName) {
    try {
      await etiquetaStore.alterarEtiqueta({ ...tag, name: updatedName })
    } catch (error) {
      // Erro já é notificado na store
    }
  }
}

const deleteTag = async tagId => {
  try {
    await etiquetaStore.deletarEtiqueta({ id: tagId })
  } catch (error) {
    // Erro já é notificado na store
  }
}

onMounted(() => {
  fetchTags()
})
</script>

<style scoped>
/* Adicione estilos aqui */
</style>
