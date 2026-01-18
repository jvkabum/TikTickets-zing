import { boot } from 'quasar/wrappers'
import { store } from 'src/stores'

export default boot(({ app }) => {
  if (!app.config.globalProperties.$pinia) {
    app.use(store)
  }
})
