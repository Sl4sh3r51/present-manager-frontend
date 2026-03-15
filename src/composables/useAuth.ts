import { ref, computed } from 'vue'
import { supabase } from '@/services/supabase'
import type { User, Session } from '@supabase/supabase-js'

const currentUser = ref<User | null>(null)
const currentSession = ref<Session | null>(null)
const loading = ref(true)

let initialized = false

async function initAuth() {
  if (initialized) return
  initialized = true

  const { data: { session } } = await supabase.auth.getSession()
  currentSession.value = session
  currentUser.value = session?.user ?? null
  loading.value = false

  supabase.auth.onAuthStateChange((_event, session) => {
    currentSession.value = session
    currentUser.value = session?.user ?? null
  })
}

export function useAuth() {
  initAuth()

  const isAuthenticated = computed(() => !!currentSession.value)
  const accessToken = computed(() => currentSession.value?.access_token ?? null)

  async function login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  async function register(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    return data
  }

  async function logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    currentUser.value = null
    currentSession.value = null
  }

  async function getAccessToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token ?? null
  }

  return {
    user: currentUser,
    session: currentSession,
    loading,
    isAuthenticated,
    accessToken,
    login,
    register,
    logout,
    getAccessToken
  }
}
