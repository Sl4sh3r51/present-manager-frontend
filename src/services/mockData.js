// src/services/mockData.js
// Realistische Testdaten als Fallback wenn das Backend nicht erreichbar ist

export const mockPersonen = [
  {
    id: 1,
    name: 'Anna Schmidt',
    geburtstag: '2025-02-14',
    interessen: ['Bücher', 'Yoga', 'Kochen'],
    notizen: 'Liebt italienische Küche und Kriminalromane. Macht seit 2 Jahren Yoga.',
    hatIdeen: true,
    hatGekauft: true,
    geschenke: [
      { id: 101, titel: 'Kochbuch "Italien"', beschreibung: 'Authentische italienische Rezepte', anlassName: 'Geburtstag', status: 'GEKAUFT', datum: '2025-02-14' },
      { id: 102, titel: 'Yoga-Matte', beschreibung: 'Rutschfest, extra dick', anlassName: 'Weihnachten', status: 'VERSCHENKT', datum: '2024-12-24' }
    ]
  },
  {
    id: 2,
    name: 'Max Müller',
    geburtstag: '2025-01-25',
    interessen: ['Gaming', 'Fotografie', 'Wandern'],
    notizen: 'Spielt gerne Strategiespiele. Hat eine Sony Alpha Kamera.',
    hatIdeen: true,
    hatGekauft: false,
    geschenke: [
      { id: 201, titel: 'Kamera-Objektiv', beschreibung: '50mm Festbrennweite', anlassName: 'Geburtstag', status: 'GEPLANT', datum: null }
    ]
  },
  {
    id: 3,
    name: 'Lisa Weber',
    geburtstag: '2025-12-24',
    interessen: ['Musik', 'Reisen', 'Kunst'],
    notizen: 'Spielt Gitarre und plant eine Reise nach Japan.',
    hatIdeen: true,
    hatGekauft: false,
    geschenke: [
      { id: 301, titel: 'Reiseführer Japan', beschreibung: 'Lonely Planet', anlassName: 'Weihnachten', status: 'IDEE', datum: null }
    ]
  },
  {
    id: 4,
    name: 'Tom Fischer',
    geburtstag: '2025-03-10',
    interessen: ['Sport', 'Technik'],
    notizen: 'Technik-Fan, läuft regelmässig.',
    hatIdeen: false,
    hatGekauft: false,
    geschenke: []
  }
]

export const mockAnlaesse = [
  { id: 1, name: 'Geburtstag', fest: true },
  { id: 2, name: 'Weihnachten', fest: true },
  { id: 3, name: 'Silvester', fest: true },
  { id: 4, name: 'Eigene Anlässe', fest: false }
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

export const mockIdeen = {
  1: [
    { id: 11, titel: 'Spa-Gutschein', beschreibung: 'Wellness-Tag im Hotel', link: null },
    { id: 12, titel: 'Krimibuch-Abo', beschreibung: '3 Monate Krimi-Buchbox', link: null }
  ],
  2: [
    { id: 21, titel: 'Gaming-Headset', beschreibung: 'Kabellos mit Noise-Cancelling', link: null }
  ],
  3: [
    { id: 31, titel: 'Gitarrensaiten-Set', beschreibung: 'Elixir Nanoweb', link: null },
    { id: 32, titel: 'Japanisch-Kurs', beschreibung: 'Online-Sprachkurs 6 Monate', link: null }
  ],
  4: []
}

export const mockGeschenke = {
  1: [
    { id: 101, titel: 'Kochbuch "Italien"', beschreibung: 'Authentische italienische Rezepte', anlassName: 'Geburtstag', status: 'GEKAUFT', datum: '2025-02-14' },
    { id: 102, titel: 'Yoga-Matte', beschreibung: 'Rutschfest, extra dick', anlassName: 'Weihnachten', status: 'VERSCHENKT', datum: '2024-12-24' }
  ],
  2: [
    { id: 201, titel: 'Kamera-Objektiv', beschreibung: '50mm Festbrennweite', anlassName: 'Geburtstag', status: 'GEPLANT', datum: null }
  ],
  3: [
    { id: 301, titel: 'Reiseführer Japan', beschreibung: 'Lonely Planet', anlassName: 'Weihnachten', status: 'IDEE', datum: null }
  ],
  4: []
}

export const mockAufgaben = {
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
