import type { IAuthProvider } from './ports/auth.port';
import type { IDatabaseProvider } from './ports/database.port';
import { MockAuthAdapter, MockDatabaseAdapter } from '@/adapters/mock';
import { SupabaseAuthAdapter } from '@/adapters/supabase';
import { Auth0AuthAdapter } from '@/adapters/auth0';

export type AuthProviderType = 'mock' | 'auth0' | 'supabase';
export type DatabaseProviderType = 'mock' | 'postgres' | 'mongodb';

let authInstance: IAuthProvider | null = null;
let dbInstance: IDatabaseProvider | null = null;

export function getAuthAdapter(): IAuthProvider {
  if (authInstance) return authInstance;

  const provider = (process.env.NEXT_PUBLIC_AUTH_PROVIDER || 'mock') as AuthProviderType;

  switch (provider) {
    case 'mock': {
      authInstance = new MockAuthAdapter();
      break;
    }
    case 'auth0': {
      authInstance = new Auth0AuthAdapter();
      break;
    }
    case 'supabase': {
      authInstance = new SupabaseAuthAdapter();
      break;
    }
    default:
      throw new Error(`Unknown auth provider: ${provider}`);
  }

  return authInstance as IAuthProvider;
}

export function getDatabaseAdapter(): IDatabaseProvider {
  if (dbInstance) return dbInstance;

  const provider = (process.env.NEXT_PUBLIC_DB_PROVIDER || 'mock') as DatabaseProviderType;

  switch (provider) {
    case 'mock': {
      dbInstance = new MockDatabaseAdapter();
      break;
    }
    default:
      throw new Error(`Unknown database provider: ${provider}`);
  }

  return dbInstance as IDatabaseProvider;
}
