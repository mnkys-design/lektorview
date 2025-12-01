import { ChangeType, Comparison } from "../types";

export const MOCK_COMPARISON: Comparison = {
  id: "b8b3e5b2-99a1-4231-b3f2-8921a2d2123",
  slug: "k3F9ad",
  title: "Newsletter Q1 2025 - Entwurf v2",
  language: "de",
  createdAt: "2025-02-24T10:00:00Z",
  originalText: `Sehr geehrte Damen und Herren,

wir freuen uns, Ihnen mitteilen zu können das unser neues Produkt "EcoStream" ab nächsten Montag verfuegbar ist.

Dabei handelt es sich um eine Inovative Lösung für das Wassermanagement in privaten Haushalten. Aufgrund von neuen Regularien der EU (siehe Anhang 3) müssen wir sicherstellen, dass der Verbrauchs-Kennwert unter 50L pro Kopf liegt.

Unser Team hat hart gearbeitet um dies zu ermöglichen. Wir hoffen es gefällt euch.

Mit freundlichen Grüßen
Das Management`,
  correctedText: `Sehr geehrte Damen und Herren,

wir freuen uns, Ihnen mitteilen zu können, dass unser neues Produkt „EcoStream“ ab nächsten Montag verfügbar ist.

Dabei handelt es sich um eine innovative Lösung für das Wassermanagement in privaten Haushalten. Aufgrund neuer EU-Regularien müssen wir sicherstellen, dass der Verbrauchskennwert unter 50 l pro Kopf liegt.

Unser Team hat hart gearbeitet, um dies zu ermöglichen. Wir hoffen, es gefällt Ihnen.

Mit freundlichen Grüßen
Die Geschäftsführung`,
  changes: [
    {
      id: "c1",
      originalRange: { start: 68, end: 71 }, // "das" -> "dass"
      originalSnippet: "das",
      correctedSnippet: "dass",
      type: ChangeType.GRAMMAR,
      messageShort: "Konjunktion 'dass'",
      messageLong: "Nach 'mitteilen zu können' folgt ein Nebensatz, der mit 'dass' eingeleitet wird."
    },
    {
      id: "c2",
      originalRange: { start: 91, end: 102 }, // "EcoStream" -> „EcoStream“
      originalSnippet: "\"EcoStream\"",
      correctedSnippet: "„EcoStream“",
      type: ChangeType.FORMAT,
      messageShort: "Typografische Anführungszeichen",
      messageLong: "Im Deutschen verwenden wir unten öffnende und oben schließende Anführungszeichen (99-66)."
    },
    {
      id: "c3",
      originalRange: { start: 124, end: 134 }, // "verfuegbar" -> "verfügbar"
      originalSnippet: "verfuegbar",
      correctedSnippet: "verfügbar",
      type: ChangeType.SPELLING,
      messageShort: "Umlaute ausschreiben",
      messageLong: "Bitte Umlaute direkt verwenden statt 'ue'."
    },
    {
      id: "c4",
      originalRange: { start: 167, end: 176 }, // "Inovative" -> "innovative"
      originalSnippet: "Inovative",
      correctedSnippet: "innovative",
      type: ChangeType.SPELLING,
      messageShort: "Rechtschreibung",
      messageLong: "Innovativ wird mit Doppel-n und kleingeschrieben (Adjektiv)."
    },
    {
      id: "c5",
      originalRange: { start: 247, end: 271 }, // "von neuen Regularien der EU" -> "neuer EU-Regularien"
      originalSnippet: "von neuen Regularien der EU",
      correctedSnippet: "neuer EU-Regularien",
      type: ChangeType.STYLE,
      messageShort: "Ausdruck straffen",
      messageLong: "Vermeidung von unnötigen Präpositionalkonstruktionen."
    },
    {
      id: "c6",
      originalRange: { start: 273, end: 289 }, // "(siehe Anhang 3)"
      originalSnippet: "(siehe Anhang 3)",
      correctedSnippet: "",
      type: ChangeType.OTHER,
      messageShort: "Gelöscht",
      messageLong: "Interne Verweise gehören nicht in den Kunden-Newsletter."
    },
    {
      id: "c7",
      originalRange: { start: 326, end: 346 }, // "Verbrauchs-Kennwert" -> "Verbrauchskennwert"
      originalSnippet: "Verbrauchs-Kennwert",
      correctedSnippet: "Verbrauchskennwert",
      type: ChangeType.GLOSSARY,
      messageShort: "Unternehmenswording",
      messageLong: "Zusammenschreibung ohne Bindestrich gemäß Glossar.",
      references: [
        {
          sourceId: "glossar-2025",
          page: 12,
          label: "Glossar S. 12: Komposita"
        }
      ]
    },
    {
      id: "c8",
      originalRange: { start: 353, end: 356 }, // "50L" -> "50 l"
      originalSnippet: "50L",
      correctedSnippet: "50 l",
      type: ChangeType.FORMAT,
      messageShort: "Einheitenzeichen",
      messageLong: "Leerzeichen zwischen Zahl und Einheit. Liter-Einheit kleingeschrieben."
    },
    {
      id: "c9",
      originalRange: { start: 396, end: 397 }, // " " -> ", "
      originalSnippet: " ",
      correctedSnippet: ", ",
      type: ChangeType.GRAMMAR,
      messageShort: "Komma bei Infinitivgruppe",
      messageLong: "Erweiterte Infinitivgruppen mit 'um' werden durch Komma abgetrennt."
    },
    {
      id: "c10",
      originalRange: { start: 433, end: 445 }, // "euch" -> "Ihnen"
      originalSnippet: "euch",
      correctedSnippet: "Ihnen",
      type: ChangeType.STYLE,
      messageShort: "Anredeform",
      messageLong: "In offizieller Kommunikation nutzen wir das förmliche 'Sie/Ihnen'.",
      references: [
        {
          sourceId: "styleguide-2025",
          page: 4,
          label: "Styleguide S. 4: Tone of Voice"
        }
      ]
    },
    {
      id: "c11",
      originalRange: { start: 472, end: 486 }, // "Das Management" -> "Die Geschäftsführung"
      originalSnippet: "Das Management",
      correctedSnippet: "Die Geschäftsführung",
      type: ChangeType.GLOSSARY,
      messageShort: "Unterschriftenregelung",
      references: [
        {
          sourceId: "styleguide-2025",
          page: 2,
          label: "Styleguide S. 2"
        }
      ]
    }
  ],
  referenceSources: [
    {
      id: "styleguide-2025",
      name: "Corporate Styleguide 2025",
      type: "pdf",
      url: "https://example.com/styleguide.pdf"
    },
    {
      id: "glossar-2025",
      name: "Terminologie-Datenbank",
      type: "web",
      url: "https://example.com/glossar"
    }
  ]
};