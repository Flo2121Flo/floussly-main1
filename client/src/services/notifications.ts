import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'message' | 'treasure' | 'payment' | 'system';
  data?: Record<string, any>;
  timestamp: Date;
  read: boolean;
}

interface NotificationState {
  notifications: Notification[];
  permission: NotificationPermission;
  error: string | null;
}

export const useNotifications = () => {
  const [state, setState] = useState<NotificationState>({
    notifications: [],
    permission: 'default',
    error: null,
  });
  const { t } = useTranslation();

  useEffect(() => {
    // Check notification permission on mount
    if ('Notification' in window) {
      setState((prev) => ({
        ...prev,
        permission: Notification.permission,
      }));
    }

    // Load stored notifications
    const storedNotifications = localStorage.getItem('notifications');
    if (storedNotifications) {
      setState((prev) => ({
        ...prev,
        notifications: JSON.parse(storedNotifications).map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp),
        })),
      }));
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      setState((prev) => ({
        ...prev,
        error: t('notifications.errors.not_supported'),
      }));
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setState((prev) => ({
        ...prev,
        permission,
      }));
      return permission === 'granted';
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : t('notifications.errors.permission_failed'),
      }));
      return false;
    }
  }, [t]);

  const registerServiceWorker = useCallback(async () => {
    if (!('serviceWorker' in navigator)) {
      setState((prev) => ({
        ...prev,
        error: t('notifications.errors.service_worker_not_supported'),
      }));
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      return registration;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : t('notifications.errors.registration_failed'),
      }));
      return null;
    }
  }, [t]);

  const subscribeToPush = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.REACT_APP_VAPID_PUBLIC_KEY,
      });

      // Send subscription to server
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      });

      return subscription;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : t('notifications.errors.subscription_failed'),
      }));
      return null;
    }
  }, [t]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false,
    };

    setState((prev) => {
      const updatedNotifications = [newNotification, ...prev.notifications];
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
      return {
        ...prev,
        notifications: updatedNotifications,
      };
    });

    // Show browser notification if permission granted
    if (state.permission === 'granted') {
      new Notification(newNotification.title, {
        body: newNotification.body,
        icon: '/logo192.png',
        data: newNotification.data,
      });
    }
  }, [state.permission]);

  const markAsRead = useCallback((notificationId: string) => {
    setState((prev) => {
      const updatedNotifications = prev.notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      );
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
      return {
        ...prev,
        notifications: updatedNotifications,
      };
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setState((prev) => {
      const updatedNotifications = prev.notifications.map((n) => ({ ...n, read: true }));
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
      return {
        ...prev,
        notifications: updatedNotifications,
      };
    });
  }, []);

  const removeNotification = useCallback((notificationId: string) => {
    setState((prev) => {
      const updatedNotifications = prev.notifications.filter((n) => n.id !== notificationId);
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
      return {
        ...prev,
        notifications: updatedNotifications,
      };
    });
  }, []);

  const clearAllNotifications = useCallback(() => {
    setState((prev) => ({
      ...prev,
      notifications: [],
    }));
    localStorage.removeItem('notifications');
  }, []);

  const getUnreadCount = useCallback(() => {
    return state.notifications.filter((n) => !n.read).length;
  }, [state.notifications]);

  return {
    ...state,
    requestPermission,
    registerServiceWorker,
    subscribeToPush,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    getUnreadCount,
  };
}; 