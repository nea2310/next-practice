import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { NotificationListClient } from '@components/NotificationListClient';


export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  console.log('DATABASE_URL:', process.env.DATABASE_URL);

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });

  console.log('notifications:', notifications);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Уведомления</h1>
      <NotificationListClient initialNotifications={notifications} />
    </div>
  );
}