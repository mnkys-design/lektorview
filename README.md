# 📝 LektorView

**Professional Text Comparison & Visualization for AI Agents**

LektorView ist ein spezialisiertes Tool zur Visualisierung von Textkorrekturen. Es ermöglicht KI-Assistenten (wie Custom GPTs, Langdock Agents oder Claude), Korrekturen als interaktiven, visuellen Vorher-Nachher-Vergleich, statt als bloße Textausgabe, bereitzustellen.

Ideal für Lektoratsaufgaben, Code-Reviews oder Übersetzungsabgleiche.

---

## ✨ Features

- **Visueller Diff-View**  
  Farbliche Hervorhebung von Änderungen (Einfügungen, Löschungen, Verschiebungen).
- **Interaktive Change-Liste**  
  Jede Änderung ist klickbar und scrollt direkt zur Textstelle.
- **Kategorisierte Fehler**  
  Unterscheidung nach Typ: Rechtschreibung, Grammatik, Stil, Glossar, etc.
- **API-First Design**  
  Entwickelt für nahtlose Integration in KI-Workflows (OpenAPI kompatibel).
- **PDF Export**  
  Erzeugt professionelle Korrekturberichte direkt im Browser.
- **Shareable Links**  
  Permanente Links zu Vergleichen (`/view/:slug`).
- **Dual Auth System**  
  Unterstützt Admin-Secrets (Bearer) und generierte API-Keys.

---

## 🛠 Tech Stack

**Frontend:**  
React 19, Vite, Tailwind CSS, Lucide React

**Backend:**  
Node.js, Express

**Datenbank:**  
JSON-basierte Flatfile DB (leicht & portabel)

**Deployment:**  
Docker-ready (Coolify / Render kompatibel)

---

## 🚀 Getting Started

### Voraussetzungen

- Node.js (v18 oder höher)
- npm

### Installation & Start

LektorView nutzt ein Monorepo-Setup (Frontend & Backend in einem).

```bash
git clone https://github.com/dein-user/lektorview.git
cd lektorview
npm install
```

**Backend starten (Port 3001):**

```bash
npm run server
```

**Frontend starten (Port 3000):**

```bash
npm run dev
```

> Die Applikation ist unter [http://localhost:3000](http://localhost:3000) erreichbar.  
> Das Backend läuft auf [http://localhost:3001](http://localhost:3001).

---

## 🔌 API Dokumentation

Die API bildet das Herzstück für deine KI-Agenten und gibt eine Visualisierungs-URL zurück.

### Authentifizierung

Es gibt zwei Wege:

**1. Bearer Token (Admin Secret)**  
Empfohlen für Backend-zu-Backend / GPTs  
Setze den Header:  
`Authorization: Bearer <DEIN_ADMIN_SECRET>`  
Das Secret wird in der Umgebungsvariable `ADMIN_SECRET` (oder `API_BEARER_TOKEN`) definiert.

**2. API Key (`x-api-key`)**  
Für Clients/Langdock  
Setze den Header:  
`x-api-key: <GENERIERTER_KEY>`  
Keys lassen sich via `/api/auth` generieren.

---

### Endpoints

#### 1. Neuen Vergleich erstellen

**POST** `/api/comparisons`

**Headers:**

```http
Content-Type: application/json
Authorization: Bearer SuperSecretPassword123
```

**Body:**

```json
{
  "originalText": "Dies ist ein Test mit fehlern.",
  "correctedText": "Dies ist ein Test ohne Fehler.",
  "changeLog": [
    {
      "type": "spelling",
      "originalSnippet": "fehlern",
      "correctedSnippet": "Fehler",
      "comment": "Großschreibung korrigiert"
    }
  ]
}
```

**Response:**

```json
{
  "slug": "8f3a2...",
  "shareUrl": "https://lektorview.deine-domain.de/view/8f3a2..."
}
```

---

## 🤖 Integration in KI-Agenten (Langdock / GPTs)

LektorView kann mit LLMs und Agents genutzt werden.

**System Prompt Schnipsel**

Gib deinem Agenten diese Instruktion zum optimalen Workflow:

> "Wenn du Texte korrigierst, erstelle IMMER ein JSON-Array für das changeLog. Rufe danach die Action `uploadComparison` auf. Antworte dem Nutzer erst, wenn du die `shareUrl` erhalten hast, und gib diese als klickbaren Link aus."

**Langdock Setup (Quick)**

- Neue Custom Integration erstellen.
- Auth Type: API Key -> Header: Authorization -> Value Prefix: Bearer .
- Als Key dein ADMIN_SECRET eintragen.
- Action Code: Siehe interne Doku oder nutze `ld.request` mit dem POST-Body.

---

## 📦 Deployment

**Docker/Coolify:**  
Ein Dockerfile ist enthalten. Setze folgende Environment Variables auf deiner Hosting-Plattform:

- `ADMIN_SECRET`: Sicheres Passwort für Admin-Zugriff
- `PORT`: 3001 (interner Server-Port)
