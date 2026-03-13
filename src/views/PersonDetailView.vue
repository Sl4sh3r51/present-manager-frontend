<!-- src/views/PersonDetailView.vue -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { mockPersonen, mockIdeen, mockGeschenke, mockAufgaben, mockAnlaesse, mockInterests } from '@/services/mockData'
import { useToast } from '@/composables/useToast'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import GeschenkIdeeModal from '@/components/GeschenkIdeeModal.vue'
import GeschenkUebernehmenModal from '@/components/GeschenkUebernehmenModal.vue'
import type { Person, Geschenk, GeschenkIdee, Aufgabe, Anlass, Interest } from '@/types'

const route = useRoute()
const router = useRouter()
const { success } = useToast()

let nextAufgabeId = 100

const person = ref<Person | null>(null)
const interests = ref<Interest[]>([])
const ideen = ref<GeschenkIdee[]>([])
const geschenke = ref<Geschenk[]>([])
const aufgaben = ref<Aufgabe[]>([])
const anlaesse = ref<Anlass[]>([])
const loading = ref(true)
const neueAufgabe = ref('')

const personId = computed(() => route.params.id as string)

const formattedGeburtstag = computed(() => {
  if (!person.value?.geburtstag) return ''
  return new Date(person.value.geburtstag).toLocaleDateString('de-DE', {
    day: '2-digit', month: 'long', year: 'numeric'
  })
})

const personInterests = computed(() => interests.value.filter(i => i.personId === personId.value))

// --- Idee Modal State ---
const showIdeeModal = ref(false)
const editingIdee = ref<GeschenkIdee | null>(null)

function openAddIdee() {
  console.log('[DEBUG] openAddIdee called')
  editingIdee.value = null
  showIdeeModal.value = true
}

function openEditIdee(idee: GeschenkIdee) {
  console.log('[DEBUG] openEditIdee called', idee.id, idee.titel)
  editingIdee.value = { ...idee }
  showIdeeModal.value = true
}

function handleSaveIdee(data: { titel: string; beschreibung: string; link: string | null; notizen: string | null; imageUrl?: string; occasionId?: number }) {
  if (editingIdee.value) {
    ideen.value = ideen.value.map(i =>
      i.id === editingIdee.value!.id
        ? { ...i, titel: data.titel, beschreibung: data.beschreibung, link: data.link, notizen: data.notizen, imageUrl: data.imageUrl || '', occasionId: data.occasionId }
        : i
    )
    success('Geschenkidee wurde aktualisiert')
  } else {
    const newIdee: GeschenkIdee = {
      id: Date.now(),
      titel: data.titel,
      beschreibung: data.beschreibung,
      link: data.link,
      notizen: data.notizen,
      imageUrl: data.imageUrl || '',
      occasionId: data.occasionId,
      source: 'manual'
    }
    ideen.value = [...ideen.value, newIdee]
    success('Geschenkidee wurde hinzugefügt')
  }
  showIdeeModal.value = false
  editingIdee.value = null
}

// --- Delete Idee Confirm ---
const showDeleteIdeeConfirm = ref(false)
const deletingIdeeId = ref<number | null>(null)

function openDeleteIdee(idee: GeschenkIdee) {
  console.log('[DEBUG] openDeleteIdee called', idee.id, idee.titel)
  deletingIdeeId.value = idee.id
  showDeleteIdeeConfirm.value = true
}

function confirmDeleteIdee() {
  if (deletingIdeeId.value !== null) {
    ideen.value = ideen.value.filter(i => i.id !== deletingIdeeId.value)
    success('Geschenkidee wurde gelöscht')
  }
  showDeleteIdeeConfirm.value = false
  deletingIdeeId.value = null
}

// --- Übernehmen Modal State ---
const showUebernehmenModal = ref(false)
const uebernehmenIdee = ref<GeschenkIdee | null>(null)

function openUebernehmen(idee: GeschenkIdee) {
  console.log('[DEBUG] openUebernehmen called', idee.id, idee.titel)
  uebernehmenIdee.value = { ...idee }
  showUebernehmenModal.value = true
}

function handleUebernehmen(data: { titel: string; beschreibung: string; anlassName: string; datum: string | null; status: string }) {
  const now = new Date().toISOString().split('T')[0]
  const newGeschenk: Geschenk = {
    id: Date.now(),
    titel: data.titel,
    beschreibung: data.beschreibung,
    anlassName: data.anlassName,
    status: data.status as Geschenk['status'],
    datum: data.datum,
    imageUrl: uebernehmenIdee.value?.imageUrl || '',
    giftIdeaId: uebernehmenIdee.value?.id,
    purchaseDate: data.status === 'GEKAUFT' ? now : undefined,
    givenDate: data.status === 'VERSCHENKT' ? now : undefined
  }
  geschenke.value = [...geschenke.value, newGeschenk]
  if (uebernehmenIdee.value) {
    ideen.value = ideen.value.filter(i => i.id !== uebernehmenIdee.value!.id)
  }
  success('Idee wurde als Geschenk übernommen')
  showUebernehmenModal.value = false
  uebernehmenIdee.value = null
}

// --- Delete Geschenk Confirm ---
const showDeleteGeschenkConfirm = ref(false)
const deletingGeschenkId = ref<number | null>(null)

function openDeleteGeschenk(geschenkId: number) {
  console.log('[DEBUG] openDeleteGeschenk called', geschenkId)
  deletingGeschenkId.value = geschenkId
  showDeleteGeschenkConfirm.value = true
}

