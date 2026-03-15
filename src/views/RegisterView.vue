<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const { register } = useAuth()
const toast = useToast()

const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const submitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

async function handleSubmit() {
  errorMessage.value = ''
  successMessage.value = ''

  if (!email.value || !password.value || !passwordConfirm.value) {
    errorMessage.value = 'Bitte alle Felder ausfüllen.'
    return
  }

  if (password.value.length < 6) {
    errorMessage.value = 'Das Passwort muss mindestens 6 Zeichen lang sein.'
    return
  }

  if (password.value !== passwordConfirm.value) {
    errorMessage.value = 'Die Passwörter stimmen nicht überein.'
    return
  }

  submitting.value = true
  try {
    await register(email.value, password.value)
    successMessage.value =
      'Konto erstellt!'
    toast.success('Registrierung erfolgreich!')
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
            stroke-width="1.5">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.25-9.75h18.5"
            />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-900">Geschenke-Manager</h1>
        <p class="text-sm text-gray-500 mt-1">Konto erstellen</p>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div
          v-if="successMessage"
          class="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 mb-5">
          {{ successMessage }}
        </div>

        <form v-if="!successMessage" @submit.prevent="handleSubmit" class="space-y-5">
          <div
            v-if="errorMessage"
            class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
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
              placeholder="name@beispiel.de" />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Passwort</label>
            <input
              id="password"
              v-model="password"
              type="password"
              autocomplete="new-password"
              required
              class="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Mindestens 6 Zeichen" />
          </div>

          <div>
            <label for="password-confirm" class="block text-sm font-medium text-gray-700 mb-1"
              >Passwort bestätigen</label
            >
            <input
              id="password-confirm"
              v-model="passwordConfirm"
              type="password"
              autocomplete="new-password"
              required
              class="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Passwort wiederholen" />
          </div>

          <button
            type="submit"
            :disabled="submitting"
            class="w-full bg-blue-600 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {{ submitting ? 'Bitte warten...' : 'Konto erstellen' }}
          </button>
        </form>

        <div v-if="successMessage" class="text-center">
          <button
            @click="router.push('/login')"
            class="w-full bg-blue-600 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
            Zum Login
          </button>
        </div>
      </div>

      <p class="text-center text-sm text-gray-500 mt-6">Bereits ein Konto?
        <router-link to="/login" class="text-blue-600 hover:text-blue-700 font-medium">Jetzt anmelden</router-link>
      </p>

      <p class="text-center text-xs text-gray-400 mt-4">Geschenke-Manager v1.0 · ISEF01 Projekt</p>
    </div>
  </div>
</template>
