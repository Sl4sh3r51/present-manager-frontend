// src/services/api.js
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
  getById(id) {
    return apiClient.get(`/personen/${id}`)
  },
  create(person) {
    return apiClient.post('/personen', person)
  },
  update(id, person) {
    return apiClient.put(`/personen/${id}`, person)
  },
  delete(id) {
    return apiClient.delete(`/personen/${id}`)
  }
}

// ==================== Anlässe API ====================
export const anlaesseApi = {
  getAll() {
    return apiClient.get('/anlaesse')
  },
  getById(id) {
    return apiClient.get(`/anlaesse/${id}`)
  },
  create(anlass) {
    return apiClient.post('/anlaesse', anlass)
  },
  update(id, anlass) {
    return apiClient.put(`/anlaesse/${id}`, anlass)
  },
  delete(id) {
    return apiClient.delete(`/anlaesse/${id}`)
  }
}

// ==================== Geschenke API ====================
export const geschenkeApi = {
  getAllByPerson(personId) {
    return apiClient.get(`/personen/${personId}/geschenke`)
  },
  create(personId, geschenk) {
    return apiClient.post(`/personen/${personId}/geschenke`, geschenk)
  },
  update(personId, geschenkId, geschenk) {
    return apiClient.put(`/personen/${personId}/geschenke/${geschenkId}`, geschenk)
  },
  delete(personId, geschenkId) {
    return apiClient.delete(`/personen/${personId}/geschenke/${geschenkId}`)
  },
  updateStatus(personId, geschenkId, status) {
    return apiClient.patch(`/personen/${personId}/geschenke/${geschenkId}/status`, { status })
  }
}

// ==================== Geschenkideen API ====================
export const ideenApi = {
  getAllByPerson(personId) {
    return apiClient.get(`/personen/${personId}/ideen`)
  },
  create(personId, idee) {
    return apiClient.post(`/personen/${personId}/ideen`, idee)
  },
  update(personId, ideeId, idee) {
    return apiClient.put(`/personen/${personId}/ideen/${ideeId}`, idee)
  },
  delete(personId, ideeId) {
    return apiClient.delete(`/personen/${personId}/ideen/${ideeId}`)
  },
  convertToGeschenk(personId, ideeId, geschenkData) {
    return apiClient.post(`/personen/${personId}/ideen/${ideeId}/convert`, geschenkData)
  }
}

// ==================== Aufgaben API ====================
export const aufgabenApi = {
  getAllByPerson(personId) {
    return apiClient.get(`/personen/${personId}/aufgaben`)
  },
  create(personId, aufgabe) {
    return apiClient.post(`/personen/${personId}/aufgaben`, aufgabe)
  },
  toggle(personId, aufgabeId) {
    return apiClient.patch(`/personen/${personId}/aufgaben/${aufgabeId}/toggle`)
  },
  delete(personId, aufgabeId) {
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
