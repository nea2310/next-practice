// app/context/NotificationsContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { wsManager } from '@/lib/websocket';
import { useAuth } from './AuthContext';

type Notification = {
  id: string;
  text: string;
  isNew: boolean;
};

type NotificationsContextType = {
  notifications: Notification[];
  markAsViewed: (ids: string[]) => void;
};

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { token, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    console.log('NotificationsProvider');
    if (!isAuthenticated || !token) {
           wsManager.disconnect();
      setNotifications([]);
      return;
    }

    wsManager.connect(token);

    const unsubscribe = wsManager.subscribe((message) => {
      if (message.type === 'init') {
        // При инициализации — все уведомления из БД
        const items = message.payload.map((item: any) => ({
          ...item,
          isNew: true,
        }));
        setNotifications(items);
      } else if (message.type === 'update') {
        // Новые уведомления
        const newItems = message.payload.map((item: any) => ({
          ...item,
          isNew: true,
        }));
        setNotifications((prev) => [...newItems, ...prev]);
      }
    });

    return () => {
      unsubscribe();
      wsManager.disconnect();
    };
  }, [token, isAuthenticated]);

  const markAsViewed = useCallback(async (ids: string[]) => {
    // Отправляем запрос на сервер для обновления isNew в БД
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
    } catch (error) {
      console.error('Failed to mark as viewed:', error);
    }

    // Обновляем локальное состояние
    setNotifications((prev) =>
      prev.map((item) =>
        ids.includes(item.id) ? { ...item, isNew: false } : item
      )
    );
  }, []);

  return (
    <NotificationsContext.Provider value={{ notifications, markAsViewed }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationsProvider');
  }
  return context;
}