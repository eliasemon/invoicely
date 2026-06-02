import { useContext } from 'react';
import { DatabaseContext, DatabaseContextValue } from '@/core/contexts/DatabaseContext';
import { IDatabaseProvider } from '@/core/ports';

export function useDatabase(): IDatabaseProvider {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context.db;
}
