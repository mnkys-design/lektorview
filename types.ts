export enum ChangeType {
  SPELLING = "spelling",
  GRAMMAR = "grammar",
  STYLE = "style",
  GLOSSARY = "glossary",
  FORMAT = "format",
  OTHER = "other"
}

export interface ReferenceLink {
  sourceId: string;
  page?: number;
  label?: string;
  anchor?: string;
}

export interface ReferenceSource {
  id: string;
  name: string;
  type: "pdf" | "web";
  url: string;
}

export interface Change {
  id: string;
  originalRange: { start: number; end: number };
  correctedRange?: { start: number; end: number };
  originalSnippet: string;
  correctedSnippet: string;
  type: ChangeType;
  messageShort: string;
  messageLong?: string;
  references?: ReferenceLink[];
}

export interface Comparison {
  id: string;
  slug: string;
  title?: string;
  language?: string;
  originalText: string;
  correctedText: string;
  changes: Change[];
  referenceSources: ReferenceSource[];
  createdAt: string; // ISO date string
}