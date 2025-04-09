import { Logger } from './logger';

/**
 * Interface untuk cache entry
 */
interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number;
}

/**
 * Kelas untuk mengelola cache dalam aplikasi
 */
export class Cache<T = any> {
  private static instance: Cache;
  private cache: Map<string, CacheEntry<T>> = new Map();
  private logger = Logger.getInstance();
  
  /**
   * Mendapatkan instance singleton dari cache
   */
  public static getInstance<T>(): Cache<T> {
    if (!Cache.instance) {
      Cache.instance = new Cache<T>();
    }
    return Cache.instance as Cache<T>;
  }
  
  /**
   * Constructor privat untuk memastikan penggunaan singleton
   */
  private constructor() {
    // Jalankan garbage collection secara berkala
    setInterval(() => this.gc(), 60000); // Setiap 1 menit
  }
  
  /**
   * Menyimpan nilai ke cache
   * @param key - Kunci cache
   * @param value - Nilai yang akan disimpan
   * @param ttl - Time to live dalam milidetik (default: 5 menit)
   */
  public set(key: string, value: T, ttl: number = 300000): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl
    });
    
    this.logger.debug('Cache set', { key, ttl });
  }
  
  /**
   * Mendapatkan nilai dari cache
   * @param key - Kunci cache
   * @returns Nilai dari cache atau undefined jika tidak ditemukan atau expired
   */
  public get(key: string): T | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return undefined;
    }
    
    // Periksa apakah entry sudah expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.logger.debug('Cache expired', { key });
      return undefined;
    }
    
    this.logger.debug('Cache hit', { key });
    return entry.value;
  }
  
  /**
   * Mendapatkan nilai dari cache atau menghasilkan nilai baru jika tidak ditemukan
   * @param key - Kunci cache
   * @param factory - Fungsi untuk menghasilkan nilai baru
   * @param ttl - Time to live dalam milidetik
   * @returns Nilai dari cache atau hasil dari factory
   */
  public async getOrSet(key: string, factory: () => Promise<T> | T, ttl?: number): Promise<T> {
    const cachedValue = this.get(key);
    
    if (cachedValue !== undefined) {
      return cachedValue;
    }
    
    try {
      const value = await factory();
      this.set(key, value, ttl);
      this.logger.debug('Cache miss, value generated', { key });
      return value;
    } catch (error) {
      this.logger.error('Error generating cache value', error as Error, { key });
      throw error;
    }
  }
  
  /**
   * Menghapus entry dari cache
   * @param key - Kunci cache
   * @returns Boolean apakah entry berhasil dihapus
   */
  public delete(key: string): boolean {
    const result = this.cache.delete(key);
    if (result) {
      this.logger.debug('Cache deleted', { key });
    }
    return result;
  }
  
  /**
   * Menghapus semua entry dari cache
   */
  public clear(): void {
    this.cache.clear();
    this.logger.debug('Cache cleared');
  }
  
  /**
   * Mendapatkan jumlah entry dalam cache
   */
  public size(): number {
    return this.cache.size;
  }
  
  /**
   * Mendapatkan semua kunci dalam cache
   */
  public keys(): string[] {
    return Array.from(this.cache.keys());
  }
  
  /**
   * Garbage collection - menghapus entry yang sudah expired
   */
  private gc(): void {
    const now = Date.now();
    let expiredCount = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        expiredCount++;
      }
    }
    
    if (expiredCount > 0) {
      this.logger.debug('Cache garbage collection', { expiredCount });
    }
  }
}

// Export a singleton instance
export const cache = Cache.getInstance();

/**
 * Hook untuk mengakses cache
 * @returns Instance dari Cache
 */
export function useCache<T = any>() {
  return Cache.getInstance<T>();
}