function confirmDeleteGeschenk() {
  if (deletingGeschenkId.value !== null) {
    geschenke.value = geschenke.value.filter(g => g.id !== deletingGeschenkId.value)
    success('Geschenk wurde gelöscht')
  }
  showDeleteGeschenkConfirm.value = false
  deletingGeschenkId.value = null
}

// --- Status ---
function updateGeschenkStatus(geschenkId: number, newStatus: Geschenk['status']) {
  console.log('[DEBUG] updateGeschenkStatus called', geschenkId, newStatus)
  const now = new Date().toISOString().split('T')[0]
  geschenke.value = geschenke.value.map(g => {
    if (g.id !== geschenkId) return g
    return {
      ...g,
      status: newStatus,
      purchaseDate: newStatus === 'GEKAUFT' ? now : g.purchaseDate,
      givenDate: newStatus === 'VERSCHENKT' ? now : g.givenDate
    }
  })
  success(`Status auf "${statusLabels[newStatus]}" gesetzt`)
}

// --- Aufgaben ---
function toggleAufgabe(aufgabe: Aufgabe) {
  aufgabe.erledigt = !aufgabe.erledigt
}

function addAufgabe() {
  if (!neueAufgabe.value.trim()) return
  aufgaben.value.push({
    id: nextAufgabeId++,
    titel: neueAufgabe.value.trim(),
    erledigt: false
  })
  neueAufgabe.value = ''
}

function deleteAufgabe(aufgabe: Aufgabe) {
  aufgaben.value = aufgaben.value.filter(a => a.id !== aufgabe.id)
}

// --- Computed ---
const vergangeneGeschenke = computed(() => geschenke.value.filter(g => g.status === 'VERSCHENKT'))
const geplanteGeschenke = computed(() => geschenke.value.filter(g => g.status !== 'VERSCHENKT'))

const statusButtons: Geschenk['status'][] = ['GEPLANT', 'GEKAUFT', 'VERSCHENKT']
const statusLabels: Record<string, string> = { GEPLANT: 'Geplant', GEKAUFT: 'Gekauft', VERSCHENKT: 'Verschenkt' }

onMounted(() => {
  const id = Number(personId.value)
  person.value = (mockPersonen.find(p => p.id === id) || mockPersonen[0]) as Person
  interests.value = [...mockInterests]
  ideen.value = [...(mockIdeen[id] || [])]
  geschenke.value = [...(mockGeschenke[id] || [])]
  aufgaben.value = [...(mockAufgaben[id] || [])]
  anlaesse.value = [...mockAnlaesse]
  loading.value = false
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
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
          <div v-if="personInterests.length" class="flex flex-wrap gap-2 mt-2">
            <span
              v-for="interest in personInterests"
              :key="interest.id"
              class="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full"
            >
              {{ interest.name }}
            </span>
          </div>
        </div>
        <div v-else-if="!loading">
          <h1 class="text-2xl font-bold text-gray-900">Person nicht gefunden</h1>
        </div>
      </div>

      <div v-if="person" class="flex items-center gap-2">
        <button
          type="button"
          @click.stop="openAddIdee"
          class="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
        >
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
                  <button type="button" @click.stop="openEditIdee(idee)" class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <svg class="w-3.5 h-3.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button type="button" @click.stop="openDeleteIdee(idee)" class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <svg class="w-3.5 h-3.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              <p v-if="idee.beschreibung" class="text-xs text-gray-500 mb-1">{{ idee.beschreibung }}</p>
              <p v-if="idee.notizen" class="text-xs text-gray-400 italic mb-1">{{ idee.notizen }}</p>
              <a v-if="idee.link" :href="idee.link" target="_blank" @click.stop class="text-xs text-blue-600 hover:underline">Link öffnen</a>
              <button
                type="button"
                @click.stop="openUebernehmen(idee)"
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
                <button type="button" @click.stop="openDeleteGeschenk(g.id)" class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <svg class="w-3.5 h-3.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <!-- Status Buttons -->
              <div class="flex gap-2 mt-3">
                <button
                  v-for="s in statusButtons"
                  :key="s"
                  type="button"
                  @click.stop="updateGeschenkStatus(g.id, s)"
                  :class="[
                    'flex-1 py-1.5 text-xs font-medium rounded-lg transition-all',
                    g.status === s
                      ? (s === 'GEPLANT' ? 'bg-blue-600 text-white' : s === 'GEKAUFT' ? 'bg-emerald-600 text-white' : 'bg-purple-600 text-white')
                      : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                  ]"
                >
                  {{ statusLabels[s] }}
                </button>
              </div>
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

    <!-- Modals -->
    <GeschenkIdeeModal
      :show="showIdeeModal"
      :idee="editingIdee"
      :anlaesse="anlaesse"
      @save="handleSaveIdee"
      @cancel="showIdeeModal = false"
    />

    <GeschenkUebernehmenModal
      :show="showUebernehmenModal"
      :idee="uebernehmenIdee"
      :anlaesse="anlaesse"
      @save="handleUebernehmen"
      @cancel="showUebernehmenModal = false"
    />

    <ConfirmDialog
      :show="showDeleteIdeeConfirm"
      title="Geschenkidee löschen"
      message="Möchtest du diese Geschenkidee wirklich löschen?"
      confirm-text="Löschen"
      @confirm="confirmDeleteIdee"
      @cancel="showDeleteIdeeConfirm = false"
    />

    <ConfirmDialog
      :show="showDeleteGeschenkConfirm"
      title="Geschenk löschen"
      message="Möchtest du dieses Geschenk wirklich löschen?"
      confirm-text="Löschen"
      @confirm="confirmDeleteGeschenk"
      @cancel="showDeleteGeschenkConfirm = false"
    />
  </div>
</template>
