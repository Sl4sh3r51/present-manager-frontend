<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { personsApi, giftIdeasApi, giftsApi, tasksApi, occasionsApi, personInterestsApi } from '@/services/api'
import { useToast } from '@/composables/useToast'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import GeschenkIdeeModal from '@/components/GeschenkIdeeModal.vue'
import GeschenkUebernehmenModal from '@/components/GeschenkUebernehmenModal.vue'
import type { Person, GiftIdea, Gift, Task, Occasion, Interest, GiftStatus } from '@/types'

const route = useRoute()
const router = useRouter()
const { success, error: showError } = useToast()

const person = ref<Person | null>(null)
const interests = ref<Interest[]>([])
const ideen = ref<GiftIdea[]>([])
const geschenke = ref<Gift[]>([])
const aufgaben = ref<Task[]>([])
const anlaesse = ref<Occasion[]>([])
const loading = ref(true)
const neueAufgabe = ref('')

const personId = computed(() => route.params.id as string)

const formattedGeburtstag = computed(() => {
  if (!person.value?.birthday) return ''
  return new Date(person.value.birthday).toLocaleDateString('de-DE', {
    day: '2-digit', month: 'long', year: 'numeric'
  })
})

function getOccasionName(occasionId: string | null): string {
  if (!occasionId) return 'Kein Anlass'
  const occasion = anlaesse.value.find(a => a.id === occasionId)
  return occasion?.name || 'Unbekannt'
}

const showIdeeModal = ref(false)
const editingIdee = ref<GiftIdea | null>(null)

function openAddIdee() {
  editingIdee.value = null
  showIdeeModal.value = true
}

function openEditIdee(idee: GiftIdea) {
  editingIdee.value = { ...idee }
  showIdeeModal.value = true
}

async function handleSaveIdee(data: { title: string; description: string | null; link: string | null; imageUrl?: string | null; occasionId?: string | null }) {
  try {
    if (editingIdee.value) {
      const res = await giftIdeasApi.update(editingIdee.value.id, {
        personId: personId.value,
        title: data.title,
        description: data.description,
        link: data.link,
        imageUrl: data.imageUrl || null,
        occasionId: data.occasionId || null,
        source: editingIdee.value.source
      })
      ideen.value = ideen.value.map(i => i.id === editingIdee.value!.id ? res.data : i)
      success('Geschenkidee wurde aktualisiert')
    } else {
      const res = await giftIdeasApi.create({
        personId: personId.value,
        title: data.title,
        description: data.description,
        link: data.link,
        imageUrl: data.imageUrl || null,
        occasionId: data.occasionId || null,
        source: 'MANUAL'
      })
      ideen.value = [...ideen.value, res.data]
      success('Geschenkidee wurde hinzugefügt')
    }
  } catch (err) {
    console.error('Fehler beim Speichern der Idee:', err)
    showError('Geschenkidee konnte nicht gespeichert werden')
  }
  showIdeeModal.value = false
  editingIdee.value = null
}

const showDeleteIdeeConfirm = ref(false)
const deletingIdeeId = ref<string | null>(null)

function openDeleteIdee(idee: GiftIdea) {
  deletingIdeeId.value = idee.id
  showDeleteIdeeConfirm.value = true
}

async function confirmDeleteIdee() {
  if (deletingIdeeId.value !== null) {
    try {
      await giftIdeasApi.delete(deletingIdeeId.value)
      ideen.value = ideen.value.filter(i => i.id !== deletingIdeeId.value)
      success('Geschenkidee wurde gelöscht')
    } catch (err) {
      console.error('Fehler beim Löschen der Idee:', err)
      showError('Geschenkidee konnte nicht gelöscht werden')
    }
  }
  showDeleteIdeeConfirm.value = false
  deletingIdeeId.value = null
}

const showUebernehmenModal = ref(false)
const uebernehmenIdee = ref<GiftIdea | null>(null)

function openUebernehmen(idee: GiftIdea) {
  uebernehmenIdee.value = { ...idee }
  showUebernehmenModal.value = true
}

