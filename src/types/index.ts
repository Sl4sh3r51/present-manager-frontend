export type PersonStatus = 'NONE' | 'IDEAS' | 'PLANNED' | 'COMPLETED'
export type OccasionType = 'FIXED' | 'CUSTOM'
export type GiftSource = 'MANUAL' | 'AI' | 'SHARED'
export type GiftStatus = 'PLANNED' | 'BOUGHT' | 'GIFTED'

export interface Person {
  id: string
  name: string
  status: PersonStatus
  birthday: string | null
  notes: string | null
  createdAt?: string
  updatedAt?: string
}

export interface Interest {
  id: string
  name: string
  createdAt?: string
  updatedAt?: string
}

export interface Occasion {
  id: string
  name: string
  type: OccasionType
  isRecurring: boolean
  fixedMonth: number | null
  fixedDay: number | null
  createdAt?: string
  updatedAt?: string
}

export interface GiftIdea {
  id: string
  personId: string
  occasionId: string | null
  title: string
  description: string | null
  link: string | null
  imageUrl: string | null
  source: GiftSource
  createdAt?: string
  updatedAt?: string
}

export interface Gift {
  id: string
  personId: string
  occasionId: string
  giftIdeaId: string | null
  title: string
  description: string | null
  link: string | null
  imageUrl: string | null
  status: GiftStatus
  purchaseDate: string | null
  givenDate: string | null
  createdAt?: string
  updatedAt?: string
}

export interface Task {
  id: string
  personId: string
  title: string
  isDone: boolean
  createdAt?: string
  updatedAt?: string
}

export interface PersonInterest {
  id: {
    personId: string
    interestId: string
  }
}

export interface DashboardSummary {
  upcomingBirthdays: Person[]
  giftStats: {
    ideas: number
    planned: number
    bought: number
    gifted: number
  }
  openTasks: (Task & { personName?: string })[]
}
