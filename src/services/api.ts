// src/services/api.ts
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 3000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request-Interceptor: JWT-Token aus Supabase Session anhängen
apiClient.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response-Interceptor: Fehlerbehandlung
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ==================== Personen API ====================
export const personenApi = {
  getAll() {
    return apiClient.get('/personen')
  },
  getById(id: number | string) {
    return apiClient.get(`/personen/${id}`)
  },
  create(person: Record<string, unknown>) {
    return apiClient.post('/personen', person)
  },
  update(id: number | string, person: Record<string, unknown>) {
    return apiClient.put(`/personen/${id}`, person)
  },
  delete(id: number | string) {
    return apiClient.delete(`/personen/${id}`)
  }
}

// ==================== Anlässe API ====================
export const anlaesseApi = {
  getAll() {
    return apiClient.get('/anlaesse')
  },
  getById(id: number | string) {
    return apiClient.get(`/anlaesse/${id}`)
  },
  create(anlass: Record<string, unknown>) {
    return apiClient.post('/anlaesse', anlass)
  },
  update(id: number | string, anlass: Record<string, unknown>) {
    return apiClient.put(`/anlaesse/${id}`, anlass)
  },
  delete(id: number | string) {
    return apiClient.delete(`/anlaesse/${id}`)
  }
}

// ==================== Geschenke API ====================
export const geschenkeApi = {
  getAllByPerson(personId: number | string) {
    return apiClient.get(`/personen/${personId}/geschenke`)
  },
  create(personId: number | string, geschenk: Record<string, unknown>) {
    return apiClient.post(`/personen/${personId}/geschenke`, geschenk)
  },
  update(personId: number | string, geschenkId: number | string, geschenk: Record<string, unknown>) {
    return apiClient.put(`/personen/${personId}/geschenke/${geschenkId}`, geschenk)
  },
  delete(personId: number | string, geschenkId: number | string) {
    return apiClient.delete(`/personen/${personId}/geschenke/${geschenkId}`)
  },
  updateStatus(personId: number | string, geschenkId: number | string, status: string) {
    return apiClient.patch(`/personen/${personId}/geschenke/${geschenkId}/status`, { status })
  }
}

// ==================== Geschenkideen API ====================
export const ideenApi = {
  getAllByPerson(personId: number | string) {
    return apiClient.get(`/personen/${personId}/ideen`)
  },
  create(personId: number | string, idee: Record<string, unknown>) {
    return apiClient.post(`/personen/${personId}/ideen`, idee)
  },
  update(personId: number | string, ideeId: number | string, idee: Record<string, unknown>) {
    return apiClient.put(`/personen/${personId}/ideen/${ideeId}`, idee)
  },
  delete(personId: number | string, ideeId: number | string) {
    return apiClient.delete(`/personen/${personId}/ideen/${ideeId}`)
  },
  convertToGeschenk(personId: number | string, ideeId: number | string, geschenkData: Record<string, unknown>) {
    return apiClient.post(`/personen/${personId}/ideen/${ideeId}/convert`, geschenkData)
  }
}

// ==================== Aufgaben API ====================
export const aufgabenApi = {
  getAllByPerson(personId: number | string) {
    return apiClient.get(`/personen/${personId}/aufgaben`)
  },
  create(personId: number | string, aufgabe: Record<string, unknown>) {
    return apiClient.post(`/personen/${personId}/aufgaben`, aufgabe)
  },
  toggle(personId: number | string, aufgabeId: number | string) {
    return apiClient.patch(`/personen/${personId}/aufgaben/${aufgabeId}/toggle`)
  },
  delete(personId: number | string, aufgabeId: number | string) {
    return apiClient.delete(`/personen/${personId}/aufgaben/${aufgabeId}`)
  }
}

// ==================== Dashboard API ====================
export const dashboardApi = {
  getSummary() {
    return apiClient.get('/dashboard/summary')
  }
}

export default apiClient
