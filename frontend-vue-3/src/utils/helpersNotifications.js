import { Notify } from 'quasar'
import Errors from 'src/utils/errors'

export const notificarErro = (msg, error = null) => {
  console.error('notificarErro raw error:', error)
  let erro = ''
  if (error) {
    erro =
      error?.data?.error ||
      error?.data?.msg ||
      error?.data?.message ||
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      (typeof error === 'string' ? error : null) ||
      'Não identificado'
  }
  const findErro = Errors.find(e => e.error == erro)
  let message = ''

  if (error && findErro && findErro.error) {
    message = `
      <p class="text-bold">
      <span class="text-bold">${findErro.description}.</span>
      </p>
      <p>${findErro.detail}</p>
    `
  } else {
    message = `
    <p class="text-bold">
      <span class="text-bold">${msg}</span>
    </p>
    <p>Detail: ${erro}</p>
    `
  }

  Notify.create({
    type: 'negative',
    progress: true,
    position: 'top',
    timeout: 4000,
    message,
    actions: [
      {
        icon: 'close',
        round: true,
        color: 'white'
      }
    ],
    html: true
  })
}

export const notificarSucesso = msg => {
  const message = `Tudo certo... <br>${msg}.`
  Notify.create({
    type: 'positive',
    progress: true,
    position: 'top',
    message,
    timeout: 2500,
    actions: [
      {
        icon: 'close',
        round: true,
        color: 'white'
      }
    ],
    html: true
  })
}

export const notificarInfo = msg => {
  Notify.create({
    type: 'info',
    progress: true,
    position: 'top',
    message: msg,
    timeout: 3000,
    actions: [
      {
        icon: 'close',
        round: true,
        color: 'white'
      }
    ]
  })
}
