import { useEffect, useState } from 'react';

export class NotificationService {
  private static instance: NotificationService;
  private permission: NotificationPermission = 'default';

  private constructor() {
    this.requestPermission();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private async requestPermission() {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return;
    }

    try {
      this.permission = await Notification.requestPermission();
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  }

  async showNotification(title: string, options: NotificationOptions = {}) {
    if (this.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    try {
      const serviceWorker = await navigator.serviceWorker.ready;
      await serviceWorker.showNotification(title, {
        ...options,
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/badge-72x72.png',
        vibrate: [100, 50, 100],
      });
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  async scheduleNotification(title: string, options: NotificationOptions & { delay: number }) {
    if (this.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    setTimeout(() => {
      this.showNotification(title, options);
    }, options.delay);
  }
}

// React hook for notifications
export function useNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    setIsSupported('Notification' in window);
    setPermission(Notification.permission);

    const handlePermissionChange = () => {
      setPermission(Notification.permission);
    };

    Notification.requestPermission().then(handlePermissionChange);
    return () => {
      // Cleanup if needed
    };
  }, []);

  const showNotification = async (title: string, options: NotificationOptions = {}) => {
    if (!isSupported || permission !== 'granted') return;

    try {
      const serviceWorker = await navigator.serviceWorker.ready;
      await serviceWorker.showNotification(title, {
        ...options,
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/badge-72x72.png',
        vibrate: [100, 50, 100],
      });
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  };

  return {
    isSupported,
    permission,
    showNotification,
  };
}

// Types for notification options
export interface NotificationOptions {
  body?: string;
  icon?: string;
  badge?: string;
  image?: string;
  vibrate?: number[];
  tag?: string;
  renotify?: boolean;
  silent?: boolean;
  sound?: string;
  noscreen?: boolean;
  sticky?: boolean;
  dir?: 'auto' | 'ltr' | 'rtl';
  lang?: string;
  data?: any;
  actions?: NotificationAction[];
} 