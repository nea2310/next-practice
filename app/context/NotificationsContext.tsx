// app/context/NotificationsContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
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
    if (!isAuthenticated || !token) {
      wsManager.disconnect();
      setNotifications([]);
      return;
    }

    // Подключаемся к WebSocket
    wsManager.connect(token);

    // Подписываемся на новые сообщения
    const unsubscribe = wsManager.subscribe((message) => {
      if (message.type === 'update') {
        // Создаём новые уведомления с isNew: true
        const newItems = message.payload.map((item: any) => ({
          id: item.id,
          text: item.text,
          isNew: true,
        }));
        // Добавляем в начало списка, сохраняя старые
        setNotifications((prev) => [...newItems, ...prev]);
      }
    });

    // Очистка при размонтировании или изменении токена
    return () => {
      unsubscribe();
      wsManager.disconnect();
    };
  }, [token, isAuthenticated]);

  const markAsViewed = (ids: string[]) => {
    setNotifications((prev) =>
      prev.map((item) =>
        ids.includes(item.id) ? { ...item, isNew: false } : item
      )
    );
  };

  return (
    <NotificationsContext.Provider value={{ notifications, markAsViewed }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) throw new Error('useNotifications must be used within NotificationsProvider');
  return context;
}