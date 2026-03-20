import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '@/services/supabase'
import DashboardView from '@/views/DashboardView.vue'
import PersonenView from '@/views/PersonenView.vue'
import PersonDetailView from '@/views/PersonDetailView.vue'
import AnlaesseView from '@/views/AnlaesseView.vue'
import UebersichtView from '@/views/UebersichtView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'

const routes = [
  { path: '/login', name: 'Login', component: LoginView, meta: { requiresAuth: false } },
  { path: '/', name: 'Dashboard', component: DashboardView, meta: { requiresAuth: true } },
  { path: '/personen', name: 'Personen', component: PersonenView, meta: { requiresAuth: true } },
  { path: '/personen/:id', name: 'PersonDetail', component: PersonDetailView, props: true, meta: { requiresAuth: true } },
  { path: '/anlaesse', name: 'Anlaesse', component: AnlaesseView, meta: { requiresAuth: true } },
  { path: '/uebersicht', name: 'Uebersicht', component: UebersichtView, meta: { requiresAuth: true } },
  { path: '/register', name: 'Register', component: RegisterView, meta: { requiresAuth: false } },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach(async (to) => {
  const { data: { session } } = await supabase.auth.getSession()
  const isAuthenticated = !!session
  if (to.meta.requiresAuth && !isAuthenticated) return { name: 'Login' }
  if (to.name === 'Login' && isAuthenticated) return { name: 'Dashboard' }
})

export default router
