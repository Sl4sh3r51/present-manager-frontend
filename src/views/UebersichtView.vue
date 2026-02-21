<!-- src/views/UebersichtView.vue -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { personenApi } from '@/services/api'
import { mockPersonen } from '@/services/mockData'
import type { Person } from '@/types'

const loading = ref(true)
const uebersicht = ref<Person[]>([])

const stats = computed(() => ({
  personenGesamt: uebersicht.value.length,
  ideen: uebersicht.value.filter(p => p.geschenke?.some(g => g.typ === 'IDEE')).length,
  geplant: uebersicht.value.filter(p => p.geschenke?.some(g => g.status === 'GEPLANT')).length,
  gekauft: uebersicht.value.filter(p => p.geschenke?.some(g => g.status === 'GEKAUFT')).length
}))

onMounted(async () => {
  try {
    const { data } = await personenApi.getAll()
    uebersicht.value = data
  } catch {
    console.warn('Backend nicht erreichbar, verwende Mock-Daten')
    uebersicht.value = mockPersonen
  } finally {
    loading.value = false
  }
})

function formattedDate(date: string) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function drucken() {
  window.print()
}

const statusBadge = (status: string) => {
  const map: Record<string, { text: string; class: string; icon: string }> = {
    IDEE: { text: 'Idee', class: 'bg-amber-50 text-amber-700 border-amber-200', icon: '' },
    GEPLANT: { text: 'Geplant', class: 'bg-blue-50 text-blue-700 border-blue-200', icon: '' },
    GEKAUFT: { text: 'Gekauft', class: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: '' },
    VERSCHENKT: { text: 'Verschenkt', class: 'bg-gray-50 text-gray-600 border-gray-200', icon: '' }
  }
  return map[status] || { text: 'Keine Ideen', class: 'bg-gray-50 text-gray-400 border-gray-200', icon: '' }
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
            <template v-for="person in uebersicht" :key="person.id">
              <!-- If person has gifts/ideas -->
              <template v-if="person.geschenke?.length > 0">
                <tr
                  v-for="(geschenk, idx) in person.geschenke"
                  :key="geschenk.id"
                  class="hover:bg-gray-50 transition-colors"
                >
                  <td v-if="idx === 0" :rowspan="person.geschenke.length" class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold', avatarColor(person.name)]">
                        {{ initial(person.name) }}
                      </div>
                      <span class="text-sm font-medium text-gray-900">{{ person.name }}</span>
                    </div>
                  </td>
                  <td v-if="idx === 0" :rowspan="person.geschenke.length" class="px-6 py-4 text-sm text-gray-600">
                    {{ formattedDate(person.geburtstag) }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600">{{ geschenk.anlassName || '-' }}</td>
                  <td class="px-6 py-4">
                    <div>
                      <p class="text-sm font-medium text-gray-900">{{ geschenk.titel }}</p>
                      <p v-if="geschenk.beschreibung" class="text-xs text-gray-500">{{ geschenk.beschreibung }}</p>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <span :class="['text-xs font-medium px-2.5 py-1 rounded-full border', statusBadge(geschenk.status).class]">
                      {{ statusBadge(geschenk.status).text }}
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
                <td class="px-6 py-4 text-sm text-gray-600">{{ formattedDate(person.geburtstag) }}</td>
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