async function handleUebernehmen(data: { title: string; description: string | null; occasionId: string; status: GiftStatus }) {
  try {
    const res = await giftsApi.create({
      personId: personId.value,
      occasionId: data.occasionId,
      giftIdeaId: uebernehmenIdee.value?.id || null,
      title: data.title,
      description: data.description,
      link: uebernehmenIdee.value?.link || null,
      imageUrl: uebernehmenIdee.value?.imageUrl || null,
      status: data.status
    })
    geschenke.value = [...geschenke.value, res.data]
    if (uebernehmenIdee.value) {
      try {
        await giftIdeasApi.delete(uebernehmenIdee.value.id)
      } catch (err) {
        console.error('Geschenkidee konnte nicht gelöscht werden:', err)
      }
      ideen.value = ideen.value.filter(i => i.id !== uebernehmenIdee.value!.id)
    }
    success('Idee wurde als Geschenk übernommen')
  } catch (err) {
    console.error('Fehler beim Übernehmen:', err)
    showError('Idee konnte nicht übernommen werden')
  }
  showUebernehmenModal.value = false
  uebernehmenIdee.value = null
}

const showDeleteGeschenkConfirm = ref(false)
const deletingGeschenkId = ref<string | null>(null)

function openDeleteGeschenk(geschenkId: string) {
  deletingGeschenkId.value = geschenkId
  showDeleteGeschenkConfirm.value = true
}

async function confirmDeleteGeschenk() {
  if (deletingGeschenkId.value !== null) {
    try {
      await giftsApi.delete(deletingGeschenkId.value)
      geschenke.value = geschenke.value.filter(g => g.id !== deletingGeschenkId.value)
      success('Geschenk wurde gelöscht')
    } catch (err) {
      console.error('Fehler beim Löschen des Geschenks:', err)
      showError('Geschenk konnte nicht gelöscht werden')
    }
  }
  showDeleteGeschenkConfirm.value = false
  deletingGeschenkId.value = null
}

async function updateGeschenkStatus(geschenkId: string, newStatus: GiftStatus) {
  try {
    const res = await giftsApi.updateStatus(geschenkId, newStatus)
    geschenke.value = geschenke.value.map(g => g.id === geschenkId ? res.data : g)
    success(`Status auf "${statusLabels[newStatus]}" gesetzt`)
  } catch (err) {
    console.error('Fehler beim Status-Update:', err)
    showError('Status konnte nicht aktualisiert werden')
  }
}

async function toggleAufgabe(aufgabe: Task) {
  try {
    const res = await tasksApi.toggle(aufgabe.id)
    aufgaben.value = aufgaben.value.map(a => a.id === aufgabe.id ? res.data : a)
  } catch (err) {
    console.error('Fehler beim Toggle:', err)
    showError('Aufgabe konnte nicht aktualisiert werden')
  }
}

async function addAufgabe() {
  if (!neueAufgabe.value.trim()) return
  try {
    const res = await tasksApi.create({
      personId: personId.value,
      title: neueAufgabe.value.trim(),
      isDone: false
    })
    aufgaben.value.push(res.data)
    neueAufgabe.value = ''
  } catch (err) {
    console.error('Fehler beim Erstellen der Aufgabe:', err)
    showError('Aufgabe konnte nicht erstellt werden')
  }
}

async function deleteAufgabe(aufgabe: Task) {
  try {
    await tasksApi.delete(aufgabe.id)
    aufgaben.value = aufgaben.value.filter(a => a.id !== aufgabe.id)
  } catch (err) {
    console.error('Fehler beim Löschen der Aufgabe:', err)
    showError('Aufgabe konnte nicht gelöscht werden')
  }
}

const vergangeneGeschenke = computed(() => geschenke.value.filter(g => g.status === 'GIFTED'))
const geplanteGeschenke = computed(() => geschenke.value.filter(g => g.status !== 'GIFTED'))

