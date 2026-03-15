import axios from 'axios'
import type { Person, Interest, Occasion, GiftIdea, Gift, Task, PersonStatus, OccasionType, GiftSource, GiftStatus } from '@/types'
import { supabase } from '@/services/supabase'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
})

apiClient.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }
  return config
}, (error) => Promise.reject(error))

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await supabase.auth.signOut()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// --- Persons ---

export const personsApi = {
  getAll(status?: PersonStatus) {
    return apiClient.get<Person[]>('/persons', { params: status ? { status } : {} })
  },
  getById(id: string) {
    return apiClient.get<Person>(`/persons/${id}`)
  },
  create(person: { name: string; status: PersonStatus; birthday?: string | null; notes?: string | null }) {
    return apiClient.post<Person>('/persons', person)
  },
  update(id: string, person: { name: string; status: PersonStatus; birthday?: string | null; notes?: string | null }) {
    return apiClient.put<Person>(`/persons/${id}`, person)
  },
  delete(id: string) {
    return apiClient.delete(`/persons/${id}`)
  },
  getBirthdaysToday() {
    return apiClient.get<Person[]>('/persons/birthdays/today')
  },
  getBirthdaysByMonth(month: number) {
    return apiClient.get<Person[]>(`/persons/birthdays/month/${month}`)
  },
  getCountByStatus(status: PersonStatus) {
    return apiClient.get<number>('/persons/stats/count', { params: { status } })
  }
}

// --- Interests ---

export const interestsApi = {
  getAll() {
    return apiClient.get<Interest[]>('/interests')
  },
  getById(id: string) {
    return apiClient.get<Interest>(`/interests/${id}`)
  },
  search(name: string) {
    return apiClient.get<Interest>('/interests/search', { params: { name } })
  },
  create(interest: { name: string }) {
    return apiClient.post<Interest>('/interests', interest)
  },
  delete(id: string) {
    return apiClient.delete(`/interests/${id}`)
  },
  exists(name: string) {
    return apiClient.get<boolean>('/interests/exists', { params: { name } })
  }
}

// --- Person-Interests ---

export const personInterestsApi = {
  getInterestsForPerson(personId: string) {
    return apiClient.get<Interest[]>('/person-interests/interests', { params: { personId } })
  },
  addInterest(personId: string, interestId: string) {
    return apiClient.post('/person-interests', null, { params: { personId, interestId } })
  },
  addBatch(personId: string, interestIds: string[]) {
    return apiClient.post('/person-interests/batch', interestIds, { params: { personId } })
  },
  replaceAll(personId: string, interestIds: string[]) {
    return apiClient.put('/person-interests/replace', interestIds, { params: { personId } })
  },
  removeInterest(personId: string, interestId: string) {
    return apiClient.delete('/person-interests', { params: { personId, interestId } })
  },
  removeAll(personId: string) {
    return apiClient.delete('/person-interests/all', { params: { personId } })
  },
  getCount(personId: string) {
    return apiClient.get<number>('/person-interests/count/person', { params: { personId } })
  }
}

// --- Occasions ---

export const occasionsApi = {
  getAll(type?: OccasionType) {
    return apiClient.get<Occasion[]>('/occasions', { params: type ? { type } : {} })
  },
  getById(id: string) {
    return apiClient.get<Occasion>(`/occasions/${id}`)
  },
  search(query: string) {
    return apiClient.get<Occasion[]>('/occasions/search', { params: { query } })
  },
  create(occasion: { name: string; type: OccasionType; isRecurring: boolean; fixedMonth?: number | null; fixedDay?: number | null }) {
    return apiClient.post<Occasion>('/occasions', occasion)
  },
  update(id: string, occasion: { name: string; type: OccasionType; isRecurring: boolean; fixedMonth?: number | null; fixedDay?: number | null }) {
    return apiClient.put<Occasion>(`/occasions/${id}`, occasion)
  },
  delete(id: string) {
    return apiClient.delete(`/occasions/${id}`)
  },
  getCountByType(type?: OccasionType) {
    return apiClient.get<number>('/occasions/stats/count', { params: type ? { type } : {} })
  }
}

