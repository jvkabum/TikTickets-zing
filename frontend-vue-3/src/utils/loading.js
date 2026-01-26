import { Loading, QSpinnerBars, QSpinnerPuff } from 'quasar'

const loading = {}
let lastRequest = new Date()

loading.show = function (config) {
  if (config.loading === 'gears') {
    Loading.show({
      spinner: QSpinnerBars,
      message: '',
      messageColor: 'white',
      spinnerSize: 100,
      spinnerColor: 'white',
      customClass: ''
    })
  } else if (config.loading === 'hourglass') {
    Loading.show({
      spinner: QSpinnerBars,
      message: '',
      messageColor: 'white',
      spinnerSize: 100,
      spinnerColor: 'white',
      customClass: ''
    })
  } else if (config.loading) {
    Loading.show({
      spinner: QSpinnerPuff,
      message: 'Estamos trabalhando...',
      messageColor: 'white',
      spinnerSize: 150,
      spinnerColor: 'white',
      customClass: ''
    })
  }
}

loading.hide = function (config) {
  Loading.hide()
}

export default loading