const statusButtons: GiftStatus[] = ['PLANNED', 'BOUGHT', 'GIFTED']
const statusLabels: Record<string, string> = { PLANNED: 'Geplant', BOUGHT: 'Gekauft', GIFTED: 'Verschenkt' }

onMounted(async () => {
  try {
    const [personRes, ideasRes, giftsRes, tasksRes, occasionsRes, interestsRes] = await Promise.all([
      personsApi.getById(personId.value),
      giftIdeasApi.getAll({ personId: personId.value }),
      giftsApi.getAll({ personId: personId.value }),
      tasksApi.getAll({ personId: personId.value }),
      occasionsApi.getAll(),
      personInterestsApi.getInterestsForPerson(personId.value)
    ])
    person.value = personRes.data
    ideen.value = ideasRes.data || []
    geschenke.value = giftsRes.data || []
    aufgaben.value = tasksRes.data || []
    anlaesse.value = occasionsRes.data || []
    interests.value = interestsRes.data || []
  } catch (err) {
    console.error('Fehler beim Laden der Personendetails:', err)
    showError('Personendetails konnten nicht geladen werden')
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="flex items-start justify-between mb-8">
      <div class="flex items-start gap-4">
        <button @click="router.push('/personen')" class="mt-1 p-2 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer">
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div v-if="person">
          <h1 class="text-2xl font-bold text-gray-900">{{ person.name }}</h1>
          <p class="text-sm text-gray-500 mt-0.5">Geburtstag: {{ formattedGeburtstag }}</p>
          <div v-if="interests.length" class="flex flex-wrap gap-2 mt-2">
            <span
              v-for="interest in interests"
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
          class="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Idee hinzufügen
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
        <div v-if="person.notes" class="bg-blue-50 border border-blue-100 rounded-2xl p-5">
          <h3 class="text-sm font-semibold text-blue-900 mb-1">Notizen</h3>
          <p class="text-sm text-blue-800">{{ person.notes }}</p>
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
                  <p class="font-medium text-gray-900 text-sm">{{ g.title }}</p>
                  <p class="text-xs text-gray-500">{{ g.description }}</p>
                  <p class="text-xs text-gray-400">Anlass: {{ getOccasionName(g.occasionId) }}</p>
                </div>
              </div>
              <span class="text-xs text-gray-400">{{ g.givenDate }}</span>
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
                <h4 class="font-medium text-gray-900 text-sm">{{ idee.title }}</h4>
                <div class="flex items-center gap-1">
                  <button type="button" @click.stop="openEditIdee(idee)" class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                    <svg class="w-3.5 h-3.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button type="button" @click.stop="openDeleteIdee(idee)" class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer">
                    <svg class="w-3.5 h-3.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              <p v-if="idee.description" class="text-xs text-gray-500 mb-1">{{ idee.description }}</p>
              <a v-if="idee.link" :href="idee.link" target="_blank" @click.stop class="text-xs text-blue-600 hover:underline">Link öffnen</a>
              <button
                type="button"
                @click.stop="openUebernehmen(idee)"
                class="w-full mt-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer"
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
                  <h4 class="font-medium text-gray-900 text-sm">{{ g.title }}</h4>
                  <p v-if="g.description" class="text-xs text-gray-500">{{ g.description }}</p>
                  <p class="text-xs text-gray-400">Anlass: {{ getOccasionName(g.occasionId) }}</p>
                </div>
                <button type="button" @click.stop="openDeleteGeschenk(g.id)" class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer">
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
                    'flex-1 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer',
                    g.status === s
                      ? (s === 'PLANNED' ? 'bg-blue-600 text-white' : s === 'BOUGHT' ? 'bg-emerald-600 text-white' : 'bg-purple-600 text-white')
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
                  :checked="aufgabe.isDone"
                  @change="toggleAufgabe(aufgabe)"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span :class="['text-sm', aufgabe.isDone ? 'text-gray-400 line-through' : 'text-gray-800']">
                  {{ aufgabe.title }}
                </span>
              </label>
              <button @click="deleteAufgabe(aufgabe)" class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer">
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
              class="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors cursor-pointer"
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
