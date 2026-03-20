<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppNavbar from '@/components/AppNavbar.vue'
import ToastContainer from '@/components/ToastContainer.vue'

const route = useRoute()
const showNavbar = computed(() => route.name !== 'Login' && route.name !== 'Register')
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <AppNavbar v-if="showNavbar" />
    <main><router-view /></main>
    <ToastContainer />
    <footer v-if="showNavbar" class="border-t border-gray-200 bg-white mt-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center">
        <p class="text-xs text-gray-400">Geschenke-Manager v1.0 · ISEF01 Projekt</p>
      </div>
    </footer>
  </div>
</template>
