# 🎁 Present Manager – Frontend

![Build](https://github.com/Sl4sh3r51/present-manager-frontend/actions/workflows/build.yml/badge.svg?branch=main)
![Node](https://img.shields.io/badge/Node-20.x-green)
![Vue](https://img.shields.io/badge/Vue-3.5-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)

---

## Übersicht

Das **Present Manager Frontend** ist die Benutzeroberfläche zur Verwaltung von Personen, Geschenkideen, Geschenken, Anlässen und Aufgaben. Es kommuniziert über eine REST-API mit dem [Present Manager Backend](https://github.com/Sl4sh3r51/present-manager) und nutzt **Supabase Auth** für die Authentifizierung.

Die Anwendung ist als **Single Page Application (SPA)** mit Vue 3 realisiert und wird lokal mit Vite gebaut und ausgeführt.

### Funktionsumfang

| Bereich | Beschreibung |
|---|---|
| **Authentifizierung** | Login, Registrierung und Session-Verwaltung via Supabase |
| **Dashboard** | Überblick: bevorstehende Geburtstage, Weihnachtsstatus, offene Aufgaben |
| **Personen** | CRUD, Interessen, Notizen, Statusverwaltung |
| **Personendetail** | Geschenkideen, Geschenke mit Statusworkflow, Aufgaben |
| **Anlässe** | Erstellen, Bearbeiten und Löschen von Anlässen |
| **Übersicht** | Druckbare Gesamtübersicht aller Personen und Geschenke |
| **Benachrichtigungen** | Geburtstags- und Weihnachtserinnerungen bei Login |

---

## Technologie-Stack

| Komponente | Technologie |
|---|---|
| Framework | Vue 3 (Composition API) |
| Sprache | TypeScript 5.9 |
| Build-Tool | Vite 7 |
| Styling | Tailwind CSS 4 |
| Routing | Vue Router 4 |
| HTTP-Client | Axios |
| Authentifizierung | Supabase JS (`@supabase/supabase-js`) |
| Linting | ESLint + OxLint |
| Formatierung | Prettier |
| E2E-Tests | Playwright |
| CI/CD | GitHub Actions |

---

## Voraussetzungen

- **Node.js** `^20.19.0` oder `>=22.12.0`
- **npm** `>=10`
- Zugang zu einem **Supabase-Projekt** (URL + Anon Key)
- Laufendes **Present Manager Backend** (Standard: `http://localhost:8080`)

---

## Installation und lokale Ausführung

### 1. Repository klonen

```bash
git clone https://github.com/DEIN-USERNAME/present-manager-frontend.git
cd present-manager-frontend
```

### 2. Abhängigkeiten installieren

```bash
npm install
```

### 3. Umgebungsvariablen setzen

Erstelle eine `.env`-Datei im Projektroot (oder kopiere `.env.example` falls vorhanden):


> **Hinweis:** `VITE_SUPABASE_URL` und `VITE_SUPABASE_ANON_KEY` findest du im Supabase-Dashboard unter **Project Settings → API**. Die `.env`-Datei ist in `.gitignore` eingetragen und wird nicht ins Repository eingecheckt.

### 4. Entwicklungsserver starten

```bash
npm run dev
```

Die Anwendung ist anschließend unter `http://localhost:5173` erreichbar.

### 5. Produktion bauen

```bash
npm run build
```

Das fertige Build liegt im Verzeichnis `dist/` und kann auf einem beliebigen Webserver bereitgestellt werden.

---

## Konfiguration

### Pflicht-Umgebungsvariablen

| Variable | Beschreibung |
|---|---|
| `VITE_SUPABASE_URL` | URL des Supabase-Projekts (z.B. `https://xyz.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Öffentlicher Anon Key des Supabase-Projekts |
| `VITE_API_BASE_URL` | Basis-URL des Backends (Standard: `http://localhost:8080`) |

Alle Variablen müssen mit dem Präfix `VITE_` beginnen, damit Vite sie in den Build einbettet.

---

## Verfügbare Skripte

| Befehl | Beschreibung |
|---|---|
| `npm run dev` | Entwicklungsserver mit Hot-Reload starten |
| `npm run build` | Typprüfung + Produktionsbuild erstellen |
| `npm run preview` | Produkt ionsbuild lokal vorschauen |
| `npm run lint` | OxLint und ESLint ausführen (mit Auto-Fix) |
| `npm run format` | Prettier über `src/` ausführen |
| `npm run type-check` | TypeScript-Typprüfung via `vue-tsc` |
| `npm run test:e2e` | Playwright E2E-Tests ausführen |

---

## E2E-Tests ausführen

### Voraussetzung: Browser-Installation

```bash
npx playwright install
```

### Tests starten

```bash
# Alle Tests (gegen den Entwicklungsserver)
npm run test:e2e

# Nur Chromium
npm run test:e2e -- --project=chromium

# Einzelne Testdatei
npm run test:e2e -- tests/example.spec.ts

# Debug-Modus
npm run test:e2e -- --debug
```

> Auf CI wird automatisch der Produktions-Preview-Server (`npm run preview`, Port 4173) verwendet. Lokal läuft der Dev-Server auf Port 5173.

---

## CI/CD

Die Pipeline ist in `.github/workflows/build.yml` definiert und läuft bei jedem Push auf `main` und `develop` sowie bei Pull Requests.

### Pipeline-Schritte

```
Push → Checkout → Node 20 setup → npm ci → ESLint → TypeScript-Check → npm run build → Artefakt hochladen
```

Das fertige `dist/`-Verzeichnis wird als GitHub-Artefakt für 14 Tage gespeichert.

> Für die Pipeline werden keine Supabase-Secrets benötigt — der Build-Schritt bindet die Umgebungsvariablen als Platzhalter ein. Für einen vollständigen Deploy müssen `VITE_SUPABASE_URL` und `VITE_SUPABASE_ANON_KEY` als GitHub Secrets hinterlegt werden.

---

## Projektstruktur

```
src/
├── assets/
│   └── main.css              # Tailwind CSS + globale Stile
├── components/               # Wiederverwendbare Vue-Komponenten
│   ├── AnlassModal.vue
│   ├── AppNavbar.vue
│   ├── ConfirmDialog.vue
│   ├── GeschenkIdeeModal.vue
│   ├── GeschenkUebernehmenModal.vue
│   ├── PersonCard.vue
│   ├── PersonModal.vue
│   └── ToastContainer.vue
├── composables/              # Vue Composables (reaktive Logik)
│   ├── useAuth.ts            # Supabase Auth
│   ├── useNotifications.ts   # Geburtstags- / Weihnachtsbenachrichtigungen
│   └── useToast.ts           # Toast-Benachrichtigungen
├── router/
│   └── index.js              # Vue Router mit Auth-Guard
├── services/
│   ├── api.ts                # Axios-Client + alle API-Endpunkte
│   └── supabase.ts           # Supabase-Client-Initialisierung
├── types/
│   └── index.ts              # TypeScript-Typdefinitionen
└── views/                    # Seitenkomponenten
    ├── AnlaesseView.vue
    ├── DashboardView.vue
    ├── LoginView.vue
    ├── PersonDetailView.vue
    ├── PersonenView.vue
    ├── RegisterView.vue
    └── UebersichtView.vue
e2e/
└── vue.spec.ts               # Playwright E2E-Tests
```

---

## Authentifizierung

Die Authentifizierung läuft vollständig über **Supabase Auth**. Nach dem Login speichert `@supabase/supabase-js` die Session automatisch im Browser-Storage. Bei jedem API-Request wird das JWT automatisch aus der aktuellen Supabase-Session gelesen und als `Authorization: Bearer <token>`-Header mitgesendet.

Der Vue Router prüft vor jeder Navigation, ob eine aktive Supabase-Session vorliegt. Nicht authentifizierte Nutzer werden automatisch auf `/login` weitergeleitet.

---

## Code-Qualität

Das Projekt verwendet zwei Linting-Tools, die über `npm run lint` gemeinsam ausgeführt werden:

| Tool | Beschreibung |
|---|---|
| **OxLint** | Schnelles Rust-basiertes Linting (Konfiguration: `.oxlintrc.json`) |
| **ESLint** | Vue 3 + TypeScript Regeln (Konfiguration: `eslint.config.ts`) |

Formatierung erfolgt über **Prettier** (Konfiguration: `.prettierrc.json`): keine Semikolons, einfache Anführungszeichen, max. 100 Zeichen Zeilenlänge.
