import { boot } from 'quasar/wrappers'
import { configure } from 'vee-validate'

export default boot(() => {
  configure({
    validateOnBlur: true,
    validateOnChange: true,
    validateOnInput: false,
    validateOnModelUpdate: true
  })
})
