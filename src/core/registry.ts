import type { IAuthProvider } from './ports/auth.port';
import type { IDatabaseProvider } from './ports/database.port';
import { MockAuthAdapter, MockDatabaseAdapter } from '@/adapters/mock';
import { SupabaseAuthAdapter } from '@/adapters/supabase';

export type AuthProviderType = 'mock' | 'supabase';
export type DatabaseProviderType = 'mock' | 'postgres' | 'mongodb' | 'supabase';

let authInstance: IAuthProvider | null = null;
let dbInstance: IDatabaseProvider | null = null;

export function getAuthAdapter(): IAuthProvider {
  if (authInstance) return authInstance;

  const provider = (process.env.NEXT_PUBLIC_AUTH_PROVIDER || 'supabase') as AuthProviderType;

  switch (provider) {
    case 'mock': {
      authInstance = new MockAuthAdapter();
      break;
    }
    case 'supabase':
    default: {
      authInstance = new SupabaseAuthAdapter();
      break;
    }
  }

  return authInstance as IAuthProvider;
}

export function getDatabaseAdapter(): IDatabaseProvider {
  if (dbInstance) return dbInstance;

  // The client-side database context uses the mock adapter for offline state,
  // while server actions query Supabase directly.
  dbInstance = new MockDatabaseAdapter();
  return dbInstance as IDatabaseProvider;
}
