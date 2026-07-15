// app/(main)/page.tsx
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

export default async function MainPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Добро пожаловать, {user.username}!</h1>
      <p>Это главная страница вашего приложения.</p>
      <p>Здесь можно разместить общую информацию, статистику или ссылки на другие разделы.</p>
    </div>
  );
}
