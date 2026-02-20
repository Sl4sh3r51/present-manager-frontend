// src/composables/useToast.js
import { ref } from 'vue'

const toasts = ref([])
let toastId = 0

export function useToast() {
  function showToast(message, type = 'success', duration = 3000) {
    const id = ++toastId
    toasts.value.push({ id, message, type })
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, duration)
  }

  function success(message) {
    showToast(message, 'success')
  }

  function error(message) {
    showToast(message, 'error')
  }

  function info(message) {
    showToast(message, 'info')
  }

  return { toasts, showToast, success, error, info }
}
