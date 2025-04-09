import { ComponentConfigBuilder } from '~/lib/types';
import { componentConfigs } from '~/components/widgets';

/**
 * Registry untuk komponen yang tersedia dalam aplikasi
 * Menyediakan metode untuk mendaftarkan, mengambil, dan mengelola komponen
 */
export class ComponentRegistry {
  private static instance: ComponentRegistry;
  private components: Map<string, any> = new Map();
  
  /**
   * Mendapatkan instance singleton dari registry
   */
  public static getInstance(): ComponentRegistry {
    if (!ComponentRegistry.instance) {
      ComponentRegistry.instance = new ComponentRegistry();
    }
    return ComponentRegistry.instance;
  }
  
  /**
   * Constructor privat untuk memastikan penggunaan singleton
   */
  private constructor() {
    // Inisialisasi registry dengan komponen default
    this.registerDefaultComponents();
  }
  
  /**
   * Mendaftarkan komponen default dari componentConfigs
   */
  private registerDefaultComponents(): void {
    Object.entries(componentConfigs).forEach(([type, config]) => {
      this.register(type, config);
    });
  }
  
  /**
   * Mendaftarkan komponen baru ke registry
   * @param type - Tipe komponen
   * @param component - Konfigurasi komponen
   */
  public register(type: string, component: any): void {
    if (this.components.has(type)) {
      console.warn(`Component type "${type}" already registered. Overwriting.`);
    }
    this.components.set(type, component);
  }
  
  /**
   * Mendapatkan komponen berdasarkan tipe
   * @param type - Tipe komponen
   * @returns Konfigurasi komponen atau undefined jika tidak ditemukan
   */
  public get(type: string): any {
    return this.components.get(type);
  }
  
  /**
   * Mendapatkan semua komponen yang terdaftar
   * @returns Map dari semua komponen
   */
  public getAll(): Map<string, any> {
    return new Map(this.components);
  }
  
  /**
   * Mendapatkan array dari semua tipe komponen
   * @returns Array dari tipe komponen
   */
  public getTypes(): string[] {
    return Array.from(this.components.keys());
  }
  
  /**
   * Menghapus komponen dari registry
   * @param type - Tipe komponen yang akan dihapus
   * @returns true jika berhasil dihapus, false jika tidak ditemukan
   */
  public unregister(type: string): boolean {
    return this.components.delete(type);
  }
  
  /**
   * Memeriksa apakah tipe komponen sudah terdaftar
   * @param type - Tipe komponen
   * @returns true jika terdaftar, false jika tidak
   */
  public has(type: string): boolean {
    return this.components.has(type);
  }
  
  /**
   * Mendaftarkan plugin komponen
   * @param plugin - Plugin yang berisi komponen-komponen
   */
  public registerPlugin(plugin: { components: Record<string, any> }): void {
    Object.entries(plugin.components).forEach(([type, component]) => {
      this.register(type, component);
    });
  }
}

/**
 * Hook untuk mengakses registry komponen
 * @returns Instance dari ComponentRegistry
 */
export function useComponentRegistry() {
  return ComponentRegistry.getInstance();
}