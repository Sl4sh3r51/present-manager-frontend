<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { personsApi, giftsApi, occasionsApi } from '@/services/api'
import { useToast } from '@/composables/useToast'
import type { Person, Gift, Occasion } from '@/types'

const { error: showError } = useToast()

const loading = ref(true)
const persons = ref<Person[]>([])
const gifts = ref<Gift[]>([])
const occasions = ref<Occasion[]>([])

const giftsMap = computed(() => {
  const map: Record<string, Gift[]> = {}
  for (const gift of gifts.value) {
    if (!map[gift.personId]) map[gift.personId] = []
    map[gift.personId]!.push(gift)
  }
  return map
})

function getOccasionName(occasionId: string | null): string {
  if (!occasionId) return '-'
  const occasion = occasions.value.find(o => o.id === occasionId)
  return occasion?.name || '-'
}

const stats = computed(() => ({
  personenGesamt: persons.value.length,
  ideen: 0,
  geplant: gifts.value.filter(g => g.status === 'PLANNED').length,
  gekauft: gifts.value.filter(g => g.status === 'BOUGHT').length
}))

onMounted(async () => {
  try {
    const [personsRes, giftsRes, occasionsRes] = await Promise.all([
      personsApi.getAll(),
      giftsApi.getAll(),
      occasionsApi.getAll()
    ])
    persons.value = personsRes.data || []
    gifts.value = giftsRes.data || []
    occasions.value = occasionsRes.data || []
  } catch (err) {
    console.error('Fehler beim Laden der Übersicht:', err)
    showError('Daten konnten nicht geladen werden')
  } finally {
    loading.value = false
  }
})

function formattedDate(date: string | null) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function drucken() {
  window.print()
}

const statusBadge = (status: string) => {
  const map: Record<string, { text: string; class: string; icon: string }> = {
    PLANNED: { text: 'Geplant', class: 'bg-blue-50 text-blue-700 border-blue-200', icon: '' },
    BOUGHT: { text: 'Gekauft', class: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: '' },
    GIFTED: { text: 'Verschenkt', class: 'bg-gray-50 text-gray-600 border-gray-200', icon: '' }
  }
  return map[status] || { text: status, class: 'bg-gray-50 text-gray-400 border-gray-200', icon: '' }
}

const avatarColor = (name: string) => {
  const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-teal-500', 'bg-indigo-500']
  return colors[name?.charCodeAt(0) % colors.length || 0]
}

const initial = (name: string) => name?.charAt(0).toUpperCase() || '?'
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Übersicht</h1>
        <p class="text-sm text-gray-500">Vollständige Übersicht aller Personen und Geschenke</p>
      </div>
      <button
        @click="drucken"
        class="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        Drucken
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
    </div>

    <div v-else>
      <!-- Table -->
      <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200">
              <th class="text-left px-6 py-4 text-sm font-semibold text-gray-900">Person</th>
              <th class="text-left px-6 py-4 text-sm font-semibold text-gray-900">Geburtstag</th>
              <th class="text-left px-6 py-4 text-sm font-semibold text-gray-900">Anlass</th>
              <th class="text-left px-6 py-4 text-sm font-semibold text-gray-900">Geschenk</th>
              <th class="text-left px-6 py-4 text-sm font-semibold text-gray-900">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <template v-for="person in persons" :key="person.id">
              <!-- If person has gifts -->
              <template v-if="(giftsMap[person.id] ?? []).length > 0">
                <tr
                  v-for="(gift, idx) in (giftsMap[person.id] ?? [])"
                  :key="gift.id"
                  class="hover:bg-gray-50 transition-colors"
                >
                  <td v-if="idx === 0" :rowspan="(giftsMap[person.id] ?? []).length" class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold', avatarColor(person.name)]">
                        {{ initial(person.name) }}
                      </div>
                      <span class="text-sm font-medium text-gray-900">{{ person.name }}</span>
                    </div>
                  </td>
                  <td v-if="idx === 0" :rowspan="(giftsMap[person.id] ?? []).length" class="px-6 py-4 text-sm text-gray-600">
                    {{ formattedDate(person.birthday) }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600">{{ getOccasionName(gift.occasionId) }}</td>
                  <td class="px-6 py-4">
                    <div>
                      <p class="text-sm font-medium text-gray-900">{{ gift.title }}</p>
                      <p v-if="gift.description" class="text-xs text-gray-500">{{ gift.description }}</p>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <span :class="['text-xs font-medium px-2.5 py-1 rounded-full border', statusBadge(gift.status).class]">
                      {{ statusBadge(gift.status).text }}
                    </span>
                  </td>
                </tr>
              </template>
              <!-- No gifts -->
              <tr v-else class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold', avatarColor(person.name)]">
                      {{ initial(person.name) }}
                    </div>
                    <span class="text-sm font-medium text-gray-900">{{ person.name }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-600">{{ formattedDate(person.birthday) }}</td>
                <td class="px-6 py-4 text-sm text-gray-400">-</td>
                <td class="px-6 py-4 text-sm text-gray-400">Keine Geschenke geplant</td>
                <td class="px-6 py-4">
                  <span class="text-xs text-gray-400">Keine Ideen</span>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Stats Footer -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        <div class="bg-white border border-gray-200 rounded-xl p-4">
          <p class="text-sm text-gray-500">Personen gesamt</p>
          <p class="text-2xl font-bold text-gray-900 mt-1">{{ stats.personenGesamt }}</p>
        </div>
        <div class="bg-white border border-gray-200 rounded-xl p-4">
          <p class="text-sm text-gray-500">Ideen</p>
          <p class="text-2xl font-bold text-gray-900 mt-1">{{ stats.ideen }}</p>
        </div>
        <div class="bg-white border border-gray-200 rounded-xl p-4">
          <p class="text-sm text-gray-500">Geplant</p>
          <p class="text-2xl font-bold text-gray-900 mt-1">{{ stats.geplant }}</p>
        </div>
        <div class="bg-white border border-gray-200 rounded-xl p-4">
          <p class="text-sm text-gray-500">Gekauft</p>
          <p class="text-2xl font-bold text-gray-900 mt-1">{{ stats.gekauft }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
