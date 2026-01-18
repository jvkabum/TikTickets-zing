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
import { AlterarEtiqueta, CriarEtiqueta, DeletarEtiqueta, ListarEtiquetas } from 'src/service/etiquetas'
import { notificarErro, notificarSucesso } from 'src/utils/helpersNotifications'
import { onMounted, ref } from 'vue'

const tags = ref([])
const newTag = ref('')

const fetchTags = async () => {
  try {
    const { data } = await ListarEtiquetas()
    tags.value = data
  } catch (error) {
    notificarErro('Erro ao buscar etiquetas', error)
  }
}

const addTag = async () => {
  if (newTag.value) {
    try {
      await CriarEtiqueta({ name: newTag.value, color: '#000000' })
      newTag.value = ''
      notificarSucesso('Etiqueta adicionada')
      fetchTags()
    } catch (error) {
      notificarErro('Erro ao adicionar etiqueta', error)
    }
  }
}

const editTag = async tag => {
  const updatedName = prompt('Editar etiqueta:', tag.name)
  if (updatedName) {
    try {
      await AlterarEtiqueta({ ...tag, name: updatedName })
      notificarSucesso('Etiqueta atualizada')
      fetchTags()
    } catch (error) {
      notificarErro('Erro ao atualizar etiqueta', error)
    }
  }
}

const deleteTag = async tagId => {
  try {
    await DeletarEtiqueta(tagId)
    notificarSucesso('Etiqueta excluída')
    fetchTags()
  } catch (error) {
    notificarErro('Erro ao excluir etiqueta', error)
  }
}

onMounted(() => {
  fetchTags()
})
</script>

<style scoped>
/* Adicione estilos aqui */
</style>
