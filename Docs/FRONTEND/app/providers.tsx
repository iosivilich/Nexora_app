'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '../src/app/context/AuthContext';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <Toaster position="top-center" richColors />
      {children}
    </AuthProvider>
  );
}
