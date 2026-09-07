import { ref } from 'vue'
import { useQuasar } from 'quasar'
import {
    CriarEmpresa,
    DeletarEmpresa,
    EditarEmpresa,
    ListarEmpresas
} from 'src/service/empresas'

/**
 * Composable para gerenciar empresas/tenants
 */
export function useTenants () {
    const $q = useQuasar()

    const tenants = ref([])
    const loading = ref(false)
    const tenantAtual = ref(null)

    /**
     * Lista todos os tenants
     */
    const listarTenants = async () => {
        loading.value = true
        try {
            const { data } = await ListarEmpresas()
            tenants.value = data.tenants || data
            return data
        } catch (error) {
            $q.notify({
                type: 'negative',
                message: 'Erro ao listar empresas',
                position: 'top'
            })
            throw error
        } finally {
            loading.value = false
        }
    }

    /**
     * Cria um novo tenant
     */
    const criarTenant = async (tenant) => {
        loading.value = true
        try {
            const { data } = await CriarEmpresa(tenant)
            tenants.value.unshift(data)
            $q.notify({
                type: 'positive',
                message: 'Empresa criada com sucesso',
                position: 'top'
            })
            return data
        } catch (error) {
            $q.notify({
                type: 'negative',
                message: 'Erro ao criar empresa',
                position: 'top'
            })
            throw error
        } finally {
            loading.value = false
        }
    }

    /**
     * Edita um tenant existente
     */
    const editarTenant = async (id, tenant) => {
        loading.value = true
        try {
            const { data } = await EditarEmpresa(id, tenant)
            const idx = tenants.value.findIndex(t => t.id === id)
            if (idx !== -1) {
                tenants.value[idx] = data
            }
            $q.notify({
                type: 'positive',
                message: 'Empresa atualizada com sucesso',
                position: 'top'
            })
            return data
        } catch (error) {
            $q.notify({
                type: 'negative',
                message: 'Erro ao atualizar empresa',
                position: 'top'
            })
            throw error
        } finally {
            loading.value = false
        }
    }

    /**
     * Deleta um tenant
     */
    const deletarTenant = async (id) => {
        loading.value = true
        try {
            await DeletarEmpresa(id)
            tenants.value = tenants.value.filter(t => t.id !== id)
            $q.notify({
                type: 'positive',
                message: 'Empresa deletada com sucesso',
                position: 'top'
            })
        } catch (error) {
            $q.notify({
                type: 'negative',
                message: 'Erro ao deletar empresa',
                position: 'top'
            })
            throw error
        } finally {
            loading.value = false
        }
    }

    /**
     * Seleciona um tenant para edição
     */
    const selecionarTenant = (tenant) => {
        tenantAtual.value = { ...tenant }
    }

    /**
     * Limpa seleção
     */
    const limparSelecao = () => {
        tenantAtual.value = null
    }

    /**
     * Obtém status do tenant
     */
    const getStatusLabel = (status) => {
        const labels = {
            active: 'Ativo',
            inactive: 'Inativo',
            trial: 'Período de Teste',
            suspended: 'Suspenso'
        }
        return labels[status] || status
    }

    /**
     * Obtém cor do status
     */
    const getStatusColor = (status) => {
        const colors = {
            active: 'positive',
            inactive: 'grey',
            trial: 'warning',
            suspended: 'negative'
        }
        return colors[status] || 'grey'
    }

    return {
        tenants,
        loading,
        tenantAtual,
        listarTenants,
        criarTenant,
        editarTenant,
        deletarTenant,
        selecionarTenant,
        limparSelecao,
        getStatusLabel,
        getStatusColor
    }
}
