'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

interface NotificationsContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  quoteUnreadCount: number;
  inboxUnreadCount: number;
  markRead: (id: string) => Promise<void>;
  markAllRead: (type?: string) => Promise<void>;
  refreshInboxCount: () => void;
  decrementInboxCount: (amount: number) => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

/**
 * Single source of truth for notifications across the whole dashboard: one
 * shared WebSocket connection (instead of every consumer — the bell, the
 * sidebar badges — opening its own), so the bell dropdown, the Quotes/Inbox
 * sidebar badge counts, and the inbox page all stay in sync in real time
 * without needing a page refresh.
 */
export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [quoteUnreadCount, setQuoteUnreadCount] = useState(0);
  const [inboxUnreadCount, setInboxUnreadCount] = useState(0);
  const stompClient = useRef<Client | null>(null);
  const quoteUnreadCountRef = useRef(0);
  quoteUnreadCountRef.current = quoteUnreadCount;

  const refreshInboxCount = useCallback(async () => {
    if (!user?.email) return;
    try {
      const role = user.role === 'vendor' ? 'VENDOR' : 'CUSTOMER';
      const res = await apiClient.get('/conversations/unread-count', { params: { email: user.email, role } });
      setInboxUnreadCount(res.data.count);
    } catch (err) {
      console.error('Failed to fetch inbox unread count', err);
    }
  }, [user?.email, user?.role]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setNotifications([]);
      setUnreadCount(0);
      setQuoteUnreadCount(0);
      setInboxUnreadCount(0);
      stompClient.current?.deactivate();
      stompClient.current = null;
      return;
    }

    (async () => {
      try {
        const [listRes, countRes, quoteCountRes] = await Promise.all([
          apiClient.get('/notifications'),
          apiClient.get('/notifications/unread-count'),
          apiClient.get('/notifications/unread-count', { params: { type: 'QUOTE' } }),
        ]);
        setNotifications(listRes.data);
        setUnreadCount(countRes.data.count);
        setQuoteUnreadCount(quoteCountRes.data.count);
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      }
    })();
    refreshInboxCount();

    const token = localStorage.getItem('authToken');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
    const wsUrl = apiUrl.replace('/api', '/ws');

    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      onConnect: () => {
        client.subscribe('/user/queue/notifications', (msg) => {
          if (!msg.body) return;
          const notification: NotificationItem = JSON.parse(msg.body);
          setNotifications((prev) => [notification, ...prev].slice(0, 30));
          setUnreadCount((prev) => prev + 1);
          if (notification.type === 'QUOTE') setQuoteUnreadCount((prev) => prev + 1);
          if (notification.type === 'MESSAGE') setInboxUnreadCount((prev) => prev + 1);
        });
      },
      onStompError: (frame) => {
        console.error('Notification broker error: ' + frame.headers['message']);
      },
    });

    client.activate();
    stompClient.current = client;

    return () => {
      client.deactivate();
      stompClient.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.email]);

  const markRead = useCallback(async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
    try {
      await apiClient.put(`/notifications/${id}/read`);
    } catch (err) {
      console.error('Failed to mark notification read', err);
    }
  }, []);

  const markAllRead = useCallback(async (type?: string) => {
    setNotifications((prev) => prev.map((n) => (!type || n.type === type ? { ...n, read: true } : n)));
    if (type === 'QUOTE') {
      setUnreadCount((prev) => Math.max(0, prev - quoteUnreadCountRef.current));
      setQuoteUnreadCount(0);
    } else if (!type) {
      setUnreadCount(0);
      setQuoteUnreadCount(0);
    }
    try {
      await apiClient.put('/notifications/read-all', null, { params: type ? { type } : {} });
    } catch (err) {
      console.error('Failed to mark all notifications read', err);
    }
  }, []);

  const decrementInboxCount = useCallback((amount: number) => {
    if (amount <= 0) return;
    setInboxUnreadCount((prev) => Math.max(0, prev - amount));
  }, []);

  return (
    <NotificationsContext.Provider
      value={{ notifications, unreadCount, quoteUnreadCount, inboxUnreadCount, markRead, markAllRead, refreshInboxCount, decrementInboxCount }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}
