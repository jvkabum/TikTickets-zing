import { boot } from 'quasar/wrappers'
import { store } from 'src/stores'

export default boot(({ app, router }) => {
  if (!app.config.globalProperties.$pinia) {
    app.use(store)
  }
  store.use(({ store }) => {
    store.router = router
  })
})
