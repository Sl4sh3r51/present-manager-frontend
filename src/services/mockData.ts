// src/services/mockData.ts
// Realistische Testdaten als Fallback wenn das Backend nicht erreichbar ist

import type { Interest, GeschenkIdee, Geschenk, Aufgabe, Anlass } from '@/types'

export const mockPersonen = [
  {
    id: 1,
    name: 'Anna Schmidt',
    geburtstag: '2025-02-14',
    status: 'AKTIV' as const,
    notizen: 'Liebt italienische Küche und Kriminalromane. Macht seit 2 Jahren Yoga.',
    hatIdeen: true,
    hatGekauft: true,
    geschenke: [
      { id: 101, titel: 'Kochbuch "Italien"', beschreibung: 'Authentische italienische Rezepte', anlassName: 'Geburtstag', status: 'GEKAUFT' as const, datum: '2025-02-14', imageUrl: '', purchaseDate: '2025-02-01' },
      { id: 102, titel: 'Yoga-Matte', beschreibung: 'Rutschfest, extra dick', anlassName: 'Weihnachten', status: 'VERSCHENKT' as const, datum: '2024-12-24', imageUrl: '', givenDate: '2024-12-24' }
    ]
  },
  {
    id: 2,
    name: 'Max Müller',
    geburtstag: '2025-01-25',
    status: 'AKTIV' as const,
    notizen: 'Spielt gerne Strategiespiele. Hat eine Sony Alpha Kamera.',
    hatIdeen: true,
    hatGekauft: false,
    geschenke: [
      { id: 201, titel: 'Kamera-Objektiv', beschreibung: '50mm Festbrennweite', anlassName: 'Geburtstag', status: 'GEPLANT' as const, datum: null, imageUrl: '' }
    ]
  },
  {
    id: 3,
    name: 'Lisa Weber',
    geburtstag: '2025-12-24',
    status: 'AKTIV' as const,
    notizen: 'Spielt Gitarre und plant eine Reise nach Japan.',
    hatIdeen: true,
    hatGekauft: false,
    geschenke: [
      { id: 301, titel: 'Reiseführer Japan', beschreibung: 'Lonely Planet', anlassName: 'Weihnachten', status: 'GEPLANT' as const, datum: null, imageUrl: '' }
    ]
  },
  {
    id: 4,
    name: 'Tom Fischer',
    geburtstag: '2025-03-10',
    status: 'AKTIV' as const,
    notizen: 'Technik-Fan, läuft regelmässig.',
    hatIdeen: false,
    hatGekauft: false,
    geschenke: []
  }
]

export const mockInterests: Interest[] = [
  { id: '1', personId: '1', name: 'Bücher' },
  { id: '2', personId: '1', name: 'Yoga' },
  { id: '3', personId: '1', name: 'Kochen' },
  { id: '4', personId: '2', name: 'Gaming' },
  { id: '5', personId: '2', name: 'Fotografie' },
  { id: '6', personId: '2', name: 'Wandern' },
  { id: '7', personId: '3', name: 'Musik' },
  { id: '8', personId: '3', name: 'Reisen' },
  { id: '9', personId: '3', name: 'Kunst' },
  { id: '10', personId: '4', name: 'Sport' },
  { id: '11', personId: '4', name: 'Technik' }
]

export const mockAnlaesse: Anlass[] = [
  { id: 1, name: 'Geburtstag', type: 'FEST', recurring: true, fixedMonth: null, fixedDay: null },
  { id: 2, name: 'Weihnachten', type: 'FEST', recurring: true, fixedMonth: 12, fixedDay: 24 },
  { id: 3, name: 'Silvester', type: 'FEST', recurring: true, fixedMonth: 12, fixedDay: 31 },
  { id: 4, name: 'Eigene Anlässe', type: 'BENUTZERDEFINIERT', recurring: false }
]

export const mockDashboardSummary = {
  naechsteGeburtstage: [
    { personId: 4, name: 'Tom Fischer', datum: '10.03.2025' },
    { personId: 1, name: 'Anna Schmidt', datum: '14.02.2025' }
  ],
  weihnachtsStatus: {
    ideen: 3,
    geplant: 1,
    gekauft: 1,
    verschenkt: 1
  },
  offeneAufgaben: [
    { id: 1, titel: 'Geschenk für Anna einpacken', personName: 'Anna Schmidt' },
    { id: 2, titel: 'Kamera-Objektiv bestellen', personName: 'Max Müller' },
    { id: 3, titel: 'Reiseführer recherchieren', personName: 'Lisa Weber' }
  ]
}

export const mockIdeen: Record<number, GeschenkIdee[]> = {
  1: [
    { id: 11, titel: 'Spa-Gutschein', beschreibung: 'Wellness-Tag im Hotel', link: null, notizen: null, imageUrl: '', source: 'manual' },
    { id: 12, titel: 'Krimibuch-Abo', beschreibung: '3 Monate Krimi-Buchbox', link: null, notizen: null, imageUrl: '', source: 'manual' }
  ],
  2: [
    { id: 21, titel: 'Gaming-Headset', beschreibung: 'Kabellos mit Noise-Cancelling', link: null, notizen: null, imageUrl: '', source: 'manual' }
  ],
  3: [
    { id: 31, titel: 'Gitarrensaiten-Set', beschreibung: 'Elixir Nanoweb', link: null, notizen: null, imageUrl: '', source: 'manual' },
    { id: 32, titel: 'Japanisch-Kurs', beschreibung: 'Online-Sprachkurs 6 Monate', link: null, notizen: null, imageUrl: '', source: 'manual' }
  ],
  4: []
}

export const mockGeschenke: Record<number, Geschenk[]> = {
  1: [
    { id: 101, titel: 'Kochbuch "Italien"', beschreibung: 'Authentische italienische Rezepte', anlassName: 'Geburtstag', status: 'GEKAUFT', datum: '2025-02-14', imageUrl: '', purchaseDate: '2025-02-01' },
    { id: 102, titel: 'Yoga-Matte', beschreibung: 'Rutschfest, extra dick', anlassName: 'Weihnachten', status: 'VERSCHENKT', datum: '2024-12-24', imageUrl: '', givenDate: '2024-12-24' }
  ],
  2: [
    { id: 201, titel: 'Kamera-Objektiv', beschreibung: '50mm Festbrennweite', anlassName: 'Geburtstag', status: 'GEPLANT', datum: null, imageUrl: '' }
  ],
  3: [
    { id: 301, titel: 'Reiseführer Japan', beschreibung: 'Lonely Planet', anlassName: 'Weihnachten', status: 'GEPLANT', datum: null, imageUrl: '' }
  ],
  4: []
}

export const mockAufgaben: Record<number, Aufgabe[]> = {
  1: [
    { id: 1, titel: 'Geschenk einpacken', erledigt: false },
    { id: 2, titel: 'Karte schreiben', erledigt: true }
  ],
  2: [
    { id: 3, titel: 'Kamera-Objektiv bestellen', erledigt: false },
    { id: 4, titel: 'Preise vergleichen', erledigt: false }
  ],
  3: [
    { id: 5, titel: 'Reiseführer recherchieren', erledigt: false }
  ],
  4: []
}
