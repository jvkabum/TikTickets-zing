<template>
  <div>
    <h2>Gerenciar Etiquetas</h2>
    <input v-model="newTag" placeholder="Adicionar nova etiqueta" />
    <button @click="addTag">Adicionar</button>
    <ul>
      <li v-for="tag in tags" :key="tag.id">
        {{ tag.name }}
        <button @click="editTag(tag)">Editar</button>
        <button @click="deleteTag(tag.id)">Excluir</button>
      </li>
    </ul>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      tags: [],
      newTag: ''
    };
  },
  methods: {
    async fetchTags() {
      const response = await axios.get('/api/tags');
      this.tags = response.data;
    },
    async addTag() {
      if (this.newTag) {
        await axios.post('/api/tags', { name: this.newTag });
        this.newTag = '';
        this.fetchTags();
      }
    },
    async editTag(tag) {
      const updatedName = prompt('Editar etiqueta:', tag.name);
      if (updatedName) {
        await axios.put(`/api/tags/${tag.id}`, { name: updatedName });
        this.fetchTags();
      }
    },
    async deleteTag(tagId) {
      await axios.delete(`/api/tags/${tagId}`);
      this.fetchTags();
    }
  },
  mounted() {
    this.fetchTags();
  }
};
</script>

<style scoped>
/* Adicione estilos aqui */
</style>
