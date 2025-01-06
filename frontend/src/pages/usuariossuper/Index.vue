<template>
  <div v-if="userProfile === 'super'">
    <q-table
      class="my-sticky-dynamic q-ma-lg"
      title="Usuarios"
      :data="usuarios"
      :columns="columns"
      :loading="loading"
      row-key="id"
      :pagination.sync="pagination"
      virtual-scroll
      :virtual-scroll-item-size="48"
      :virtual-scroll-sticky-size-start="48"
      @virtual-scroll="onScroll"
      :rows-per-page-options="[0]"
    >
      <template v-slot:top-right>
        <q-input
          style="width: 300px"
          outlined
          rounded
          dense
          class="col-grow"
          debounce="500"
          v-model="filter"
          clearable
          placeholder="Localize"
          @input="filtrarUsuario"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
         <q-btn
          rounded
          class="q-ml-md col"
          :class="{
            'q-ml-none q-mt-md q-mr-md': $q.screen.width < 500
          }"
          color="primary"
          label="Adicionar"
          @click="usuarioSelecionado = {}; modalUsuario = true"
          />

      </template>
      <template v-slot:body-cell-acoes="props">
        <q-td class="text-center">
          <q-btn
            flat
            round
            icon="edit"
            @click="editarUsuario(props.row)"
          />
        </q-td>
      </template>
      <template v-slot:pagination="{ pagination }">
        {{ usuarios.length }}/{{ pagination.rowsNumber }}
      </template>
    </q-table>
    <ModalUsuario
      :modalUsuario.sync="modalUsuario"
      @modalUsuario:usuario-editado="UPDATE_USUARIO"
      @modalUsuario:usuario-criado="usuarioCriado"
      :usuarioEdicao.sync="usuarioSelecionado"
    />
    <ModalUsuarioEdit
      :modalUsuario.sync="modalUsuarioEdit"
      @modalUsuario:usuario-editado="UPDATE_USUARIO"
      :usuarioEdicao.sync="usuarioSelecionado"
    />
  </div>
</template>

<script>
// const userId = +localStorage.getItem('userId')
import { AdminListarUsuarios } from 'src/service/user'
import ModalUsuarioEdit from './ModalUsuarioedit'
import ModalUsuario from './ModalUsuario'
export default {
  name: 'IndexUsuarios',
  components: { ModalUsuario, ModalUsuarioEdit },
  data () {
    return {
      userProfile: 'user',
      usuarios: [],
      usuarioSelecionado: {},
      filas: [],
      optionsProfile: [
        { value: 'user', label: 'Usuário' },
        { value: 'admin', label: 'Administrador' },
        { value: 'super', label: 'Super' }
      ],
      modalUsuario: false,
      modalUsuarioEdit: false,
      filter: null,
      pagination: {
        rowsPerPage: 40,
        rowsNumber: 0,
        lastIndex: 0
      },
      params: {
        pageNumber: 1,
        searchParam: null,
        hasMore: true
      },
      loading: false,
      columns: [
        { name: 'tenantId', label: 'Empresa', field: 'tenant', align: 'left', format: v => `${v.id} - ${v.name}` },
        { name: 'id', label: 'ID', field: 'id', align: 'left' },
        { name: 'name', label: 'Nome', field: 'name', align: 'left' },
        { name: 'email', label: 'E-mail', field: 'email', align: 'left' },
        { name: 'profile', label: 'Perfil', field: 'profile', align: 'left', format: (v) => this.optionsProfile.find(o => o.value == v).label },
        { name: 'acoes', label: 'Ações', field: 'acoes', align: 'center' }
      ]
    }
  },
  methods: {
    LOAD_USUARIOS (users) {
      const newUsers = []
      users.forEach(user => {
        const userIndex = this.usuarios.findIndex(c => c.id === user.id)
        if (userIndex !== -1) {
          this.usuarios[userIndex] = user
        } else {
          newUsers.push(user)
        }
      })
      const usersObj = [...this.usuarios, ...newUsers]
      this.usuarios = usersObj.filter(usuario => usuario.profile !== 'super')
    },
    UPDATE_USUARIO (usuario) {
      let newUsuarios = [...this.usuarios]
      const usuarioIndex = newUsuarios.findIndex(c => c.id === usuario.id)
      if (usuarioIndex !== -1) {
        newUsuarios[usuarioIndex] = usuario
      } else {
        newUsuarios = [usuario, ...newUsuarios]
      }
      this.usuarios = [...newUsuarios]
    },
    DELETE_USUARIO (userId) {
      const newObj = [...this.usuarios.filter(u => u.id !== userId)]
      this.usuarios = [...newObj]
    },
    async listarUsuarios () {
      this.loading = true
      const { data } = await AdminListarUsuarios(this.params)
      this.usuarios = data.users
      this.LOAD_USUARIOS(data.users)
      this.params.hasMore = data.hasMore
      this.pagination.lastIndex = this.usuarios.length - 1
      this.pagination.rowsNumber = data.count
      this.loading = false
    },
    filtrarUsuario (data) {
      this.usuarios = []
      this.params.pageNumber = 1
      this.params.searchParam = data
      this.listarUsuarios()
    },
    onScroll ({ to, ref, ...all }) {
      if (this.loading !== true && this.params.hasMore === true && to === this.pagination.lastIndex) {
        this.params.pageNumber++
        this.listarUsuarios()
      }
    },
    usuarioCriado (usuario) {
      this.usuarios.push(usuario)
      this.listarUsuarios()
    },
    editarUsuario (usuario) {
      this.usuarioSelecionado = usuario
      this.modalUsuarioEdit = true
    }
  },
  async mounted () {
    await this.listarUsuarios()
    this.userProfile = localStorage.getItem('profile')
    // Ouça o evento 'usuario-editado'
    this.$root.$on('usuario-editado', () => {
      // Atualize a página aqui
      this.listarUsuarios()
    })
  }
}
</script>

<style lang="sass" >
.my-sticky-dynamic
  /* height or max-height is important */
  height: 85vh

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th /* bg color is important for th; just specify one */
    background-color: #fff

  thead tr th
    position: sticky
    z-index: 1
  /* this will be the loading indicator */
  thead tr:last-child th
    /* height of all previous header rows */
    top: 63px
  thead tr:first-child th
    top: 0
</style>
