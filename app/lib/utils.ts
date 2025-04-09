import { type ClassValue, clsx } from 'clsx';
import { v4 as uuidv4 } from 'uuid';

/**
 * Utility function untuk menggabungkan class names dengan Tailwind
 * @param inputs - Class names yang akan digabungkan
 * @returns String class names yang sudah digabung
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Menghasilkan checksum sederhana dari data string
 * @param data - String data yang akan dihitung checksumnya
 * @returns Checksum dalam format hexadecimal
 */
export function generateChecksum(data: string): string {
  // Simple implementation of djb2 hash algorithm
  let hash = 5381;
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) + hash) + data.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
}

/**
 * Membuat ID unik untuk komponen
 * @returns String ID unik
 */
export function createId(): string {
  return uuidv4().substring(0, 8);
}

/**
 * Memformat ukuran file dalam bytes ke format yang lebih mudah dibaca
 * @param bytes - Ukuran file dalam bytes
 * @param decimals - Jumlah angka desimal
 * @returns String ukuran file yang sudah diformat
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Memformat tanggal ke format yang lebih mudah dibaca
 * @param date - Tanggal yang akan diformat
 * @returns String tanggal yang sudah diformat
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Memvalidasi string JSON
 * @param str - String JSON yang akan divalidasi
 * @returns Boolean apakah string valid JSON
 */
export function isValidJson(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Menunda eksekusi selama waktu tertentu
 * @param ms - Waktu penundaan dalam milidetik
 * @returns Promise yang resolve setelah waktu yang ditentukan
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Menghasilkan warna acak dalam format hex
 * @returns String warna hex
 */
export function randomColor(): string {
  return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
}

/**
 * Memotong teks jika melebihi panjang maksimum
 * @param text - Teks yang akan dipotong
 * @param maxLength - Panjang maksimum
 * @param suffix - Suffix yang ditambahkan jika teks dipotong
 * @returns Teks yang sudah dipotong
 */
export function truncateText(text: string, maxLength: number, suffix: string = '...'): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + suffix;
}

/**
 * Mengubah string menjadi slug
 * @param text - Teks yang akan diubah menjadi slug
 * @returns String slug
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

/**
 * Mengambil nilai dari objek dengan path string
 * @param obj - Objek sumber
 * @param path - Path string (e.g., 'user.address.city')
 * @param defaultValue - Nilai default jika path tidak ditemukan
 * @returns Nilai dari path atau defaultValue
 */
export function getValueByPath(obj: any, path: string, defaultValue: any = undefined): any {
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result === undefined || result === null) {
      return defaultValue;
    }
    result = result[key];
  }
  
  return result === undefined ? defaultValue : result;
}

/**
 * Mengatur nilai pada objek dengan path string
 * @param obj - Objek target
 * @param path - Path string (e.g., 'user.address.city')
 * @param value - Nilai yang akan diatur
 * @returns Objek yang sudah dimodifikasi
 */
export function setValueByPath(obj: any, path: string, value: any): any {
  const keys = path.split('.');
  const lastKey = keys.pop();
  let current = obj;
  
  // Create nested objects if they don't exist
  for (const key of keys) {
    if (current[key] === undefined || current[key] === null) {
      current[key] = {};
    }
    current = current[key];
  }
  
  if (lastKey) {
    current[lastKey] = value;
  }
  
  return obj;
}

/**
 * Menghapus properti dari objek dengan path string
 * @param obj - Objek target
 * @param path - Path string (e.g., 'user.address.city')
 * @returns Objek yang sudah dimodifikasi
 */
export function removeValueByPath(obj: any, path: string): any {
  const keys = path.split('.');
  const lastKey = keys.pop();
  let current = obj;
  
  // Navigate to the parent object
  for (const key of keys) {
    if (current[key] === undefined || current[key] === null) {
      return obj; // Path doesn't exist, nothing to remove
    }
    current = current[key];
  }
  
  if (lastKey && current[lastKey] !== undefined) {
    delete current[lastKey];
  }
  
  return obj;
}

/**
 * Menghasilkan ID unik yang lebih pendek dan mudah dibaca
 * @returns String ID unik
 */
export function createShortId(): string {
  const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const ID_LENGTH = 7;
  let result = '';
  const alphabetLength = ALPHABET.length;
  for (let i = 0; i < ID_LENGTH; i++) {
      const randomIndex = Math.floor(Math.random() * alphabetLength);
      result += ALPHABET.charAt(randomIndex);
  }
  return result;
}

/**
 * Memeriksa apakah dua objek sama secara dangkal (shallow equal)
 * @param obj1 - Objek pertama
 * @param obj2 - Objek kedua
 * @returns Boolean apakah objek sama
 */
export function shallowEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  if (!obj1 || !obj2) return false;
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) return false;
  }
  
  return true;
}

/**
 * Memeriksa apakah nilai adalah objek
 * @param value - Nilai yang akan diperiksa
 * @returns Boolean apakah nilai adalah objek
 */
export function isObject(value: any): boolean {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Menggabungkan dua objek secara mendalam (deep merge)
 * @param target - Objek target
 * @param source - Objek sumber
 * @returns Objek hasil penggabungan
 */
export function deepMerge(target: any, source: any): any {
  if (!isObject(target) || !isObject(source)) {
    return source;
  }
  
  const output = { ...target };
  
  Object.keys(source).forEach(key => {
    if (isObject(source[key])) {
      if (!(key in target)) {
        output[key] = source[key];
      } else {
        output[key] = deepMerge(target[key], source[key]);
      }
    } else {
      output[key] = source[key];
    }
  });
  
  return output;
}