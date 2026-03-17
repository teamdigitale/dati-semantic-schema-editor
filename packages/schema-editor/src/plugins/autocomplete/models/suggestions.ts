export interface Suggestion {
  score: number;
  snippet: string;
  caption: string;
  meta?: string;
  docHTML?: string;
}
