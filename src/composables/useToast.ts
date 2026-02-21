// src/composables/useToast.ts
import { ref } from 'vue'

interface Toast {
  id: number
  message: string
  type: string
}

const toasts = ref<Toast[]>([])
let toastId = 0

export function useToast() {
  function showToast(message: string, type = 'success', duration = 3000) {
    const id = ++toastId
    toasts.value.push({ id, message, type })
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, duration)
  }

  function success(message: string) {
    showToast(message, 'success')
  }

  function error(message: string) {
    showToast(message, 'error')
  }

  function info(message: string) {
    showToast(message, 'info')
  }

  return { toasts, showToast, success, error, info }
}
