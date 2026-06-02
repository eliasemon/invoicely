'use client';

import React, { createContext, useContext } from 'react';
import { IDatabaseProvider } from '@/core/ports';
import { getDatabaseAdapter } from '@/core/registry';

export interface DatabaseContextValue {
  db: IDatabaseProvider;
}

export const DatabaseContext = createContext<DatabaseContextValue | undefined>(undefined);

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const dbAdapter = getDatabaseAdapter();

  const value: DatabaseContextValue = {
    db: dbAdapter,
  };

  return <DatabaseContext.Provider value={value}>{children}</DatabaseContext.Provider>;
}
