/**
 * Level log yang tersedia
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

/**
 * Konfigurasi untuk logger
 */
export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  remoteUrl?: string;
  appVersion?: string;
  bufferSize?: number;
}

/**
 * Entry log
 */
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  stackTrace?: string;
}

/**
 * Logger untuk aplikasi
 */
export class Logger {
  private static instance: Logger;
  private config: LoggerConfig;
  private buffer: LogEntry[] = [];
  
  /**
   * Mendapatkan instance singleton dari logger
   */
  public static getInstance(config?: Partial<LoggerConfig>): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(config);
    } else if (config) {
      Logger.instance.updateConfig(config);
    }
    return Logger.instance;
  }
  
  /**
   * Constructor privat untuk memastikan penggunaan singleton
   */
  private constructor(config?: Partial<LoggerConfig>) {
    this.config = {
      level: LogLevel.INFO,
      enableConsole: true,
      enableRemote: false,
      bufferSize: 100,
      ...config
    };
  }
  
  /**
   * Memperbarui konfigurasi logger
   */
  public updateConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }
  
  /**
   * Log pesan debug
   */
  public debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context);
  }
  
  /**
   * Log pesan info
   */
  public info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context);
  }
  
  /**
   * Log pesan warning
   */
  public warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context);
  }
  
  /**
   * Log pesan error
   */
  public error(message: string, error?: Error, context?: Record<string, any>): void {
    this.log(
      LogLevel.ERROR,
      message,
      context,
      error?.stack
    );
  }
  
  /**
   * Metode log internal
   */
  private log(level: LogLevel, message: string, context?: Record<string, any>, stackTrace?: string): void {
    // Periksa level log
    if (level < this.config.level) {
      return;
    }
    
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      stackTrace
    };
    
    // Tambahkan ke buffer
    this.buffer.push(entry);
    if (this.buffer.length > (this.config.bufferSize || 100)) {
      this.buffer.shift();
    }
    
    // Log ke console jika diaktifkan
    if (this.config.enableConsole) {
      this.logToConsole(entry);
    }
    
    // Kirim ke remote jika diaktifkan
    if (this.config.enableRemote && this.config.remoteUrl) {
      this.sendToRemote(entry);
    }
  }
  
  /**
   * Log ke console
   */
  private logToConsole(entry: LogEntry): void {
    const { level, message, context, stackTrace } = entry;
    
    const timestamp = new Date(entry.timestamp).toLocaleTimeString();
    const prefix = `[${timestamp}]`;
    
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(prefix, message, context || '');
        break;
      case LogLevel.INFO:
        console.info(prefix, message, context || '');
        break;
      case LogLevel.WARN:
        console.warn(prefix, message, context || '');
        break;
      case LogLevel.ERROR:
        console.error(prefix, message, context || '');
        if (stackTrace) {
          console.error(stackTrace);
        }
        break;
    }
  }
  
  /**
   * Kirim log ke remote server
   */
  private sendToRemote(entry: LogEntry): void {
    if (!this.config.remoteUrl) return;
    
    // Tambahkan versi aplikasi jika tersedia
    const payload = {
      ...entry,
      appVersion: this.config.appVersion
    };
    
    // Gunakan fetch API untuk mengirim log
    fetch(this.config.remoteUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      // Gunakan keepalive untuk memastikan request selesai meskipun halaman ditutup
      keepalive: true
    }).catch(err => {
      // Jangan log error di sini untuk menghindari loop tak terbatas
      if (this.config.enableConsole) {
        console.error('[Logger] Failed to send log to remote:', err);
      }
    });
  }
  
  /**
   * Mendapatkan semua log dalam buffer
   */
  public getLogs(): LogEntry[] {
    return [...this.buffer];
  }
  
  /**
   * Membersihkan buffer log
   */
  public clearLogs(): void {
    this.buffer = [];
  }
  
  /**
   * Mengekspor log ke JSON
   */
  public exportLogs(): string {
    return JSON.stringify(this.buffer, null, 2);
  }
}

/**
 * Hook untuk mengakses logger
 * @returns Instance dari Logger
 */
export function useLogger() {
  return Logger.getInstance();
}