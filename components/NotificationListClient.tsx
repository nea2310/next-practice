'use client';

import { useRef, useCallback } from 'react';
import { List, type RowComponentProps } from 'react-window';
import { useNotifications } from '@/app/context/NotificationsContext';

type NotificationItemData = {
  id: string;
  text: string;
  isNew: boolean;
};

const Row = ({
  index,
  names,
  style,
}: RowComponentProps<{
  names: NotificationItemData[];
}>) => {
  const item = names[index];
  return (
    <div style={{ ...style, borderBottom: '1px solid #eee' }}>
      <div
        style={{
          backgroundColor: item.isNew ? 'yellow' : 'transparent',
          transition: 'background-color 1s ease 1s',
        }}
      >
        {item.text}
      </div>
    </div>
  );
};

export function NotificationListClient() {
  const { notifications, markAsViewed } = useNotifications();
  const seenIds = useRef<Set<string>>(new Set());

  const onItemsRendered = useCallback(
    ({ startIndex, stopIndex }: { startIndex: number; stopIndex: number }) => {
      const newIds: string[] = [];
      for (let i = startIndex; i <= stopIndex; i++) {
        const item = notifications[i];
        if (item && item.isNew && !seenIds.current.has(item.id)) {
          seenIds.current.add(item.id);
          newIds.push(item.id);
        }
      }
      if (newIds.length > 0) {
        markAsViewed(newIds);
      }
    },
    [notifications, markAsViewed]
  );

  const ITEM_HEIGHT = 60;

  return (
    <List
      className={'list'}
      rowCount={notifications.length}
      rowHeight={ITEM_HEIGHT}
      rowComponent={Row}
      rowProps={{ names: notifications }}
      onRowsRendered={onItemsRendered}
    />
  );
}
