// app/(main)/layout.tsx
import { Navbar } from '@components/Navbar';
import { Suspense } from 'react';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Suspense fallback={<div>Loading navbar...</div>}>
        <Navbar />
      </Suspense>
      <main>{children}</main>
    </div>
  );
}
