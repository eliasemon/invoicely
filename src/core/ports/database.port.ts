export interface QueryOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  where?: Array<{ field: string; op: '==' | '<' | '<=' | '>' | '>=' | 'array-contains' | 'in' | 'array-contains-any' | '!='; value: any }>;
  orderBy?: { field: string; direction: 'asc' | 'desc' };
  limit?: number;
}

export interface IDatabaseProvider {
  // Generic CRUD
  getDocument<T>(collection: string, id: string): Promise<T | null>;
  getDocuments<T>(collection: string, options?: QueryOptions): Promise<T[]>;
  createDocument<T>(collection: string, data: Omit<T, 'id'>, id?: string): Promise<T>;
  updateDocument<T>(collection: string, id: string, data: Partial<T>): Promise<void>;
  deleteDocument(collection: string, id: string): Promise<void>;

  // Real-time (optional, not all DBs support it)
  onSnapshot?<T>(collection: string, options: QueryOptions | undefined, callback: (data: T[]) => void): () => void;
}
