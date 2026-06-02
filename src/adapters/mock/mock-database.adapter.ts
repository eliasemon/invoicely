import { IDatabaseProvider, QueryOptions } from '@/core/ports';

export class MockDatabaseAdapter implements IDatabaseProvider {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private store: Record<string, Record<string, any>> = {};

  async getDocument<T>(collection: string, id: string): Promise<T | null> {
    if (!this.store[collection] || !this.store[collection][id]) {
      return null;
    }
    return { id, ...this.store[collection][id] } as T;
  }

  async getDocuments<T>(collection: string, options?: QueryOptions): Promise<T[]> {
    if (!this.store[collection]) {
      return [];
    }
    
    let docs = Object.entries(this.store[collection]).map(([id, data]) => ({ id, ...data } as T));
    
    if (options?.limit) {
      docs = docs.slice(0, options.limit);
    }
    
    return docs;
  }

  async createDocument<T>(collection: string, data: Omit<T, 'id'>, id?: string): Promise<T> {
    if (!this.store[collection]) {
      this.store[collection] = {};
    }
    
    const docId = id || `mock-id-${Math.random().toString(36).substring(2, 9)}`;
    this.store[collection][docId] = { ...data };
    
    return { id: docId, ...data } as unknown as T;
  }

  async updateDocument<T>(collection: string, id: string, data: Partial<T>): Promise<void> {
    if (!this.store[collection]) {
      this.store[collection] = {};
    }
    if (!this.store[collection][id]) {
      throw new Error(`Document not found: ${collection}/${id}`);
    }
    
    this.store[collection][id] = { ...this.store[collection][id], ...data };
  }

  async deleteDocument(collection: string, id: string): Promise<void> {
    if (this.store[collection] && this.store[collection][id]) {
      delete this.store[collection][id];
    }
  }

  onSnapshot<T>(collection: string, options: QueryOptions | undefined, callback: (data: T[]) => void): () => void {
    // Immediate callback with current data
    this.getDocuments<T>(collection, options).then(callback);
    // Return empty unsubscribe function
    return () => {};
  }
}
