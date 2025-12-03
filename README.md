📝 LektorView
Professional Text Comparison & Visualization for AI Agents

LektorView ist ein spezialisiertes Tool zur Visualisierung von Textkorrekturen. Es ermöglicht KI-Assistenten (wie Custom GPTs, Langdock Agents oder Claude), Korrekturen nicht nur als Textwüste auszugeben, sondern als interaktiven, visuellen Vorher-Nachher-Vergleich bereitzustellen.

Perfekt für Lektorats-Tasks, Code-Reviews oder Übersetzungsabgleiche.

✨ Features
Visueller Diff-View: Farbliche Hervorhebung von Änderungen (Einfügungen, Löschungen, Verschiebungen).

Interaktive Change-Liste: Klickbare Änderungen, die direkt zur Textstelle scrollen.

Kategorisierte Fehler: Unterscheidung nach Typ (Rechtschreibung, Grammatik, Stil, Glossar, etc.).

API-First Design: Gebaut für die nahtlose Integration in KI-Workflows (OpenAPI kompatibel).

PDF Export: Generierung von professionellen Korrekturberichten direkt im Browser.

Shareable Links: Permanente Links zu Vergleichen (/view/:slug).

Dual Auth System: Unterstützt sowohl Admin-Secrets (Bearer) als auch generierte API-Keys.

🛠 Tech Stack
Frontend: React 19, Vite, Tailwind CSS, Lucide React

Backend: Node.js, Express

Datenbank: JSON-basierte Flatfile DB (Lightweight & Portable)

Deployment: Docker-ready (Coolify / Render kompatibel)

🚀 Getting Started
Voraussetzungen
Node.js (v18 oder höher)

npm

Installation & Start
LektorView ist ein Monorepo-Setup (Frontend & Backend in einem).

Repository klonen & installieren:

Bash

git clone https://github.com/dein-user/lektorview.git
cd lektorview
npm install
Backend starten (Port 3001): In einem Terminal:

Bash

npm run server
Frontend starten (Port 3000): In einem zweiten Terminal:

Bash

npm run dev
Die App ist nun unter http://localhost:3000 erreichbar. Das Backend läuft auf http://localhost:3001.

🔌 API Dokumentation
Die API ist das Herzstück für deine KI-Agenten. Sie akzeptiert Texte und Änderungsprotokolle und gibt eine URL zur Visualisierung zurück.

Authentifizierung
Es gibt zwei Wege, sich zu authentifizieren:

Bearer Token (Admin Secret) - Empfohlen für Backend-to-Backend / GPTs Setze den Header Authorization: Bearer <DEIN_ADMIN_SECRET>. Das Secret wird in der Umgebungsvariable ADMIN_SECRET (oder API_BEARER_TOKEN) definiert.

API Key (x-api-key) - Für Clients / Langdock Setze den Header x-api-key: <GENERIERTER_KEY>. Keys können über den /api/auth Endpunkt generiert werden.

Endpoints
1. Neuen Vergleich erstellen
POST /api/comparisons

Headers:

Content-Type: application/json

Authorization: Bearer SuperSecretPassword123

Body:

JSON

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
Response:

JSON

{
  "slug": "8f3a2...",
  "shareUrl": "https://lektorview.deine-domain.de/view/8f3a2..."
}
🤖 Integration in KI-Agenten (Langdock / GPTs)
LektorView ist optimiert für die Nutzung durch LLMs.

System Prompt Schnipsel
Gib deinem Agenten folgende Instruktion, um das Tool korrekt zu nutzen:

"Wenn du Texte korrigierst, erstelle IMMER ein JSON-Array für das changeLog. Rufe danach die Action uploadComparison auf. Antworte dem Nutzer erst, wenn du die shareUrl erhalten hast, und gib diese als klickbaren Link aus."

Langdock Setup (Quick)
Neue Custom Integration erstellen.

Auth Type: API Key -> Header: Authorization -> Value Prefix: Bearer .

Als Key dein ADMIN_SECRET eintragen.

Action Code: Siehe interne Dokumentation oder nutze ld.request mit dem POST Body.

📦 Deployment
Docker / Coolify
Ein Dockerfile ist enthalten. Setze folgende Environment Variables in deiner Hosting-Plattform:

ADMIN_SECRET: Dein sicheres Passwort für den Admin-Zugriff.

PORT: 3001 (Interner Server Port).

Siehe DEPLOY_BACKEND.md für Details zum Deployment auf Render.com.
