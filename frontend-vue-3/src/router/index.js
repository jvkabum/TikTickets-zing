import { Notify } from 'quasar'
import { createRouter, createWebHashHistory } from 'vue-router'
import routes from './routes'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

const createRouterInstance = () => {
  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    // Leave these as they are and change in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createWebHashHistory(process.env.VUE_ROUTER_BASE)
  })

  const whiteListName = ['login']

  Router.beforeEach((to, from, next) => {
    const token = JSON.parse(localStorage.getItem('token'))

    if (!token) {
      if (whiteListName.indexOf(to.name) == -1) {
        if (to.fullPath !== '/login' && !to.query.tokenSetup) {
          Notify.create({
            message: 'Necessário realizar login',
            position: 'top'
          })
          next({ name: 'login' })
        } else {
          next()
        }
      } else {
        next()
      }
    } else {
      next()
    }
  })

  Router.afterEach(to => {
    window.scrollTo(0, 0)
  })

  return Router
}

export const RouterInstance = createRouterInstance()
export default RouterInstance
