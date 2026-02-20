<!-- src/views/AnlaesseView.vue -->
<script setup>
import { ref, computed, onMounted } from 'vue'
import { anlaesseApi } from '@/services/api'
import { mockAnlaesse } from '@/services/mockData'
import { useToast } from '@/composables/useToast'
import AnlassModal from '@/components/AnlassModal.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const { success, error: showError } = useToast()

const anlaesse = ref([])
const loading = ref(true)

// Modal State
const showAnlassModal = ref(false)
const editingAnlass = ref(null)

// Delete Dialog
const showDeleteDialog = ref(false)
const deletingAnlass = ref(null)

const festeAnlaesse = computed(() => anlaesse.value.filter(a => a.fest))
const benutzerdefinierteAnlaesse = computed(() => anlaesse.value.filter(a => !a.fest))

const totalCount = computed(() => anlaesse.value.length)
const festCount = computed(() => festeAnlaesse.value.length)
const customCount = computed(() => benutzerdefinierteAnlaesse.value.length)

onMounted(async () => {
  await loadAnlaesse()
})

async function loadAnlaesse() {
  loading.value = true
  try {
    const { data } = await anlaesseApi.getAll()
    anlaesse.value = data
  } catch (e) {
    console.warn('Backend nicht erreichbar, verwende Mock-Daten')
    anlaesse.value = mockAnlaesse
  } finally {
    loading.value = false
  }
}

function openCreateModal() {
  editingAnlass.value = null
  showAnlassModal.value = true
}

function openEditModal(anlass) {
  editingAnlass.value = anlass
  showAnlassModal.value = true
}

function openDeleteDialog(anlass) {
  deletingAnlass.value = anlass
  showDeleteDialog.value = true
}

async function handleSaveAnlass(data) {
  try {
    if (editingAnlass.value) {
      await anlaesseApi.update(editingAnlass.value.id, data)
      success('Anlass wurde aktualisiert')
    } else {
      await anlaesseApi.create(data)
      success('Anlass wurde erstellt')
    }
    showAnlassModal.value = false
    await loadAnlaesse()
  } catch (e) {
    showError('Vorgang fehlgeschlagen')
  }
}

async function handleDeleteAnlass() {
  try {
    await anlaesseApi.delete(deletingAnlass.value.id)
    success(`"${deletingAnlass.value.name}" wurde gelöscht`)
    showDeleteDialog.value = false
    await loadAnlaesse()
  } catch (e) {
    showError('Anlass konnte nicht gelöscht werden')
  }
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-2">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Anlässe verwalten</h1>
        <p class="text-sm text-gray-500">{{ totalCount }} Anlässe ({{ festCount }} fest, {{ customCount }} benutzerdefiniert)</p>
      </div>
      <button
        @click="openCreateModal"
        class="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Anlass hinzufügen
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
    </div>

    <div v-else class="mt-8 space-y-8">
      <!-- Feste Anlässe -->
      <div>
        <div class="flex items-center gap-2 mb-4">
          <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h2 class="text-base font-semibold text-gray-900">Feste Anlässe</h2>
          <span class="text-sm text-gray-400">(nicht löschbar)</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="anlass in festeAnlaesse"
            :key="anlass.id"
            class="bg-white border border-gray-200 rounded-2xl p-5 flex items-center justify-between"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span class="font-medium text-gray-900">{{ anlass.name }}</span>
            </div>
            <span class="text-xs font-medium px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full">Fest</span>
          </div>
        </div>
      </div>

      <!-- Benutzerdefinierte Anlässe -->
      <div>
        <div class="flex items-center gap-2 mb-4">
          <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h2 class="text-base font-semibold text-gray-900">Benutzerdefinierte Anlässe</h2>
        </div>

        <div v-if="benutzerdefinierteAnlaesse.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="anlass in benutzerdefinierteAnlaesse"
            :key="anlass.id"
            class="bg-white border border-gray-200 rounded-2xl p-5 flex items-center justify-between group"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span class="font-medium text-gray-900">{{ anlass.name }}</span>
            </div>
            <div class="flex items-center gap-1">
              <button
                @click="openEditModal(anlass)"
                class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                @click="openDeleteDialog(anlass)"
                class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-10">
          <p class="text-sm text-gray-400 mb-2">Noch keine benutzerdefinierten Anlässe</p>
          <button @click="openCreateModal" class="text-sm text-blue-600 font-medium hover:text-blue-700">
            + Anlass erstellen
          </button>
        </div>
      </div>

      <!-- Info Box -->
      <div class="bg-blue-50 border border-blue-100 rounded-2xl p-5">
        <div class="flex items-start gap-3">
          <div class="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span class="text-blue-700 text-xs font-bold">i</span>
          </div>
          <div>
            <h3 class="text-sm font-semibold text-blue-900 mb-2">Hinweise zu Anlässen</h3>
            <ul class="text-sm text-blue-800 space-y-1">
              <li>Feste Anlässe (Geburtstag, Weihnachten, etc.) können nicht bearbeitet oder gelöscht werden</li>
              <li>Benutzerdefinierte Anlässe können Sie nach Bedarf erstellen, bearbeiten und löschen</li>
              <li>Beim Anlegen eines Geschenks können Sie aus allen verfügbaren Anlässen wählen</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Create/Edit Modal -->
  <AnlassModal
    :show="showAnlassModal"
    :anlass="editingAnlass"
    @save="handleSaveAnlass"
    @cancel="showAnlassModal = false"
  />

  <!-- Delete Confirmation -->
  <ConfirmDialog
    :show="showDeleteDialog"
    title="Anlass löschen"
    :message="`Möchtest du den Anlass '${deletingAnlass?.name}' wirklich löschen?`"
    @confirm="handleDeleteAnlass"
    @cancel="showDeleteDialog = false"
  />
</template>
