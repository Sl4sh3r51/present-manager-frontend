<!-- src/components/GeschenkUebernehmenModal.vue -->
<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { GeschenkIdee, Anlass } from '@/types'

const props = defineProps<{
  show: boolean
  idee: GeschenkIdee | null
  anlaesse: Anlass[]
}>()

const emit = defineEmits<{
  save: [data: { titel: string; beschreibung: string; anlassName: string; datum: string | null; status: string }]
  cancel: []
}>()

const form = ref({
  titel: '',
  beschreibung: '',
  anlassName: '',
  datum: '',
  status: 'GEPLANT'
})

const statusOptions: { value: string; label: string }[] = [
  { value: 'GEPLANT', label: 'Geplant' },
  { value: 'GEKAUFT', label: 'Gekauft' },
  { value: 'VERSCHENKT', label: 'Verschenkt' }
]

watch(() => props.show, (newVal) => {
  if (newVal && props.idee) {
    form.value = {
      titel: props.idee.titel,
      beschreibung: props.idee.beschreibung || '',
      anlassName: props.anlaesse.length > 0 ? props.anlaesse[0]!.name : '',
      datum: '',
      status: 'GEPLANT'
    }
  }
})

const isValid = computed(() => form.value.titel.trim() !== '' && form.value.anlassName !== '')

function handleSubmit() {
  if (!isValid.value) return
  emit('save', {
    titel: form.value.titel.trim(),
    beschreibung: form.value.beschreibung.trim(),
    anlassName: form.value.anlassName,
    datum: form.value.datum || null,
    status: form.value.status
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
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <h2 class="text-lg font-semibold text-gray-900">Als Geschenk übernehmen</h2>
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
                Titel <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.titel"
                type="text"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Beschreibung</label>
              <textarea
                v-model="form.beschreibung"
                rows="2"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400 resize-none"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">
                Anlass <span class="text-red-500">*</span>
              </label>
              <select
                v-model="form.anlassName"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                required
              >
                <option value="" disabled>Anlass wählen...</option>
                <option v-for="anlass in anlaesse" :key="anlass.id" :value="anlass.name">
                  {{ anlass.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Datum</label>
              <input
                v-model="form.datum"
                type="date"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
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
                Übernehmen
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
