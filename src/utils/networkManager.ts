import { DB_CONFIG } from './constants';

export type ConnectionStatus = 'online' | 'offline' | 'reconnecting';

export interface NetworkState {
  isOnline: boolean;
  connectionType: string;
  effectiveType: string;
  downlink: number;
  rtt: number;
}

export class NetworkManager {
  private static instance: NetworkManager;
  private listeners: Set<(status: ConnectionStatus) => void> = new Set();
  private currentStatus: ConnectionStatus = 'online';
  private retryAttempts = 0;
  private maxRetries = DB_CONFIG.RETRY_ATTEMPTS;

  static getInstance(): NetworkManager {
    if (!this.instance) {
      this.instance = new NetworkManager();
      this.instance.initialize();
    }
    return this.instance;
  }

  private initialize(): void {
    // Listen to online/offline events
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
    
    // Initial status check
    this.checkConnectivity();
    
    // Periodic connectivity checks
    setInterval(() => {
      this.checkConnectivity();
    }, 30000); // Check every 30 seconds
  }

  private handleOnline(): void {
    this.setStatus('reconnecting');
    this.verifyConnectivity().then(isConnected => {
      this.setStatus(isConnected ? 'online' : 'offline');
      if (isConnected) {
        this.retryAttempts = 0;
      }
    });
  }

  private handleOffline(): void {
    this.setStatus('offline');
  }

  private setStatus(status: ConnectionStatus): void {
    if (this.currentStatus !== status) {
      this.currentStatus = status;
      this.notifyListeners(status);
    }
  }

  private notifyListeners(status: ConnectionStatus): void {
    this.listeners.forEach(listener => {
      try {
        listener(status);
      } catch (error) {
        console.error('Error in network status listener:', error);
      }
    });
  }

  async checkConnectivity(): Promise<boolean> {
    try {
      const isConnected = await this.verifyConnectivity();
      this.setStatus(isConnected ? 'online' : 'offline');
      return isConnected;
    } catch {
      this.setStatus('offline');
      return false;
    }
  }

  private async verifyConnectivity(): Promise<boolean> {
    try {
      // Try multiple endpoints for better reliability
      const endpoints = [
        'https://www.google.com/favicon.ico',
        'https://httpbin.org/status/200',
        'https://jsonplaceholder.typicode.com/posts/1'
      ];

      const promises = endpoints.map(url => 
        fetch(url, {
          method: 'HEAD',
          mode: 'no-cors',
          cache: 'no-cache',
          signal: AbortSignal.timeout(5000)
        }).then(() => true).catch(() => false)
      );

      const results = await Promise.allSettled(promises);
      const successCount = results.filter(result => 
        result.status === 'fulfilled' && result.value === true
      ).length;

      return successCount > 0;
    } catch {
      return navigator.onLine;
    }
  }

  async retryOperation<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          // Wait before retry
          await new Promise(resolve => 
            setTimeout(resolve, DB_CONFIG.RETRY_DELAY * Math.pow(2, attempt - 1))
          );
          
          // Check connectivity before retry
          const isConnected = await this.checkConnectivity();
          if (!isConnected) {
            throw new Error('No network connectivity');
          }
        }

        return await operation();
      } catch (error) {
        lastError = error as Error;
        console.warn(`Operation attempt ${attempt + 1} failed:`, error);
        
        // Don't retry on certain errors
        if (this.isNonRetryableError(error)) {
          break;
        }
      }
    }

    throw lastError!;
  }

  private isNonRetryableError(error: any): boolean {
    const nonRetryableCodes = ['401', '403', '404', '422', 'PGRST301'];
    return nonRetryableCodes.includes(error?.code) || 
           error?.message?.includes('autenticación') ||
           error?.message?.includes('permisos');
  }

  getNetworkState(): NetworkState {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    return {
      isOnline: navigator.onLine,
      connectionType: connection?.type || 'unknown',
      effectiveType: connection?.effectiveType || 'unknown',
      downlink: connection?.downlink || 0,
      rtt: connection?.rtt || 0,
    };
  }

  addStatusListener(listener: (status: ConnectionStatus) => void): () => void {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  getCurrentStatus(): ConnectionStatus {
    return this.currentStatus;
  }

  isOnline(): boolean {
    return this.currentStatus === 'online';
  }

  isOffline(): boolean {
    return this.currentStatus === 'offline';
  }

  isReconnecting(): boolean {
    return this.currentStatus === 'reconnecting';
  }
}