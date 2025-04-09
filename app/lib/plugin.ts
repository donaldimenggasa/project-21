import { ComponentRegistry } from './registry';

/**
 * Interface untuk plugin komponen
 */
export interface ComponentPlugin {
  /**
   * Nama unik plugin
   */
  name: string;
  
  /**
   * Versi plugin
   */
  version: string;
  
  /**
   * Deskripsi plugin
   */
  description?: string;
  
  /**
   * Komponen-komponen yang disediakan oleh plugin
   */
  components: Record<string, any>;
  
  /**
   * Fungsi inisialisasi yang dipanggil saat plugin didaftarkan
   */
  initialize?: () => void;
  
  /**
   * Fungsi pembersihan yang dipanggil saat plugin dihapus
   */
  cleanup?: () => void;
}

/**
 * Manager untuk plugin komponen
 */
export class PluginManager {
  private static instance: PluginManager;
  private plugins: Map<string, ComponentPlugin> = new Map();
  private registry: ComponentRegistry;
  
  /**
   * Mendapatkan instance singleton dari plugin manager
   */
  public static getInstance(): PluginManager {
    if (!PluginManager.instance) {
      PluginManager.instance = new PluginManager();
    }
    return PluginManager.instance;
  }
  
  /**
   * Constructor privat untuk memastikan penggunaan singleton
   */
  private constructor() {
    this.registry = ComponentRegistry.getInstance();
  }
  
  /**
   * Mendaftarkan plugin baru
   * @param plugin - Plugin yang akan didaftarkan
   * @throws Error jika plugin dengan nama yang sama sudah terdaftar
   */
  public register(plugin: ComponentPlugin): void {
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin "${plugin.name}" already registered.`);
    }
    
    // Simpan plugin
    this.plugins.set(plugin.name, plugin);
    
    // Daftarkan komponen-komponen plugin ke registry
    this.registry.registerPlugin(plugin);
    
    // Panggil fungsi inisialisasi jika ada
    if (plugin.initialize) {
      plugin.initialize();
    }
    
    console.log(`Plugin "${plugin.name}" v${plugin.version} registered successfully.`);
  }
  
  /**
   * Menghapus plugin
   * @param name - Nama plugin yang akan dihapus
   * @returns true jika berhasil dihapus, false jika tidak ditemukan
   */
  public unregister(name: string): boolean {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      return false;
    }
    
    // Panggil fungsi pembersihan jika ada
    if (plugin.cleanup) {
      plugin.cleanup();
    }
    
    // Hapus komponen-komponen plugin dari registry
    Object.keys(plugin.components).forEach(type => {
      this.registry.unregister(type);
    });
    
    // Hapus plugin dari daftar
    return this.plugins.delete(name);
  }
  
  /**
   * Mendapatkan plugin berdasarkan nama
   * @param name - Nama plugin
   * @returns Plugin atau undefined jika tidak ditemukan
   */
  public get(name: string): ComponentPlugin | undefined {
    return this.plugins.get(name);
  }
  
  /**
   * Mendapatkan semua plugin yang terdaftar
   * @returns Map dari semua plugin
   */
  public getAll(): Map<string, ComponentPlugin> {
    return new Map(this.plugins);
  }
  
  /**
   * Memeriksa apakah plugin sudah terdaftar
   * @param name - Nama plugin
   * @returns true jika terdaftar, false jika tidak
   */
  public has(name: string): boolean {
    return this.plugins.has(name);
  }
}

/**
 * Hook untuk mengakses plugin manager
 * @returns Instance dari PluginManager
 */
export function usePluginManager() {
  return PluginManager.getInstance();
}