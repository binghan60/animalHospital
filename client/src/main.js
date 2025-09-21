import '@/assets/main.css'
import { createApp, watch } from 'vue'
import { createPinia } from 'pinia'
import App from '@/App.vue'
import router from '@/router'
import Toast, { useToast } from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import Loading from 'vue-loading-overlay'
import 'vue-loading-overlay/dist/css/index.css'
import { defineRule } from 'vee-validate'
import authStore from '@/stores/auth.js'
import '@/axiosConfig.js'

// Vuetify
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.min.css'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import * as vuetifyComponents from 'vuetify/components'
import * as vuetifyDirectives from 'vuetify/directives'
defineRule('required', value => {
  if (!value?.toString() || !value?.toString().length) {
    return '此欄位為必填，請輸入資料'
  }
  return true
})
defineRule('email', value => {
  if (!value) {
    return true
  }
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailPattern.test(value) ? true : '請輸入有效的 Email'
})
defineRule('length', (value, [min, max]) => {
  if (!value || !value.length) {
    return true
  }
  const numericValue = value.length
  const minN = Number(min)
  const maxN = Number(max)
  if (!Number.isNaN(minN) && numericValue < minN) {
    return `請輸入至少 ${minN} 個字元`
  }
  if (!Number.isNaN(maxN) && numericValue > maxN) {
    return `長度限制最多 ${maxN} 個字元`
  }
  return true
})
defineRule('confirmed', (value, [target]) => {
  if (value === target) {
    return true
  }
  return '密碼與確認密碼不一致，請重新確認'
})
defineRule('deleteConfirmed', (value, [target]) => {
  if (value === target) {
    return true
  }
  return `請輸入正確的動物名稱：${target}`
})
defineRule('atLeastOneFieldRule', (value, [field1, field2]) => {
  if (value || field1 || field2) {
    return true
  }
  return '至少填寫一個欄位'
})
const toastOptions = {
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

// Vuetify
const vuetify = createVuetify({
  components: vuetifyComponents,
  directives: vuetifyDirectives,
  icons: { defaultSet: 'mdi', aliases, sets: { mdi } },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#2563eb', // blue-600
          'primary-darken-1': '#1d4ed8', // blue-700  
          secondary: '#64748b', // slate-500
          accent: '#06b6d4', // cyan-500
          error: '#dc2626', // red-600
          warning: '#ea580c', // orange-600
          info: '#0284c7', // sky-600
          success: '#16a34a', // green-600
          surface: '#ffffff',
          background: '#f8fafc', // slate-50
          'on-surface': '#1e293b', // slate-800
          'on-background': '#1e293b', // slate-800
        }
      },
      dark: {
        dark: true,
        colors: {
          primary: '#3b82f6', // blue-500
          'primary-darken-1': '#2563eb', // blue-600
          secondary: '#64748b', // slate-500
          accent: '#06b6d4', // cyan-500
          error: '#ef4444', // red-500
          warning: '#f97316', // orange-500
          info: '#0ea5e9', // sky-500
          success: '#22c55e', // green-500
          surface: '#262626', // neutral-800
          background: '#171717', // neutral-900
          'on-surface': '#d4d4d4', // neutral-300
          'on-background': '#d4d4d4', // neutral-300
        }
      }
    }
  },
})

app.use(router)
app.use(Toast, toastOptions)
app.use(vuetify)
app.component('VueLoading', Loading) // 全域註冊 VueLoading 元件
const store = authStore()
document.querySelector('body').classList.toggle('dark', store.isDark)
app.provide('loadingConfig', {
  height: 190,
  width: 190,
  loader: 'dots',
  getColor() {
    return store.isDark ? '#d4d4d4' : '#007BFF'
  },
  backgroundColor() {
    return store.isDark ? '#000000' : '#FCFCFC'
  },
})

// 同步深色模式到 Vuetify 主題
watch(
  () => store.isDark,
  val => {
    vuetify.theme.global.name.value = val ? 'dark' : 'light'
  },
  { immediate: true },
)

app.config.globalProperties.$toast = useToast()
app.mount('#app')
