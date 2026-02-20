<!-- src/views/PersonDetailView.vue -->
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { personenApi, geschenkeApi, ideenApi, aufgabenApi } from '@/services/api'
import { mockPersonen, mockIdeen, mockGeschenke, mockAufgaben } from '@/services/mockData'
import { useToast } from '@/composables/useToast'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const route = useRoute()
const router = useRouter()
const { success, error: showError } = useToast()

const person = ref(null)
const ideen = ref([])
const geschenke = ref([])
const aufgaben = ref([])
const loading = ref(true)
const neueAufgabe = ref('')

const personId = computed(() => route.params.id)

const formattedGeburtstag = computed(() => {
  if (!person.value?.geburtstag) return ''
  return new Date(person.value.geburtstag).toLocaleDateString('de-DE', {
    day: '2-digit', month: 'long', year: 'numeric'
  })
})

onMounted(async () => {
  await loadAll()
})

async function loadAll() {
  loading.value = true
  try {
    const [pRes, iRes, gRes, aRes] = await Promise.all([
      personenApi.getById(personId.value),
      ideenApi.getAllByPerson(personId.value),
      geschenkeApi.getAllByPerson(personId.value),
      aufgabenApi.getAllByPerson(personId.value)
    ])
    person.value = pRes.data
    ideen.value = iRes.data
    geschenke.value = gRes.data
    aufgaben.value = aRes.data
  } catch (e) {
    console.warn('Backend nicht erreichbar, verwende Mock-Daten')
    const id = Number(personId.value)
    person.value = mockPersonen.find(p => p.id === id) || mockPersonen[0]
    ideen.value = mockIdeen[id] || []
    geschenke.value = mockGeschenke[id] || []
    aufgaben.value = mockAufgaben[id] || []
  } finally {
    loading.value = false
  }
}

async function convertToGeschenk(idee) {
  try {
    await ideenApi.convertToGeschenk(personId.value, idee.id, {})
    success('Idee wurde als Geschenk übernommen')
    await loadAll()
  } catch (e) {
    showError('Konvertierung fehlgeschlagen')
  }
}

async function updateGeschenkStatus(geschenk, status) {
  try {
    await geschenkeApi.updateStatus(personId.value, geschenk.id, status)
    geschenk.status = status
    success(`Status auf "${status}" gesetzt`)
  } catch (e) {
    showError('Status konnte nicht aktualisiert werden')
  }
}

async function toggleAufgabe(aufgabe) {
  try {
    await aufgabenApi.toggle(personId.value, aufgabe.id)
    aufgabe.erledigt = !aufgabe.erledigt
  } catch (e) {
    aufgabe.erledigt = !aufgabe.erledigt
  }
}

async function addAufgabe() {
  if (!neueAufgabe.value.trim()) return
  try {
    await aufgabenApi.create(personId.value, { titel: neueAufgabe.value.trim() })
    neueAufgabe.value = ''
    await loadAll()
  } catch (e) {
    showError('Aufgabe konnte nicht erstellt werden')
  }
}

async function deleteAufgabe(aufgabe) {
  try {
    await aufgabenApi.delete(personId.value, aufgabe.id)
    aufgaben.value = aufgaben.value.filter(a => a.id !== aufgabe.id)
  } catch (e) {
    showError('Aufgabe konnte nicht gelöscht werden')
  }
}

async function deleteIdee(idee) {
  try {
    await ideenApi.delete(personId.value, idee.id)
    ideen.value = ideen.value.filter(i => i.id !== idee.id)
    success('Idee wurde gelöscht')
  } catch (e) {
    showError('Idee konnte nicht gelöscht werden')
  }
}

async function deleteGeschenk(geschenk) {
  try {
    await geschenkeApi.delete(personId.value, geschenk.id)
    geschenke.value = geschenke.value.filter(g => g.id !== geschenk.id)
    success('Geschenk wurde gelöscht')
  } catch (e) {
    showError('Geschenk konnte nicht gelöscht werden')
  }
}

const vergangeneGeschenke = computed(() => geschenke.value.filter(g => g.status === 'VERSCHENKT'))
const geplanteGeschenke = computed(() => geschenke.value.filter(g => g.status !== 'VERSCHENKT'))

