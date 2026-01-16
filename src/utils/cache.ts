import { DB_CONFIG } from './constants';

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  userId: string;
  version: number;
}

export class CacheManager {
  private static instance: CacheManager;
  private cache: Map<string, CacheEntry<any>> = new Map();
  private version = 1;

  static getInstance(): CacheManager {
    if (!this.instance) {
      this.instance = new CacheManager();
    }
    return this.instance;
  }

  set<T>(key: string, data: T, userId: string): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      userId,
      version: this.version
    });
  }

  get<T>(key: string, userId: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry || entry.userId !== userId) {
      return null;
    }

    const isOnline = navigator.onLine;
    const maxAge = isOnline ? DB_CONFIG.CACHE_DURATION.ONLINE : DB_CONFIG.CACHE_DURATION.OFFLINE;
    
    if (Date.now() - entry.timestamp > maxAge) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidateUser(userId: string): void {
    for (const [key, entry] of this.cache.entries()) {
      if (entry.userId === userId) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }

  getStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }

  // Cleanup old entries
  cleanup(): void {
    const now = Date.now();
    const maxAge = DB_CONFIG.CACHE_DURATION.OFFLINE; // Use longer duration for cleanup
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > maxAge) {
        this.cache.delete(key);
      }
    }
  }
}

// Auto-cleanup every 10 minutes
setInterval(() => {
  CacheManager.getInstance().cleanup();
}, 10 * 60 * 1000);