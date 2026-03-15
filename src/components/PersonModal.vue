<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { PersonStatus } from '@/types'

const props = defineProps({
  show: { type: Boolean, default: false },
  person: { type: Object, default: null }
})

const emit = defineEmits(['save', 'cancel'])

const form = ref({
  name: '',
  birthday: '',
  interessen: '',
  notes: '',
  status: 'NONE' as PersonStatus
})

const statusOptions: { value: PersonStatus; label: string }[] = [
  { value: 'NONE', label: 'Keine' },
  { value: 'IDEAS', label: 'Ideen' },
  { value: 'PLANNED', label: 'Geplant' },
  { value: 'COMPLETED', label: 'Abgeschlossen' }
]

const isEdit = computed(() => props.person !== null)
const title = computed(() => isEdit.value ? 'Person bearbeiten' : 'Person hinzufügen')
const submitText = computed(() => isEdit.value ? 'Speichern' : 'Hinzufügen')

watch(() => props.show, (newVal) => {
  if (newVal && props.person) {
    form.value = {
      name: props.person.name || '',
      birthday: props.person.birthday || '',
      interessen: props.person.interessen || '',
      notes: props.person.notes || '',
      status: props.person.status || 'NONE'
    }
  } else if (newVal) {
    form.value = { name: '', birthday: '', interessen: '', notes: '', status: 'NONE' }
  }
})

const isValid = computed(() => {
  return form.value.name.trim() !== ''
})

function handleSubmit() {
  if (!isValid.value) return
  const data = {
    name: form.value.name,
    birthday: form.value.birthday || null,
    notes: form.value.notes || null,
    status: form.value.status,
    interessen: form.value.interessen
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0)
  }
  emit('save', data)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="emit('cancel')" />

        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 transform transition-all">
          <div class="flex items-center justify-between p-6 pb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 class="text-lg font-semibold text-gray-900">{{ title }}</h2>
            </div>
            <button
              @click="emit('cancel')"
              class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form @submit.prevent="handleSubmit" class="px-6 pb-6">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">
                  Name <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.name"
                  type="text"
                  placeholder="z.B. Anna Schmidt"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                  required
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">
                  Geburtstag
                </label>
                <div class="relative">
                  <input
                    v-model="form.birthday"
                    type="date"
                    placeholder="tt.mm.jjjj"
                    class="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                <select
                  v-model="form.status"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                >
                  <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">
                  Interessen (kommagetrennt)
                </label>
                <input
                  v-model="form.interessen"
                  type="text"
                  placeholder="z.B. Kochen, Yoga, Reisen"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Notizen</label>
                <textarea
                  v-model="form.notes"
                  rows="3"
                  placeholder="Weitere Informationen zur Person..."
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none placeholder:text-gray-400"
                />
              </div>
            </div>

            <div class="flex justify-end gap-3 mt-6">
              <button
                type="button"
                @click="emit('cancel')"
                class="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                :disabled="!isValid"
                :class="[
                  'px-5 py-2.5 text-sm font-medium rounded-xl transition-all',
                  isValid
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
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
