// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '@/views/DashboardView.vue'
import PersonenView from '@/views/PersonenView.vue'
import PersonDetailView from '@/views/PersonDetailView.vue'
import AnlaesseView from '@/views/AnlaesseView.vue'
import UebersichtView from '@/views/UebersichtView.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: DashboardView
  },
  {
    path: '/personen',
    name: 'Personen',
    component: PersonenView
  },
  {
    path: '/personen/:id',
    name: 'PersonDetail',
    component: PersonDetailView,
    props: true
  },
  {
    path: '/anlaesse',
    name: 'Anlaesse',
    component: AnlaesseView
  },
  {
    path: '/uebersicht',
    name: 'Uebersicht',
    component: UebersichtView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
