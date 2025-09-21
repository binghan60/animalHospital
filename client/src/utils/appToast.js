import { useToast } from 'vue-toastification'

// Simple de-duplication store with TTL
const shownMap = new Map()
const DEFAULT_TTL = 2000

function setOnce(key, ttl = DEFAULT_TTL) {
  const now = Date.now()
  const cur = shownMap.get(key)
  if (cur && now - cur < ttl) return false
  shownMap.set(key, now)
  setTimeout(() => shownMap.delete(key), ttl)
  return true
}

function normalizeErrorMessage(err, fallback = '發生錯誤，請稍後再試') {
  if (!err) return fallback
  if (typeof err === 'string') return err
  const msg = err?.response?.data?.message || err?.message || fallback
  return msg
}

export function useAppToast() {
  const toast = useToast()
  const isManualLogout = () => typeof window !== 'undefined' && sessionStorage.getItem('manualLogout')
  return {
    success(message, options = {}) {
      if (!message) return
      toast.success(message, { timeout: 3000, ...options })
    },
    error(errorOrMessage, fallback, options = {}) {
      if (isManualLogout()) return
      const message = normalizeErrorMessage(errorOrMessage, fallback)
      toast.error(message, { timeout: 3500, ...options })
    },
    warning(message, options = {}) {
      if (isManualLogout()) return
      if (!message) return
      toast.warning(message, { timeout: 3000, ...options })
    },
    info(message, options = {}) {
      if (isManualLogout()) return
      if (!message) return
      toast.info(message, { timeout: 3000, ...options })
    },
    once(key, type, message, options = {}) {
      if (!setOnce(key)) return
      const map = { success: this.success, error: this.error, warning: this.warning, info: this.info }
      const fn = map[type] || this.info
      fn.call(this, message, options)
    },
    fromAxiosError(error, fallback, options = {}) {
      if (isManualLogout()) return
      const message = normalizeErrorMessage(error, fallback)
      toast.error(message, { timeout: 3500, ...options })
    },
  }
}
