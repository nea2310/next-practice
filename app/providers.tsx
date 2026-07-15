// app/providers.tsx
'use client';

import { AuthProvider } from './context/AuthContext';
import { NotificationsProvider } from '@/app/context/NotificationsContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <NotificationsProvider>{children}</NotificationsProvider>
    </AuthProvider>
  );
}
