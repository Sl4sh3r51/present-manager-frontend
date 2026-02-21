<!-- src/components/ConfirmDialog.vue -->
<script setup lang="ts">
defineProps({
  show: { type: Boolean, default: false },
  title: { type: String, default: 'Bestätigung' },
  message: { type: String, default: 'Möchtest du fortfahren?' },
  confirmText: { type: String, default: 'Löschen' },
  cancelText: { type: String, default: 'Abbrechen' },
  danger: { type: Boolean, default: true }
})

const emit = defineEmits(['confirm', 'cancel'])
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="emit('cancel')" />
        <div class="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 transform transition-all">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ title }}</h3>
          <p class="text-gray-600 text-sm mb-6">{{ message }}</p>
          <div class="flex justify-end gap-3">
            <button
              @click="emit('cancel')"
              class="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              {{ cancelText }}
            </button>
            <button
              @click="emit('confirm')"
              :class="[
                'px-5 py-2.5 text-sm font-medium rounded-xl transition-colors',
                danger
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              ]"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active { transition: all 0.2s ease-out; }
.modal-leave-active { transition: all 0.15s ease-in; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .relative, .modal-leave-to .relative { transform: scale(0.95); }
</style>
