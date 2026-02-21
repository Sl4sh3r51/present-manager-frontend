<!-- src/components/ToastContainer.vue -->
<script setup lang="ts">
import { useToast } from '@/composables/useToast'

const { toasts } = useToast()
</script>

<template>
  <div class="fixed top-4 right-4 z-50 flex flex-col gap-2">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'px-5 py-3 rounded-xl shadow-lg text-sm font-medium min-w-[280px] backdrop-blur-sm',
          'transform transition-all duration-300',
          toast.type === 'success' && 'bg-emerald-50 text-emerald-800 border border-emerald-200',
          toast.type === 'error' && 'bg-red-50 text-red-800 border border-red-200',
          toast.type === 'info' && 'bg-blue-50 text-blue-800 border border-blue-200'
        ]"
      >
        <div class="flex items-center gap-2">
          <span v-if="toast.type === 'success'">✓</span>
          <span v-if="toast.type === 'error'">✕</span>
          <span v-if="toast.type === 'info'">ℹ</span>
          {{ toast.message }}
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active {
  transition: all 0.3s ease-out;
}
.toast-leave-active {
  transition: all 0.2s ease-in;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(60px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(60px);
}
</style>
