<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import { useNotifications } from '@/composables/useNotifications'

const router = useRouter()
const { login } = useAuth()
const toast = useToast()
const { triggerLoginNotifications } = useNotifications()

const email = ref('')
const password = ref('')
const submitting = ref(false)
const errorMessage = ref('')

async function handleSubmit() {
  errorMessage.value = ''

  if (!email.value || !password.value) {
    errorMessage.value = 'Bitte E-Mail und Passwort eingeben.'
    return
  }

  submitting.value = true
  try {
    await login(email.value, password.value)
    await triggerLoginNotifications()
    toast.success('Erfolgreich angemeldet!')
    router.push('/')
  } catch (err: any) {
    errorMessage.value = err?.message || 'Ein Fehler ist aufgetreten.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
    <div class="w-full max-w-md">
      <div class="flex flex-col items-center mb-8">
        <div class="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4">
          <svg
            class="w-9 h-9 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            stroke-width="1.5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.25-9.75h18.5"
            />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-900">Geschenke-Manager</h1>
        <p class="text-sm text-gray-500 mt-1">Anmelden</p>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <form @submit.prevent="handleSubmit" class="space-y-5">
          <div
            v-if="errorMessage"
            class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3"
          >
            {{ errorMessage }}
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
            <input
              id="email"
              v-model="email"
              type="email"
              autocomplete="email"
              required
              class="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="name@beispiel.de"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1"
              >Passwort</label
            >
            <input
              id="password"
              v-model="password"
              type="password"
              autocomplete="current-password"
              required
              class="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Mindestens 6 Zeichen"
            />
          </div>

          <button
            type="submit"
            :disabled="submitting"
            class="w-full bg-blue-600 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {{ submitting ? 'Bitte warten...' : 'Anmelden' }}
          </button>
        </form>
      </div>
      <p class="text-center text-sm text-gray-500 mt-6">
        Noch kein Konto?
        <router-link to="/register" class="text-blue-600 hover:text-blue-700 font-medium"
          >Jetzt registrieren</router-link
        >
      </p>

      <p class="text-center text-xs text-gray-400 mt-8">Geschenke-Manager v1.0 · ISEF01 Projekt</p>
    </div>
  </div>
</template>
