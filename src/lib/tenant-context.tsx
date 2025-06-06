'use client';

import { createContext, useContext, ReactNode } from 'react';
import type { Tenant } from '@/middleware';

// Context for client components
interface TenantContextType {
  tenant: Tenant;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

// Provider component for client-side tenant access
export function TenantProvider({ 
  children, 
  tenant 
}: { 
  children: ReactNode; 
  tenant: Tenant;
}) {
  return (
    <TenantContext.Provider value={{ tenant }}>
      {children}
    </TenantContext.Provider>
  );
}

// Hook for client components to access current tenant
export function useTenant(): Tenant {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context.tenant;
}