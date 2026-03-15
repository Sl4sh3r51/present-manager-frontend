<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { Occasion } from '@/types'

const props = defineProps<{
  show: boolean
  anlass?: Occasion
}>()

const emit = defineEmits<{
  save: [data: Partial<Occasion>]
  cancel: []
}>()

const form = ref({
  name: '',
  isRecurring: false,
  fixedMonth: null as number | null,
  fixedDay: null as number | null
})

const isEdit = computed(() => props.anlass != null)
const title = computed(() => isEdit.value ? 'Anlass bearbeiten' : 'Neuen Anlass erstellen')
const submitText = computed(() => isEdit.value ? 'Speichern' : 'Hinzufügen')

watch(() => props.show, (newVal) => {
  if (newVal && props.anlass) {
    form.value = {
      name: props.anlass.name || '',
      isRecurring: props.anlass.isRecurring || false,
      fixedMonth: props.anlass.fixedMonth ?? null,
      fixedDay: props.anlass.fixedDay ?? null
    }
  } else if (newVal) {
    form.value = { name: '', isRecurring: false, fixedMonth: null, fixedDay: null }
  }
})

const isValid = computed(() => form.value.name.trim() !== '')

function handleSubmit() {
  if (!isValid.value) return
  emit('save', {
    name: form.value.name.trim(),
    type: 'CUSTOM',
    isRecurring: form.value.isRecurring,
    fixedMonth: form.value.isRecurring ? form.value.fixedMonth : null,
    fixedDay: form.value.isRecurring ? form.value.fixedDay : null
  })
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="emit('cancel')" />

        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
          <div class="flex items-center justify-between p-6 pb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 class="text-lg font-semibold text-gray-900">{{ title }}</h2>
            </div>
            <button @click="emit('cancel')" class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form @submit.prevent="handleSubmit" class="px-6 pb-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">
                Bezeichnung <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.name"
                type="text"
                placeholder="z.B. Hochzeitstag, Ostern..."
                class="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                required
                autofocus
              />
            </div>

            <div>
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="form.isRecurring"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span class="text-sm font-medium text-gray-700">Wiederkehrend</span>
              </label>
            </div>

            <div v-if="form.isRecurring" class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Monat (1-12)</label>
                <input
                  v-model.number="form.fixedMonth"
                  type="number"
                  min="1"
                  max="12"
                  placeholder="z.B. 12"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Tag (1-31)</label>
                <input
                  v-model.number="form.fixedDay"
                  type="number"
                  min="1"
                  max="31"
                  placeholder="z.B. 24"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                />
              </div>
            </div>

            <div class="flex justify-end gap-3 pt-2">
              <button type="button" @click="emit('cancel')" class="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                Abbrechen
              </button>
              <button
                type="submit"
                :disabled="!isValid"
                :class="[
                  'px-5 py-2.5 text-sm font-medium rounded-xl transition-all',
                  isValid ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                ]"
              >
                {{ submitText }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active { transition: all 0.2s ease-out; }
.modal-leave-active { transition: all 0.15s ease-in; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
