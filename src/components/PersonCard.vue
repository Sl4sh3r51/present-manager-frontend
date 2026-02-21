<!-- src/components/PersonCard.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps({
  person: { type: Object, required: true }
})

const emit = defineEmits(['click', 'edit', 'delete'])
const showMenu = ref(false)

const initials = computed(() => {
  return props.person.name
    ?.split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 1) || '?'
})

const avatarColor = computed(() => {
  const colors = [
    'bg-blue-500', 'bg-emerald-500', 'bg-purple-500',
    'bg-orange-500', 'bg-pink-500', 'bg-teal-500', 'bg-indigo-500'
  ]
  const idx = props.person.name?.charCodeAt(0) % colors.length || 0
  return colors[idx]
})

const tageHer = computed(() => {
  if (!props.person.geburtstag) return null
  const today = new Date()
  const gb = new Date(props.person.geburtstag)
  const diff = Math.floor((today - gb) / (1000 * 60 * 60 * 24))
  return diff
})

const formattedDate = computed(() => {
  if (!props.person.geburtstag) return ''
  const d = new Date(props.person.geburtstag)
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
})

const statusBadge = computed(() => {
  if (props.person.hatGekauft) {
    return { text: 'Gekauft', class: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: '✓' }
  }
  if (props.person.hatIdeen) {
    return { text: 'Ideen vorhanden', class: 'bg-amber-50 text-amber-700 border-amber-200', icon: '💡' }
  }
  return { text: 'Keine Ideen', class: 'bg-gray-50 text-gray-500 border-gray-200', icon: '' }
})

function toggleMenu(e) {
  e.stopPropagation()
  showMenu.value = !showMenu.value
}

function handleEdit(e) {
  e.stopPropagation()
  showMenu.value = false
  emit('edit', props.person)
}

function handleDelete(e) {
  e.stopPropagation()
  showMenu.value = false
  emit('delete', props.person)
}
</script>

<template>
  <div
    @click="emit('click', person)"
    class="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-lg hover:border-gray-300 cursor-pointer transition-all duration-200 relative group"
  >
    <!-- Three-dot Menu -->
    <div class="absolute top-4 right-4">
      <button
        @click="toggleMenu"
        class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
        :class="{ 'opacity-100': showMenu }"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="6" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="12" cy="18" r="1.5" />
        </svg>
      </button>

      <Transition name="dropdown">
        <div
          v-if="showMenu"
          class="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-10"
        >
          <button
            @click="handleEdit"
            class="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Bearbeiten
          </button>
          <button
            @click="handleDelete"
            class="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Löschen
          </button>
        </div>
      </Transition>
    </div>

    <!-- Status Badge -->
    <div class="flex items-start justify-between mb-4">
      <div :class="['w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg', avatarColor]">
        {{ initials }}
      </div>
      <span
        :class="['text-xs font-medium px-2.5 py-1 rounded-full border', statusBadge.class]"
      >
        {{ statusBadge.icon }} {{ statusBadge.text }}
      </span>
    </div>

    <!-- Info -->
    <h3 class="font-semibold text-gray-900 text-base mb-1">{{ person.name }}</h3>
    <div class="flex items-center gap-1.5 text-sm text-gray-500">
      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      {{ formattedDate }}
    </div>
    <p v-if="tageHer !== null" class="text-xs text-blue-600 mt-0.5 ml-5">
      {{ tageHer }} Tage her
    </p>
  </div>

  <!-- Click-away for menu -->
  <div v-if="showMenu" class="fixed inset-0 z-0" @click.stop="showMenu = false" />
</template>

<style scoped>
.dropdown-enter-active { transition: all 0.15s ease-out; }
.dropdown-leave-active { transition: all 0.1s ease-in; }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(-4px) scale(0.98); }
</style>
