export type Vector = number[];

export enum DocumentStatus {
  IDLE = 'IDLE',
  EMBEDDING = 'EMBEDDING',
  STORED = 'STORED',
}

export interface Document {
  id: number;
  text: string;
  vector: Vector | null;
  status: DocumentStatus;
  // Used for live animation during search
  similarity?: number;
}

export interface SearchResult extends Document {
    similarity: number;
}

export enum FlowStep {
  IDLE,
  // Embedding Flow
  INPUT_ENTERED,
  TOKENIZING_INPUT,
  EMBEDDING_INPUT,
  STORING_VECTOR,
  // Query Flow
  QUERY_ENTERED,
  TOKENIZING_QUERY,
  EMBEDDING_QUERY,
  SEARCHING_START,
  SEARCHING_COMPARE,
  SEARCHING_DONE,
  SHOWING_RESULTS,
}
