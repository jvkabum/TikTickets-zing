import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { RealizarLogout } from 'src/service/login'

export function useAuth () {
    const authStore = useAuthStore()
    const router = useRouter()
    const $q = useQuasar()
    const { notificarErro, notificarSucesso } = useNotifications()

    const usuario = computed(() => authStore.user)
    const isDark = computed(() => $q.dark.isActive)
    const username = computed(() => localStorage.getItem('username'))
    const userProfile = computed(() => localStorage.getItem('profile'))

    /**
     * Realiza logout do sistema limpando caches e redirecionando
     */
    const logout = async () => {
        try {
            if (usuario.value) {
                await RealizarLogout(usuario.value)
            }

            authStore.logout()

            // Limpeza de caches específicos
            localStorage.removeItem('queues')
            localStorage.removeItem('filtrosAtendimento')
            localStorage.removeItem('configuracoes')
            localStorage.removeItem('username')
            localStorage.removeItem('profile')
            localStorage.removeItem('usuario')
            localStorage.removeItem('token')

            router.push({ name: 'login' })
            notificarSucesso('Logout realizado com sucesso!')
        } catch (error) {
            console.error('Erro ao realizar logout:', error)
            notificarErro('Não foi possível realizar logout', error)

            // Forçar logout local mesmo em caso de erro na API
            authStore.logout()
            router.push({ name: 'login' })
        }
    }

    /**
     * Alterna entre modo claro e escuro
     */
    const toggleDarkMode = (isDarkParam) => {
        $q.dark.set(isDarkParam)
        // Se houver lógica de salvar no banco, adicionar aqui
    }

    return {
        usuario,
        username,
        userProfile,
        isDark,
        logout,
        toggleDarkMode
    }
}
