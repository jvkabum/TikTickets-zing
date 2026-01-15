import { boot } from 'quasar/wrappers'

export default boot(({ app }) => {
  // No Vue 3, o Vuelidate é usado via Composition API (useVuelidate)
  // ou registrado globalmente se necessário. 
  // No caso do Quasar 2, geralmente não precisa de registro global no boot
  // pois o Vuelidate é importado diretamente nos componentes.
})
