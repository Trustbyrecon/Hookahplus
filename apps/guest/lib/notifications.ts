/**
 * Notification Manager for Guest Experience
 * Handles browser notifications for session status updates
 */

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export interface NotificationOptions {
  title?: string; // Optional since title is passed as separate parameter to sendNotification
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  actions?: NotificationAction[];
  data?: any;
  vibrate?: number[];
}

export class NotificationManager {
  private static instance: NotificationManager;
  private permission: NotificationPermission = 'default';
  private registration: ServiceWorkerRegistration | null = null;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.permission = Notification.permission;
    }
  }

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  /**
   * Request notification permission from user
   */
  async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.log('[Notifications] Browser does not support notifications');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    if (this.permission !== 'denied') {
      try {
        const permission = await Notification.requestPermission();
        this.permission = permission;
        return permission === 'granted';
      } catch (error) {
        console.error('[Notifications] Error requesting permission:', error);
        return false;
      }
    }

    return false;
  }

  /**
   * Register service worker for push notifications
   */
  async registerServiceWorker(): Promise<void> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      console.log('[Notifications] Service Worker not supported');
      return;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js');
      console.log('[Notifications] Service Worker registered successfully');
    } catch (error) {
      console.error('[Notifications] Service Worker registration failed:', error);
      // Continue without service worker - can still use browser notifications
    }
  }

  /**
   * Send a notification
   */
  async sendNotification(title: string, options: NotificationOptions): Promise<void> {
    if (this.permission !== 'granted') {
      console.log('[Notifications] Permission not granted, skipping notification');
      return;
    }

    try {
      if (this.registration) {
        // Use service worker for better background support
        await this.registration.showNotification(title, {
          ...options,
          icon: options.icon || '/icon-192x192.png',
          badge: options.badge || '/badge-72x72.png',
          vibrate: options.vibrate || [200, 100, 200],
          requireInteraction: options.requireInteraction ?? false,
        } as any);
      } else {
        // Fallback to browser notification
        const notification = new Notification(title, {
          ...options,
          icon: options.icon || '/icon-192x192.png',
          badge: options.badge || '/badge-72x72.png',
        });

        // Auto-close after 5 seconds if not requiring interaction
        if (!options.requireInteraction) {
          setTimeout(() => notification.close(), 5000);
        }

        // Handle click
        notification.onclick = () => {
          window.focus();
          notification.close();
          if (options.data?.url) {
            window.location.href = options.data.url;
          }
        };
      }
    } catch (error) {
      console.error('[Notifications] Error sending notification:', error);
    }
  }

  /**
   * Session-specific notification methods
   */
  async notifySessionStatusChange(sessionId: string, status: string, details?: any): Promise<void> {
    const statusMessages: Record<string, { title: string; body: string }> = {
      'PAID_CONFIRMED': {
        title: 'Payment Confirmed!',
        body: 'Your hookah session has been confirmed and is being prepared.',
      },
      'PREP_IN_PROGRESS': {
        title: 'Preparing Your Hookah',
        body: 'Our staff is selecting the perfect coals and setting up your flavors.',
      },
      'HEAT_UP': {
        title: 'Heating Up',
        body: 'Coals are heating up to the perfect temperature.',
      },
      'READY_FOR_DELIVERY': {
        title: 'Almost Ready!',
        body: 'Your hookah is ready and will be delivered shortly.',
      },
      'OUT_FOR_DELIVERY': {
        title: 'On the Way!',
        body: 'Your hookah is being delivered to your table.',
      },
      'DELIVERED': {
        title: 'Delivered!',
        body: 'Your hookah has been delivered. Staff will light it shortly.',
      },
      'ACTIVE': {
        title: 'Session Started! 🔥',
        body: 'Your hookah session is now active. Enjoy!',
      },
      'CLOSE_PENDING': {
        title: 'Session Ending Soon',
        body: 'Your session will be closing shortly. Would you like to extend?',
      },
    };

    const message = statusMessages[status] || {
      title: 'Session Update',
      body: `Your session status has been updated to ${status}.`,
    };

    await this.sendNotification(message.title, {
      ...message,
      tag: `session-${sessionId}`,
      requireInteraction: status === 'ACTIVE' || status === 'CLOSE_PENDING',
      data: {
        sessionId,
        status,
        url: `/hookah-tracker?sessionId=${sessionId}`,
        ...details,
      },
      actions: status === 'CLOSE_PENDING' ? [
        { action: 'extend', title: 'Extend Session' },
        { action: 'view', title: 'View Session' },
      ] : undefined,
    });
  }

  async notifyTimeWarning(sessionId: string, minutesRemaining: number): Promise<void> {
    await this.sendNotification('Time Almost Up!', {
      body: `${minutesRemaining} minute${minutesRemaining !== 1 ? 's' : ''} remaining in your session`,
      tag: `time-warning-${sessionId}`,
      requireInteraction: minutesRemaining <= 5,
      data: {
        sessionId,
        minutesRemaining,
        url: `/hookah-tracker?sessionId=${sessionId}`,
      },
      actions: [
        { action: 'extend', title: 'Extend Now' },
        { action: 'view', title: 'View Session' },
      ],
    });
  }

  async notifySessionExpired(sessionId: string): Promise<void> {
    await this.sendNotification('Session Complete', {
      body: 'Your hookah session has ended. Thank you for visiting!',
      tag: `session-expired-${sessionId}`,
      data: {
        sessionId,
        url: '/',
      },
    });
  }
}

// Export singleton instance
export const notificationManager = NotificationManager.getInstance();