const statusButtons = ['GEPLANT', 'GEKAUFT', 'VERSCHENKT']
const statusLabels = { GEPLANT: 'Geplant', GEKAUFT: 'Gekauft', VERSCHENKT: 'Verschenkt' }
const statusColors = {
  GEPLANT: 'bg-blue-600 text-white',
  GEKAUFT: 'bg-gray-100 text-gray-700',
  VERSCHENKT: 'bg-gray-100 text-gray-700'
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header - immer sichtbar -->
    <div class="flex items-start justify-between mb-8">
      <div class="flex items-start gap-4">
        <button @click="router.push('/personen')" class="mt-1 p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div v-if="person">
          <h1 class="text-2xl font-bold text-gray-900">{{ person.name }}</h1>
          <p class="text-sm text-gray-500 mt-0.5">Geburtstag: {{ formattedGeburtstag }}</p>
          <div v-if="person.interessen?.length" class="flex flex-wrap gap-2 mt-2">
            <span
              v-for="tag in person.interessen"
              :key="tag"
              class="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full"
            >
              {{ tag }}
            </span>
          </div>
        </div>
        <div v-else-if="!loading">
          <h1 class="text-2xl font-bold text-gray-900">Person nicht gefunden</h1>
        </div>
      </div>

      <div v-if="person" class="flex items-center gap-2">
        <button class="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Idee hinzufügen
        </button>
        <button class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          KI-Ideen
        </button>
        <button class="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white text-sm font-medium rounded-xl hover:bg-emerald-600 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Teilen
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
    </div>

    <!-- Content -->
    <div v-else-if="person" class="grid grid-cols-1 lg:grid-cols-5 gap-8">
      <!-- Left Column (3/5) -->
      <div class="lg:col-span-3 space-y-6">
        <!-- Notizen -->
        <div v-if="person.notizen" class="bg-blue-50 border border-blue-100 rounded-2xl p-5">
          <h3 class="text-sm font-semibold text-blue-900 mb-1">Notizen</h3>
          <p class="text-sm text-blue-800">{{ person.notizen }}</p>
        </div>

        <!-- Vergangene Geschenke -->
        <div>
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Vergangene Geschenke</h2>
          <div v-if="vergangeneGeschenke.length > 0" class="space-y-3">
            <div
              v-for="g in vergangeneGeschenke"
              :key="g.id"
              class="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between"
            >
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
                <div>
                  <p class="font-medium text-gray-900 text-sm">{{ g.titel }}</p>
                  <p class="text-xs text-gray-500">{{ g.beschreibung }}</p>
                  <p class="text-xs text-gray-400">Anlass: {{ g.anlassName }}</p>
                </div>
              </div>
              <span class="text-xs text-gray-400">{{ g.datum }}</span>
            </div>
          </div>
          <p v-else class="text-sm text-gray-400">Noch keine vergangenen Geschenke</p>
        </div>
      </div>

      <!-- Right Column (2/5) -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Geschenkideen -->
        <div>
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Geschenkideen</h2>
          <div v-if="ideen.length > 0" class="space-y-3">
            <div v-for="idee in ideen" :key="idee.id" class="bg-white border border-gray-200 rounded-xl p-4">
              <div class="flex items-start justify-between mb-2">
                <h4 class="font-medium text-gray-900 text-sm">{{ idee.titel }}</h4>
                <div class="flex items-center gap-1">
                  <button class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button @click="deleteIdee(idee)" class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              <p v-if="idee.beschreibung" class="text-xs text-gray-500 mb-2">{{ idee.beschreibung }}</p>
              <a v-if="idee.link" :href="idee.link" target="_blank" class="text-xs text-blue-600 hover:underline">Link öffnen</a>
              <button
                @click="convertToGeschenk(idee)"
                class="w-full mt-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
              >
                Als Geschenk übernehmen
              </button>
            </div>
          </div>
          <p v-else class="text-sm text-gray-400">Noch keine Geschenkideen</p>
        </div>

        <!-- Geplante Geschenke -->
        <div>
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Geplante Geschenke</h2>
          <div v-if="geplanteGeschenke.length > 0" class="space-y-3">
            <div v-for="g in geplanteGeschenke" :key="g.id" class="bg-white border border-gray-200 rounded-xl p-4">
              <div class="flex items-start justify-between mb-1">
                <div>
                  <h4 class="font-medium text-gray-900 text-sm">{{ g.titel }}</h4>
                  <p v-if="g.beschreibung" class="text-xs text-gray-500">{{ g.beschreibung }}</p>
                  <p class="text-xs text-gray-400">Anlass: {{ g.anlassName }}</p>
                </div>
                <button @click="deleteGeschenk(g)" class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <!-- Status Buttons -->
              <div class="flex gap-2 mt-3">
                <button
                  v-for="s in statusButtons"
                  :key="s"
                  @click="updateGeschenkStatus(g, s)"
                  :class="[
                    'flex-1 py-1.5 text-xs font-medium rounded-lg transition-all',
                    g.status === s ? statusColors[s] : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                  ]"
                >
                  {{ statusLabels[s] }}
                </button>
              </div>
              <span :class="[
                'inline-flex items-center gap-1 mt-2 text-xs font-medium px-2 py-0.5 rounded-full',
                g.status === 'GEPLANT' ? 'bg-blue-50 text-blue-700' : g.status === 'GEKAUFT' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-50 text-gray-600'
              ]">
                {{ statusLabels[g.status] }}
              </span>
            </div>
          </div>
          <p v-else class="text-sm text-gray-400">Keine geplanten Geschenke</p>
        </div>

        <!-- Aufgaben -->
        <div>
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Aufgaben</h2>
          <div class="space-y-2">
            <div
              v-for="aufgabe in aufgaben"
              :key="aufgabe.id"
              class="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3"
            >
              <label class="flex items-center gap-3 cursor-pointer flex-1">
                <input
                  type="checkbox"
                  :checked="aufgabe.erledigt"
                  @change="toggleAufgabe(aufgabe)"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span :class="['text-sm', aufgabe.erledigt ? 'text-gray-400 line-through' : 'text-gray-800']">
                  {{ aufgabe.titel }}
                </span>
              </label>
              <button @click="deleteAufgabe(aufgabe)" class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
          <!-- Add Task -->
          <div class="flex items-center gap-2 mt-3">
            <input
              v-model="neueAufgabe"
              @keyup.enter="addAufgabe"
              type="text"
              placeholder="Neue Aufgabe..."
              class="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
            />
            <button
              @click="addAufgabe"
              class="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
