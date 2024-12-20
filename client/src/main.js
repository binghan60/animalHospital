import '@/assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from '@/App.vue'
import router from '@/router'
import Toast, { useToast } from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import { defineRule } from 'vee-validate'

defineRule('required', value => {
  if (!value || !value.length) {
    return '此欄位為必填'
  }
  return true
})
defineRule('length', (value, [min, max]) => {
  if (!value || !value.length) {
    return true
  }
  const numericValue = value.length
  if (numericValue < min) {
    return `請輸入長度至少 ${min} 個字`
  }
  if (numericValue > max) {
    return `請輸入長度低於 ${max} 個字`
  }
  return true
})
defineRule('confirmed', (value, [target]) => {
  if (value === target) {
    return true
  }
  return '密碼與確認密碼不同'
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

app.config.globalProperties.$toast = useToast() // 全域註冊 this.$toast 方法
app.mount('#app')
