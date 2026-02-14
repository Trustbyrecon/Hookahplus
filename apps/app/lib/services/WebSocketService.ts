/**
 * WebSocket Service
 * 
 * Manages WebSocket connections for real-time updates
 * Supports multiple subscriptions and automatic reconnection
 */

type MessageHandler = (data: any) => void;
type ErrorHandler = (error: Error) => void;
type ConnectionHandler = () => void;

interface Subscription {
  id: string;
  channel: string;
  onMessage: MessageHandler;
  onError?: ErrorHandler;
}

export class WebSocketService {
  private static instance: WebSocketService;
  private ws: WebSocket | null = null;
  private subscriptions: Map<string, Subscription> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private reconnectTimer: NodeJS.Timeout | null = null;
  private url: string;
  private isConnecting = false;
  private onOpenHandlers: ConnectionHandler[] = [];
  private onCloseHandlers: ConnectionHandler[] = [];
  private onErrorHandlers: ErrorHandler[] = [];

  private constructor(url: string) {
    this.url = url;
  }

  static getInstance(url?: string): WebSocketService {
    if (!WebSocketService.instance) {
      if (!url) {
        // Default to environment-based URL
        const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = typeof window !== 'undefined' 
          ? window.location.host 
          : process.env.NEXT_PUBLIC_WS_URL || 'localhost:3002';
        url = `${protocol}//${host}/api/ws`;
      }
      WebSocketService.instance = new WebSocketService(url);
    }
    return WebSocketService.instance;
  }

  /**
   * Connect to WebSocket server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        // Wait for connection
        const checkConnection = setInterval(() => {
          if (this.ws?.readyState === WebSocket.OPEN) {
            clearInterval(checkConnection);
            resolve();
          } else if (!this.isConnecting) {
            clearInterval(checkConnection);
            reject(new Error('Connection failed'));
          }
        }, 100);
        return;
      }

      this.isConnecting = true;

      try {
        const ws = new WebSocket(this.url);
        this.ws = ws;

        ws.onopen = () => {
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.reconnectDelay = 1000;
          console.log('[WebSocket] Connected');
          
          // Resubscribe to all channels
          this.subscriptions.forEach((sub) => {
            this.subscribe(sub.channel, sub.onMessage, sub.onError);
          });

          this.onOpenHandlers.forEach(handler => handler());
          resolve();
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('[WebSocket] Failed to parse message:', error);
          }
        };

        ws.onerror = (error) => {
          console.error('[WebSocket] Error:', error);
          this.isConnecting = false;
          this.onErrorHandlers.forEach(handler => handler(new Error('WebSocket error')));
          reject(error);
        };

        ws.onclose = () => {
          console.log('[WebSocket] Disconnected');
          this.isConnecting = false;
          this.ws = null;
          this.onCloseHandlers.forEach(handler => handler());
          this.attemptReconnect();
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WebSocket] Max reconnection attempts reached');
      return;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectAttempts++;
    this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000); // Max 30 seconds

    console.log(`[WebSocket] Reconnecting in ${this.reconnectDelay}ms (attempt ${this.reconnectAttempts})`);

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch((error) => {
        console.error('[WebSocket] Reconnection failed:', error);
      });
    }, this.reconnectDelay);
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(message: any) {
    if (message.type === 'data' && message.channel) {
      const subscription = this.subscriptions.get(message.channel);
      if (subscription) {
        subscription.onMessage(message.data);
      }
    } else if (message.type === 'error') {
      console.error('[WebSocket] Server error:', message.error);
      const subscription = Array.from(this.subscriptions.values())[0];
      subscription?.onError?.(new Error(message.error));
    }
  }

  /**
   * Subscribe to a channel
   */
  subscribe(channel: string, onMessage: MessageHandler, onError?: ErrorHandler): string {
    const subscriptionId = `${channel}-${Date.now()}-${Math.random()}`;
    
    this.subscriptions.set(subscriptionId, {
      id: subscriptionId,
      channel,
      onMessage,
      onError,
    });

    // If connected, send subscription message
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'subscribe',
        channel,
      }));
    } else {
      // Connect if not already connected
      this.connect().catch((error) => {
        console.error('[WebSocket] Failed to connect for subscription:', error);
        onError?.(error);
      });
    }

    return subscriptionId;
  }

  /**
   * Unsubscribe from a channel
   */
  unsubscribe(subscriptionId: string) {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription && this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'unsubscribe',
        channel: subscription.channel,
      }));
    }
    this.subscriptions.delete(subscriptionId);

    // Disconnect if no subscriptions
    if (this.subscriptions.size === 0) {
      this.disconnect();
    }
  }

  /**
   * Send a message to the server
   */
  send(message: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('[WebSocket] Cannot send message: not connected');
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.subscriptions.clear();
    this.isConnecting = false;
  }

  /**
   * Get connection status
   */
  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Add event handlers
   */
  onOpen(handler: ConnectionHandler) {
    this.onOpenHandlers.push(handler);
  }

  onClose(handler: ConnectionHandler) {
    this.onCloseHandlers.push(handler);
  }

  onError(handler: ErrorHandler) {
    this.onErrorHandlers.push(handler);
  }

  /**
   * Remove event handlers
   */
  removeOnOpen(handler: ConnectionHandler) {
    this.onOpenHandlers = this.onOpenHandlers.filter(h => h !== handler);
  }

  removeOnClose(handler: ConnectionHandler) {
    this.onCloseHandlers = this.onCloseHandlers.filter(h => h !== handler);
  }

  removeOnError(handler: ErrorHandler) {
    this.onErrorHandlers = this.onErrorHandlers.filter(h => h !== handler);
  }
}

