import { useRef, useEffect, useCallback } from 'react';

/**
 * Hook untuk mengukur waktu render komponen
 * @param componentName - Nama komponen untuk logging
 * @param threshold - Ambang batas waktu render dalam ms untuk menampilkan peringatan
 */
export function useRenderTimer(componentName: string, threshold: number = 16): void {
  const startTimeRef = useRef<number>(0);
  
  useEffect(() => {
    startTimeRef.current = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTimeRef.current;
      
      if (renderTime > threshold) {
        console.warn(`[Performance] ${componentName} took ${renderTime.toFixed(2)}ms to render (threshold: ${threshold}ms)`);
      }
    };
  });
}

/**
 * Hook untuk meng-cache nilai dengan deep comparison
 * @param value - Nilai yang akan di-cache
 * @param isEqual - Fungsi untuk membandingkan nilai
 * @returns Nilai yang di-cache
 */
export function useDeepMemoize<T>(value: T, isEqual: (prev: T, next: T) => boolean): T {
  const ref = useRef<T>(value);
  
  if (!isEqual(ref.current, value)) {
    ref.current = value;
  }
  
  return ref.current;
}

/**
 * Hook untuk membatasi frekuensi eksekusi fungsi (throttle)
 * @param callback - Fungsi yang akan dibatasi
 * @param delay - Delay dalam ms
 * @returns Fungsi yang sudah dibatasi
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const lastCall = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastArgsRef = useRef<Parameters<T> | null>(null);
  
  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCall.current;
      
      lastArgsRef.current = args;
      
      if (timeSinceLastCall >= delay) {
        lastCall.current = now;
        callback(...args);
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = setTimeout(() => {
          lastCall.current = Date.now();
          if (lastArgsRef.current) {
            callback(...lastArgsRef.current);
          }
          timeoutRef.current = null;
        }, delay - timeSinceLastCall);
      }
    },
    [callback, delay]
  );
  
  // Cleanup pada unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return throttledCallback;
}

/**
 * Hook untuk menunda eksekusi fungsi (debounce)
 * @param callback - Fungsi yang akan ditunda
 * @param delay - Delay dalam ms
 * @returns Fungsi yang sudah di-debounce
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
        timeoutRef.current = null;
      }, delay);
    },
    [callback, delay]
  );
  
  // Cleanup pada unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return debouncedCallback;
}

/**
 * Fungsi untuk mengukur waktu eksekusi fungsi
 * @param fn - Fungsi yang akan diukur
 * @param name - Nama untuk logging
 * @returns Fungsi yang sama dengan pengukuran waktu
 */
export function measurePerformance<T extends (...args: any[]) => any>(
  fn: T,
  name: string
): (...args: Parameters<T>) => ReturnType<T> {
  return (...args: Parameters<T>): ReturnType<T> => {
    const start = performance.now();
    const result = fn(...args);
    const end = performance.now();
    
    console.log(`[Performance] ${name} took ${(end - start).toFixed(2)}ms`);
    
    return result;
  };
}