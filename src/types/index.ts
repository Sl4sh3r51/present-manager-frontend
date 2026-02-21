export interface Person {
  id: number
  name: string
  geburtstag: string
  interessen: string[]
  notizen: string
  hatIdeen: boolean
  hatGekauft: boolean
  geschenke: Geschenk[]
}

export interface Geschenk {
  id: number
  titel: string
  beschreibung: string
  anlassName: string
  status: string
  datum: string | null
  typ?: string
}

export interface GeschenkIdee {
  id: number
  titel: string
  beschreibung: string
  link: string | null
}

export interface Aufgabe {
  id: number
  titel: string
  erledigt: boolean
}

export interface Anlass {
  id: number
  name: string
  fest: boolean
}

export interface DashboardSummary {
  naechsteGeburtstage: { personId: number; name: string; datum: string }[]
  weihnachtsStatus: { ideen: number; geplant: number; gekauft: number; verschenkt: number }
  offeneAufgaben: { id: number; titel: string; personName: string }[]
}
