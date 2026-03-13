export type PersonStatus = 'AKTIV' | 'ARCHIVIERT' | 'INAKTIV'
export type OccasionType = 'FEST' | 'BENUTZERDEFINIERT'
export type GiftSource = 'manual' | 'ai' | 'shared'

export interface Person {
  id: number
  name: string
  geburtstag: string
  status: PersonStatus
  notizen: string
  hatIdeen: boolean
  hatGekauft: boolean
  geschenke: Geschenk[]
}

export interface Interest {
  id: string
  personId: string
  name: string
  createdAt?: string
  updatedAt?: string
}

export interface Geschenk {
  id: number
  titel: string
  beschreibung: string
  anlassName: string
  status: 'GEPLANT' | 'GEKAUFT' | 'VERSCHENKT'
  datum: string | null
  imageUrl?: string
  giftIdeaId?: number
  purchaseDate?: string
  givenDate?: string
}

export interface GeschenkIdee {
  id: number
  titel: string
  beschreibung: string
  link: string | null
  notizen: string | null
  imageUrl?: string
  occasionId?: number
  source: GiftSource
}

export interface Aufgabe {
  id: number
  titel: string
  erledigt: boolean
}

export interface Anlass {
  id: number
  name: string
  type: OccasionType
  recurring: boolean
  fixedMonth?: number | null
  fixedDay?: number | null
}

export interface DashboardSummary {
  naechsteGeburtstage: { personId: number; name: string; datum: string }[]
  weihnachtsStatus: { ideen: number; geplant: number; gekauft: number; verschenkt: number }
  offeneAufgaben: { id: number; titel: string; personName: string }[]
}
