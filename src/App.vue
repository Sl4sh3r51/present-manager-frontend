<!-- src/App.vue -->
<script setup lang="ts">
import AppNavbar from '@/components/AppNavbar.vue'
import ToastContainer from '@/components/ToastContainer.vue'
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <AppNavbar />
    <main>
      <router-view />
    </main>
    <ToastContainer />

    <!-- Footer -->
    <footer class="border-t border-gray-200 bg-white mt-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center">
        <p class="text-xs text-gray-400">Geschenke-Manager v1.0 · ISEF01 Projekt</p>
      </div>
    </footer>
  </div>
</template>
