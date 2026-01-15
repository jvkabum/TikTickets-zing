import { createStore } from 'vuex'
import getters from './getters'
import atendimentoTicket from './modules/atendimentoTicket'
import chatFlow from './modules/chatFlow'
import notifications from './modules/Notifications'
import user from './modules/user'
import usersApp from './modules/usersApp'
import whatsapp from './modules/whatsapp'

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

const Store = createStore({
  getters,
  modules: {
    user,
    notifications,
    atendimentoTicket,
    whatsapp,
    chatFlow,
    usersApp
  },
  // enable strict mode (adds overhead!)
  // for dev mode only
  strict: process.env.DEBUGGING
})

export default Store
