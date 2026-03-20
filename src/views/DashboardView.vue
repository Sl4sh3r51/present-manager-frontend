<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { personsApi, giftsApi, giftIdeasApi, tasksApi, occasionsApi } from '@/services/api'
import { useToast } from '@/composables/useToast'
import type { DashboardSummary, Task, Occasion } from '@/types'

const { error: showError } = useToast()

const loading = ref(true)
const summary = ref<DashboardSummary>({
  upcomingBirthdays: [],
  giftStats: { ideas: 0, planned: 0, bought: 0, gifted: 0 },
  openTasks: []
})

const monthNames = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
]

function formatBirthday(birthday: string): { formatted: string; daysText: string } {
  const birthDate = new Date(birthday)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const formatted = `${birthDate.getDate()}. ${monthNames[birthDate.getMonth()]}`

  const nextBirthday = new Date(now.getFullYear(), birthDate.getMonth(), birthDate.getDate())
  if (nextBirthday < today) nextBirthday.setFullYear(now.getFullYear() + 1)

  const diffDays = Math.round((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  const daysText = diffDays === 0 ? '(heute)' : `(in ${diffDays} ${diffDays === 1 ? 'Tag' : 'Tagen'})`

  return { formatted, daysText }
}

onMounted(async () => {
  try {
    const personsRes = await personsApi.getAll()
    const allPersons = personsRes.data || []

    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    const upcomingBirthdays = allPersons.filter(p => {
      if (!p.birthday) return false
      const birthDate = new Date(p.birthday)
      const thisYear = new Date(now.getFullYear(), birthDate.getMonth(), birthDate.getDate())
      if (thisYear < now) thisYear.setFullYear(now.getFullYear() + 1)
      return thisYear >= now && thisYear <= thirtyDaysFromNow
    }).sort((a, b) => {
      const aDate = new Date(a.birthday!)
      const bDate = new Date(b.birthday!)
      const aThisYear = new Date(now.getFullYear(), aDate.getMonth(), aDate.getDate())
      const bThisYear = new Date(now.getFullYear(), bDate.getMonth(), bDate.getDate())
      return aThisYear.getTime() - bThisYear.getTime()
    })

    const [giftsRes, giftIdeasRes, occasionsRes] = await Promise.all([
      giftsApi.getAll(),
      giftIdeasApi.getAll(),
      occasionsApi.getAll()
    ])
    const allGifts = giftsRes.data || []
    const allIdeas = giftIdeasRes.data || []
    const allOccasions: Occasion[] = occasionsRes.data || []

    const xmasOccasion = allOccasions.find(o => o.name.toLowerCase() === 'weihnachten')
    const xmasGifts = xmasOccasion ? allGifts.filter(g => g.occasionId === xmasOccasion.id) : []
    const xmasIdeas = xmasOccasion ? allIdeas.filter(i => i.occasionId === xmasOccasion.id) : []

    const giftStats = {
      ideas: xmasIdeas.length,
      planned: xmasGifts.filter(g => g.status === 'PLANNED').length,
      bought: xmasGifts.filter(g => g.status === 'BOUGHT').length,
      gifted: xmasGifts.filter(g => g.status === 'GIFTED').length
    }

    const tasksRes = await tasksApi.getAll()
    const allTasks = tasksRes.data || []
    const openTasks = allTasks.filter((t: Task) => !t.isDone).slice(0, 3)

    const enrichedTasks = await Promise.all(
      openTasks.map(async (task: Task) => {
        const personRes = await personsApi.getById(task.personId)
        return { ...task, personName: personRes.data?.name || 'Unbekannt' }
      })
    )

    summary.value = { upcomingBirthdays, giftStats, openTasks: enrichedTasks }
  } catch (err) {
    console.error('Fehler beim Laden der Dashboard-Daten:', err)
    showError('Dashboard-Daten konnten nicht geladen werden')
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p class="text-gray-500 mt-1">Willkommen zurück! Hier ist dein Überblick.</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
    </div>

    <template v-else>
      <!-- Widget Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <!-- Nächste Geburtstage -->
        <div class="bg-white border border-gray-200 rounded-2xl p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900">Nächste Geburtstage</h3>
              <p class="text-xs text-gray-500">30 Tage</p>
            </div>
          </div>
          <div v-if="summary.upcomingBirthdays?.length > 0">
            <div
              v-for="person in summary.upcomingBirthdays"
              :key="person.id"
              class="flex items-center justify-between py-2"
            >
              <span class="text-sm text-gray-700">{{ person.name }}</span>
              <span class="text-xs text-gray-500">
                {{ formatBirthday(person.birthday!).formatted }}
                <span class="text-gray-400">{{ formatBirthday(person.birthday!).daysText }}</span>
              </span>
            </div>
          </div>
          <p v-else class="text-sm text-gray-400">Keine bevorstehenden Geburtstage</p>
        </div>

        <!-- Weihnachtsstatus -->
        <div class="bg-white border border-gray-200 rounded-2xl p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900">Weihnachtsstatus</h3>
              <p class="text-xs text-gray-500">Geschenke für Weihnachten</p>
            </div>
          </div>
          <div class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600">Ideen</span>
              <span class="font-medium text-gray-900">{{ summary.giftStats?.ideas || 0 }}</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600">Geplant</span>
              <span class="font-medium text-gray-900">{{ summary.giftStats?.planned || 0 }}</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600">Gekauft</span>
              <span class="font-medium text-gray-900">{{ summary.giftStats?.bought || 0 }}</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600">Verschenkt</span>
              <span class="font-medium text-gray-900">{{ summary.giftStats?.gifted || 0 }}</span>
            </div>
          </div>
        </div>

        <!-- Offene Aufgaben -->
        <div class="bg-white border border-gray-200 rounded-2xl p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900">Offene Aufgaben</h3>
              <p class="text-xs text-gray-500">{{ summary.openTasks?.length || 0 }} zu erledigen</p>
            </div>
          </div>
          <div v-if="summary.openTasks?.length > 0" class="space-y-3">
            <div
              v-for="task in summary.openTasks.slice(0, 3)"
              :key="task.id"
              class="flex items-start gap-3"
            >
              <input type="checkbox" class="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <div>
                <p class="text-sm text-gray-800">{{ task.title }}</p>
                <p class="text-xs text-gray-500">{{ task.personName }}</p>
              </div>
            </div>
          </div>
          <p v-else class="text-sm text-gray-400">Keine offenen Aufgaben</p>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
        <h3 class="font-semibold text-lg mb-1">Schnellaktionen</h3>
        <p class="text-blue-100 text-sm mb-4">Füge neue Personen oder Geschenkideen hinzu</p>
        <div class="flex flex-wrap gap-3">
          <router-link
            to="/personen"
            class="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-blue-700 text-sm font-medium rounded-xl hover:bg-blue-50 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Person hinzufügen
          </router-link>
          <button
            class="inline-flex items-center gap-2 px-5 py-2.5 bg-white/15 text-white border border-white/30 text-sm font-medium rounded-xl hover:bg-white/25 transition-colors cursor-pointer"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Geschenkidee hinzufügen
          </button>
        </div>
      </div>
    </template>
  </div>

</template>
