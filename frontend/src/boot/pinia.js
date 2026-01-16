import { boot } from 'quasar/wrappers'
import { store } from 'src/stores'

export default boot(({ app }) => {
  app.use(store)
})
