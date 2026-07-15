// app/page.tsx
import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';

export default async function RootPage() {
  const auth = await isAuthenticated();
  if (auth) {
    redirect('/main');
  } else {
    redirect('/login');
  }
}
