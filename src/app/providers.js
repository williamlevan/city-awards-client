'use client';  // Must be a client component

import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '@/context/AuthContext';

export function Providers({ children }) {
  return (
    <SessionProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </SessionProvider>
  );
}