import { ref, computed } from 'vue'
import { personsApi, occasionsApi, giftIdeasApi, giftsApi } from '@/services/api'

export type NotificationType = 'birthday' | 'christmas'

export interface AppNotification {
  id: string
  type: NotificationType
  personName: string
  occasion: string
  detail: string
  read: boolean
  createdAt: string
}

// Shared state
const notifications = ref<AppNotification[]>(loadFromStorage())

function loadFromStorage(): AppNotification[] {
  try {
    const raw = localStorage.getItem('gm_notifications')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveToStorage() {
  localStorage.setItem('gm_notifications', JSON.stringify(notifications.value))
}

export function useNotifications() {
  const unreadCount = computed(() => notifications.value.filter((n) => !n.read).length)

  function toggleRead(id: string) {
    const n = notifications.value.find((n) => n.id === id)
    if (n) {
      n.read = !n.read
      saveToStorage()
    }
  }

  function markAllAsRead() {
    notifications.value.forEach((n) => (n.read = true))
    saveToStorage()
  }

  async function triggerLoginNotifications() {
    const fresh: AppNotification[] = []

    const { data: persons } = await personsApi.getAll()
    const allPersons = persons ?? []

    const existingNames = new Set(allPersons.map((p) => p.name))
    notifications.value = notifications.value.filter(
      (n) =>
        n.type === 'christmas' || existingNames.has(n.personName),
    )
    saveToStorage()

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const in30Days = new Date(today)
    in30Days.setDate(today.getDate() + 30)

    for (const person of allPersons) {
      if (!person.birthday) continue

      const bday = new Date(person.birthday)
      const next = new Date(today.getFullYear(), bday.getMonth(), bday.getDate())

      // Wenn der Geburtstag dieses Jahr schon vorbei ist → nächstes Jahr nehmen
      // Vergleich gegen today (ohne Zeit) → "heute" bleibt korrekt im Fenster
      if (next < today) next.setFullYear(today.getFullYear() + 1)
      if (next > in30Days) continue

      const diffDays = Math.round((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      const detail =
        diffDays === 0 ? 'heute!' : `in ${diffDays} ${diffDays === 1 ? 'Tag' : 'Tagen'}`

      const alreadyExists = notifications.value.some(
        (n) => n.type === 'birthday' && n.personName === person.name,
      )
      if (!alreadyExists) {
        fresh.push({
          id: crypto.randomUUID(),
          type: 'birthday',
          personName: person.name,
          occasion: 'Geburtstag',
          detail,
          read: false,
          createdAt: new Date().toISOString(),
        })
      }
    }

    const month = today.getMonth() + 1 // getMonth() ist 0-basiert
    const day = today.getDate()
    const isChristmasSeason = month === 12 && day <= 24

    if (isChristmasSeason) {
      const { data: occasions } = await occasionsApi.getAll()
      const xmas = occasions?.find((o) => o.name.toLowerCase() === 'weihnachten')

      if (xmas) {
        const [{ data: ideas }, { data: gifts }] = await Promise.all([
          giftIdeasApi.getAll({ occasionId: xmas.id }),
          giftsApi.getAll({ occasionId: xmas.id }),
        ])

        const ideaCount = ideas?.length ?? 0
        const plannedCount = gifts?.filter((g) => g.status === 'PLANNED').length ?? 0
        const boughtCount = gifts?.filter((g) => g.status === 'BOUGHT').length ?? 0

        const alreadyExists = notifications.value.some((n) => n.type === 'christmas')
        if (!alreadyExists) {
          fresh.push({
            id: crypto.randomUUID(),
            type: 'christmas',
            personName: '',
            occasion: 'Weihnachten',
            detail: `${ideaCount} Ideen · ${plannedCount} geplant · ${boughtCount} gekauft`,
            read: false,
            createdAt: new Date().toISOString(),
          })
        }
      }
    }

    if (fresh.length > 0) {
      notifications.value = [...fresh, ...notifications.value]
      saveToStorage()
    }
  }

  return {
    notifications,
    unreadCount,
    toggleRead,
    markAllAsRead,
    triggerLoginNotifications,
  }
}
