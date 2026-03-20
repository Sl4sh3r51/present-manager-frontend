<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { GiftIdea, Occasion } from '@/types'

const props = defineProps<{
  show: boolean
  idee: GiftIdea | null
  anlaesse: Occasion[]
}>()

const emit = defineEmits<{
  save: [data: { title: string; description: string | null; link: string | null; imageUrl?: string | null; occasionId?: string | null }]
  cancel: []
}>()

const form = ref({
  title: '',
  description: '',
  link: '',
  imageUrl: '',
  occasionId: '' as string
})

const isEdit = computed(() => props.idee !== null)
const modalTitle = computed(() => isEdit.value ? 'Geschenkidee bearbeiten' : 'Neue Geschenkidee')
const submitText = computed(() => isEdit.value ? 'Speichern' : 'Hinzufügen')

watch(
  [() => props.show, () => props.idee],
  ([newShow, newIdee]) => {
    if (newShow && newIdee) {
      form.value = {
        title: newIdee.title,
        description: newIdee.description || '',
        link: newIdee.link || '',
        imageUrl: newIdee.imageUrl || '',
        occasionId: newIdee.occasionId != null ? String(newIdee.occasionId) : ''
      }
    } else if (newShow) {
      form.value = { title: '', description: '', link: '', imageUrl: '', occasionId: '' }
    }
  }
)

const isValid = computed(() => form.value.title.trim() !== '')

function handleSubmit() {
  if (!isValid.value) return
  emit('save', {
    title: form.value.title.trim(),
    description: form.value.description.trim() || null,
    link: form.value.link.trim() || null,
    imageUrl: form.value.imageUrl.trim() || null,
    occasionId: form.value.occasionId || null
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
              <div class="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h2 class="text-lg font-semibold text-gray-900">{{ modalTitle }}</h2>
            </div>
            <button @click="emit('cancel')" class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
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
                v-model="form.title"
                type="text"
                placeholder="z.B. Spa-Gutschein, Buch..."
                class="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                required
                autofocus
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Beschreibung</label>
              <textarea
                v-model="form.description"
                rows="2"
                placeholder="Kurze Beschreibung der Idee..."
                class="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400 resize-none"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Link / URL</label>
              <input
                v-model="form.link"
                type="url"
                placeholder="https://..."
                class="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Bild-URL</label>
              <input
                v-model="form.imageUrl"
                type="url"
                placeholder="https://example.com/bild.jpg"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Anlass (optional)</label>
              <select
                v-model="form.occasionId"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
              >
                <option value="">Kein Anlass</option>
                <option v-for="anlass in anlaesse" :key="anlass.id" :value="anlass.id">
                  {{ anlass.name }}
                </option>
              </select>
            </div>

            <div class="flex justify-end gap-3 pt-2">
              <button type="button" @click="emit('cancel')" class="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer">
                Abbrechen
              </button>
              <button
                type="submit"
                :disabled="!isValid"
                :class="[
                  'px-5 py-2.5 text-sm font-medium rounded-xl transition-all',
                  isValid ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm cursor-pointer' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
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
