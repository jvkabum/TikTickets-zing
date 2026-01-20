import { computed } from 'vue'

/**
 * Composable para gerenciar permissões e perfis de usuário
 */
export function usePermissoes() {
    const storage = useAppLocalStorage()

    /**
     * Verifica se o usuário é administrador
     */
    const isAdmin = computed(() => storage.getProfile() === 'admin')

    /**
     * Verifica se o usuário é super admin
     */
    const isSuper = computed(() => storage.getProfile() === 'super')

    return {
        isAdmin,
        isSuper
    }
}
