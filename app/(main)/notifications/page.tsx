// app/(main)/notifications/page.tsx
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import { dataStore } from '@/lib/db';
import { NotificationListClient } from '@components/NotificationListClient';

export default async function NotificationsPage() {
  // Проверяем авторизацию на сервере
  if (!(await isAuthenticated())) {
    redirect('/login');
  }

  // Получаем начальные данные напрямую (без API)
  const initialData = dataStore;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Уведомления Notifications</h1>
      <Suspense fallback={<div>Загрузка...</div>}>
        <NotificationListClient initialData={initialData} />
      </Suspense>
    </div>
  );
}
