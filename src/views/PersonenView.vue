<!-- src/views/PersonenView.vue -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { personenApi } from '@/services/api'
import { mockPersonen } from '@/services/mockData'
import { useToast } from '@/composables/useToast'
import type { Person } from '@/types'
import PersonCard from '@/components/PersonCard.vue'
import PersonModal from '@/components/PersonModal.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const router = useRouter()
const { success, error: showError } = useToast()

const personen = ref<Person[]>([])
const loading = ref(true)
const searchQuery = ref('')
const activeFilter = ref('Alle')
const filters = ['Alle', 'Ideen', 'Gekauft']

// Modal State
const showPersonModal = ref(false)
const editingPerson = ref<Person | null>(null)

// Delete Dialog State
const showDeleteDialog = ref(false)
const deletingPerson = ref<Person | null>(null)

// Filtered & Searched Persons
const filteredPersonen = computed(() => {
  let result = personen.value

  // Search
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(p => p.name.toLowerCase().includes(q))
  }

  // Filter
  if (activeFilter.value === 'Ideen') {
    result = result.filter(p => p.hatIdeen)
  } else if (activeFilter.value === 'Gekauft') {
    result = result.filter(p => p.hatGekauft)
  }

  return result
})

onMounted(async () => {
  await loadPersonen()
})

async function loadPersonen() {
  loading.value = true
  try {
    const { data } = await personenApi.getAll()
    personen.value = data
  } catch {
    console.warn('Backend nicht erreichbar, verwende Mock-Daten')
    personen.value = mockPersonen
  } finally {
    loading.value = false
  }
}

function openCreateModal() {
  editingPerson.value = null
  showPersonModal.value = true
}

function openEditModal(person: Person) {
  editingPerson.value = person
  showPersonModal.value = true
}

function openDeleteDialog(person: Person) {
  deletingPerson.value = person
  showDeleteDialog.value = true
}

async function handleSavePerson(data: Partial<Person>) {
  try {
    if (editingPerson.value) {
      await personenApi.update(editingPerson.value.id, data)
      success('Person wurde aktualisiert')
    } else {
      await personenApi.create(data)
      success('Person wurde erfolgreich angelegt')
    }
    showPersonModal.value = false
    await loadPersonen()
  } catch {
    showError('Vorgang fehlgeschlagen')
  }
}

async function handleDeletePerson() {
  try {
    await personenApi.delete(deletingPerson.value!.id)
    success(`${deletingPerson.value!.name} wurde gelöscht`)
    showDeleteDialog.value = false
    await loadPersonen()
  } catch {
    showError('Person konnte nicht gelöscht werden')
  }
}

function navigateToDetail(person: Person) {
  router.push(`/personen/${person.id}`)
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-2">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Personen</h1>
        <p class="text-sm text-gray-500">{{ filteredPersonen.length }} von {{ personen.length }} Personen</p>
      </div>
      <button
        @click="openCreateModal"
        class="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Person hinzufügen
      </button>
    </div>

    <!-- Search & Filter Bar -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-6 mb-6">
      <div class="relative flex-1">
        <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Person suchen..."
          class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
        />
      </div>
      <div class="flex gap-1 bg-gray-100 rounded-xl p-1">
        <button
          v-for="f in filters"
          :key="f"
          @click="activeFilter = f"
          :class="[
            'px-4 py-2 text-sm font-medium rounded-lg transition-all',
            activeFilter === f
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          ]"
        >
          {{ f }}
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredPersonen.length === 0" class="text-center py-20">
      <div class="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-gray-900 mb-1">Keine Personen gefunden</h3>
      <p class="text-sm text-gray-500 mb-4">Lege eine neue Person an, um loszulegen.</p>
      <button @click="openCreateModal" class="text-sm text-blue-600 font-medium hover:text-blue-700">
        + Person hinzufügen
      </button>
    </div>

    <!-- Person Cards Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <PersonCard
        v-for="person in filteredPersonen"
        :key="person.id"
        :person="person"
        @click="navigateToDetail"
        @edit="openEditModal"
        @delete="openDeleteDialog"
      />
    </div>
  </div>

  <!-- Create/Edit Modal -->
  <PersonModal
    :show="showPersonModal"
    :person="editingPerson ?? undefined"
    @save="handleSavePerson"
    @cancel="showPersonModal = false"
  />

  <!-- Delete Confirmation -->
  <ConfirmDialog
    :show="showDeleteDialog"
    title="Person löschen"
    :message="`Möchtest du '${deletingPerson?.name}' wirklich löschen? Alle zugehörigen Geschenke und Aufgaben werden ebenfalls gelöscht.`"
    @confirm="handleDeletePerson"
    @cancel="showDeleteDialog = false"
  />
</template>