// --- Gift Ideas ---

export const giftIdeasApi = {
  getAll(params?: { personId?: string; occasionId?: string; source?: GiftSource }) {
    return apiClient.get<GiftIdea[]>('/gift-ideas', { params })
  },
  getById(id: string) {
    return apiClient.get<GiftIdea>(`/gift-ideas/${id}`)
  },
  search(query: string) {
    return apiClient.get<GiftIdea[]>('/gift-ideas/search', { params: { query } })
  },
  getRecent() {
    return apiClient.get<GiftIdea[]>('/gift-ideas/recent')
  },
  create(giftIdea: { personId: string; occasionId?: string | null; title: string; description?: string | null; link?: string | null; imageUrl?: string | null; source?: GiftSource }) {
    return apiClient.post<GiftIdea>('/gift-ideas', { ...giftIdea, source: giftIdea.source || 'MANUAL' })
  },
  update(id: string, giftIdea: { personId: string; occasionId?: string | null; title: string; description?: string | null; link?: string | null; imageUrl?: string | null; source?: GiftSource }) {
    return apiClient.put<GiftIdea>(`/gift-ideas/${id}`, giftIdea)
  },
  delete(id: string) {
    return apiClient.delete(`/gift-ideas/${id}`)
  }
}

// --- Gifts ---

export const giftsApi = {
  getAll(params?: { personId?: string; occasionId?: string; status?: GiftStatus; giftIdeaId?: string }) {
    return apiClient.get<Gift[]>('/gifts', { params })
  },
  getById(id: string) {
    return apiClient.get<Gift>(`/gifts/${id}`)
  },
  search(query: string) {
    return apiClient.get<Gift[]>('/gifts/search', { params: { query } })
  },
  getRecent() {
    return apiClient.get<Gift[]>('/gifts/recent')
  },
  create(gift: { personId: string; occasionId: string; giftIdeaId?: string | null; title: string; description?: string | null; link?: string | null; imageUrl?: string | null; status?: GiftStatus; purchaseDate?: string | null; givenDate?: string | null }) {
    return apiClient.post<Gift>('/gifts', { ...gift, status: gift.status || 'PLANNED' })
  },
  createFromIdea(giftIdea: GiftIdea & { occasionId: string; status?: GiftStatus }) {
    return apiClient.post<Gift>('/gifts/gift-idea', giftIdea)
  },
  update(id: string, gift: Partial<Gift>) {
    return apiClient.put<Gift>(`/gifts/${id}`, gift)
  },
  updateStatus(id: string, status: GiftStatus) {
    return apiClient.patch<Gift>(`/gifts/${id}/status`, null, { params: { status } })
  },
  delete(id: string) {
    return apiClient.delete(`/gifts/${id}`)
  },
  checkGiftIdea(giftIdeaId: string) {
    return apiClient.get<boolean>(`/gifts/check-gift-idea/${giftIdeaId}`)
  }
}

// --- Tasks ---

export const tasksApi = {
  getAll(params?: { personId?: string; isDone?: boolean }) {
    return apiClient.get<Task[]>('/tasks', { params })
  },
  getById(id: string) {
    return apiClient.get<Task>(`/tasks/${id}`)
  },
  getOrdered() {
    return apiClient.get<Task[]>('/tasks/ordered')
  },
  getOpenByPerson(personId: string) {
    return apiClient.get<Task[]>(`/tasks/open/person/${personId}`)
  },
  create(task: { personId: string; title: string; isDone?: boolean }) {
    return apiClient.post<Task>('/tasks', { ...task, isDone: task.isDone ?? false })
  },
  toggle(id: string) {
    return apiClient.patch<Task>(`/tasks/${id}/toggle`)
  },
  markDone(id: string) {
    return apiClient.patch<Task>(`/tasks/${id}/done`)
  },
  markNotDone(id: string) {
    return apiClient.patch<Task>(`/tasks/${id}/not-done`)
  },
  delete(id: string) {
    return apiClient.delete(`/tasks/${id}`)
  },
  deleteCompleted() {
    return apiClient.delete('/tasks/completed')
  }
}

export default apiClient
