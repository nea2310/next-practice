'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { logoutAction } from '@/app/actions/auth';
import { useNotifications } from '@/app/context/NotificationsContext';

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { notifications } = useNotifications();
  const router = useRouter();

  const handleLogout = async () => {
    await logoutAction();
    logout();
    router.push('/login');
  };

  const unreadCount = notifications.filter((n) => n.isNew).length;

  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        padding: '10px 20px',
        borderBottom: '1px solid #ccc',
        backgroundColor: '#f8f9fa',
      }}
    >
      <Link href="/main">Main</Link>
      <Link
        href="/notifications"
        style={{
          position: 'relative',
          textDecoration: 'none',
          color: '#0070f3',
        }}
      >
        Notifications
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-10px',
              right: '-22px',
              backgroundColor: '#e74c3c',
              color: 'white',
              borderRadius: '50%',
              padding: '2px 8px',
              fontSize: '12px',
              fontWeight: 'bold',
              minWidth: '20px',
              textAlign: 'center',
              lineHeight: '1.4',
            }}
          >
            {unreadCount}
          </span>
        )}
      </Link>

      {isAuthenticated ? (
        <>
          <span style={{ marginLeft: 'auto' }}>👤 {user?.username}</span>
          <button
            onClick={handleLogout}
            style={{
              background: 'none',
              border: '1px solid #ccc',
              borderRadius: '4px',
              padding: '4px 12px',
              cursor: 'pointer',
            }}
          >
            Выйти
          </button>
        </>
      ) : (
        <Link href="/login" style={{ marginLeft: 'auto' }}>
          Войти
        </Link>
      )}
    </nav>
  );
}
