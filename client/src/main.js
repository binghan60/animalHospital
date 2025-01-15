import '@/assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from '@/App.vue'
import router from '@/router'
import Toast, { useToast } from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import Loading from 'vue-loading-overlay'
import 'vue-loading-overlay/dist/css/index.css'
import { defineRule } from 'vee-validate'

defineRule('required', value => {
  if (!value?.toString() || !value?.toString().length) {
    return '此欄位為必填，請輸入資料'
  }
  return true
})
defineRule('length', (value, [min, max]) => {
  if (!value || !value.length) {
    return true
  }
  const numericValue = value.length
  if (numericValue < min) {
    return `請輸入至少 ${min} 個字`
  }
  if (numericValue > max) {
    return `請輸入不超過 ${max} 個字`
  }
  return true
})
defineRule('confirmed', (value, [target]) => {
  if (value === target) {
    return true
  }
  return '密碼與確認密碼不一致，請重新確認'
})
defineRule('atLeastOneFieldRule', (value, [field1, field2]) => {
  if (value || field1 || field2) {
    return true
  }
  return '至少填寫一個欄位'
})
const options = {
  position: 'bottom-center',
  timeout: 1500,
  closeOnClick: true,
  pauseOnFocusLoss: false,
  pauseOnHover: false,
  draggable: true,
  draggablePercent: 0.25,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false,
  transition: 'Vue-Toastification__fade',
}
const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)
app.use(Toast, options)
app.component('VueLoading', Loading) // 全域註冊 VueLoading 元件
app.config.globalProperties.$toast = useToast() // 全域註冊 this.$toast 方法
app.mount('#app')
