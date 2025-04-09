import { useMemo, useCallback, useRef, useEffect } from 'react';
import { interpolateCode, helperFuncs } from '~/lib/evaluate';
import { useStore } from '~/store/zustand/store';
import { shallow } from 'zustand/shallow';
import { Logger } from '~/lib/logger';
import { useErrorHandler } from '~/lib/error-boundary';
import { Cache } from '~/lib/cache';

// Utility to extract component IDs from a binding expression
const extractComponentIds = (bindValue: string): string[] => {
  if (!bindValue) return [];
  
  // Cari semua pola yang mungkin merujuk ke komponen
  // Ini mencakup pola seperti input_1, components.input_1, atau input_1.props
  const regex = /\b([a-zA-Z0-9_-]+)(?:\.|\s|$)/g;
  const matches = [];
  let match;
  
  while ((match = regex.exec(bindValue)) !== null) {
    // Jangan sertakan kata kunci JavaScript umum
    const id = match[1];
    if (!['var', 'let', 'const', 'function', 'return', 'if', 'else', 'for', 'while', 'props', 'value', 'components', 'workflows'].includes(id)) {
      matches.push(id);
    }
  }
  
  return [...new Set(matches)]; // Hapus duplikat
};

// Deteksi apakah binding mengandung fungsi yang menghasilkan nilai acak
const containsRandomFunction = (bindValue: string): boolean => {
  if (!bindValue) return false;
  
  return bindValue.includes('uuid.v4()') || 
         bindValue.includes('Date.now()') ||
         bindValue.includes('Math.random()');
};

// Deteksi apakah binding mengandung template string
const containsTemplateString = (bindValue: string): boolean => {
  if (!bindValue) return false;
  
  // Cek apakah ada backtick dan ${...} di dalam bindValue
  return bindValue.includes('`') && bindValue.includes('${');
};

/**
 * Hook untuk mendapatkan nilai yang terikat (bound) dari properti komponen
 * @param itemProps - Properti komponen atau string
 * @returns Nilai yang sudah di-resolve
 */
export const useBoundValue = (itemProps?: string | { bindable: boolean, bindValue: string, defaultValue: any, value: any }) => {
  const logger = useMemo(() => Logger.getInstance(), []);
  const handleError = useErrorHandler();
  const cache = useMemo(() => Cache.getInstance(), []);
  
  // Referensi untuk menyimpan nilai terakhir yang dievaluasi
  const lastEvaluatedValueRef = useRef<any>(null);
  const lastBindValueRef = useRef<string | null>(null);
  
  // Referensi untuk menyimpan apakah ini adalah evaluasi pertama
  const isFirstRenderRef = useRef(true);
  
  // Referensi untuk menyimpan komponen yang direferensikan terakhir
  const lastComponentsRef = useRef<Record<string, any>>({});
  
  // If not an object or not bindable, return early
  if (!itemProps || typeof itemProps !== 'object' || !itemProps.bindable) {
    if (typeof itemProps === 'object') {
      return itemProps.value !== null ? itemProps.value : itemProps.defaultValue;
    }
    return itemProps;
  }
  
  const bindValue = itemProps.bindValue || '';
  
  // If not a template expression, return the bind value directly
  if (!bindValue.match(/{{.*}}/)) {
    return bindValue;
  }
  
  // Generate cache key
  const cacheKey = `bind-${bindValue}`;
  
  // Try to get from cache first for non-random values
  if (!containsRandomFunction(bindValue) && !containsTemplateString(bindValue)) {
    const cachedValue = cache.get(cacheKey);
    if (cachedValue !== undefined) {
      logger.debug('Using cached bound value', { bindValue: bindValue.substring(0, 50) });
      return cachedValue;
    }
  }
  
  // Cek apakah ini adalah fungsi yang menghasilkan nilai acak
  const hasRandomFunction = useMemo(() => containsRandomFunction(bindValue), [bindValue]);
  
  // Cek apakah ini adalah template string
  const hasTemplateString = useMemo(() => containsTemplateString(bindValue), [bindValue]);
  
  // Jika bindValue berubah, kita perlu mengevaluasi ulang
  const bindValueChanged = lastBindValueRef.current !== bindValue;
  lastBindValueRef.current = bindValue;
  
  // Extract component IDs from the binding expression to create a more specific selector
  const componentIds = useMemo(() => extractComponentIds(bindValue), [bindValue]);
  
  // Get only the components that are referenced in the binding
  const referencedComponents = useStore(state => {
    const components = {};
    componentIds.forEach(id => {
      if (state.component[id]) {
        components[id] = state.component[id];
      }
    });
    return components;
  }, (prev, next) => {
    // Hanya re-render jika komponen yang direferensikan berubah
    if (Object.keys(prev).length !== Object.keys(next).length) {
      return false;
    }
    
    // Bandingkan setiap komponen yang direferensikan
    for (const id in prev) {
      if (!next[id] || !shallow(prev[id].props, next[id].props)) {
        return false;
      }
    }
    
    return true;
  });
  
  // Get current page app state
  const currentPageAppState = useStore(state => {
    const pageId = state.selectedPage;
    if (!pageId) return {};
    return state.pageAppState[pageId] || {};
  });
  
  // Get global localStorage
  const globalLocalStorage = useStore(state => state.localStorage);
  
  // Get workflows if needed - also with a specific selector
  const relevantWorkflows = useStore(state => {
    if (!bindValue.includes('workflows.')) return null;
    
    // If we need workflows, extract the workflow IDs from the binding
    const workflowMatches = bindValue.match(/workflows\.[a-zA-Z0-9_-]+/g);
    if (!workflowMatches) return null;
    
    const workflowIds = workflowMatches.map(match => match.replace('workflows.', ''));
    const result = {};
    
    workflowIds.forEach(id => {
      if (state.workflow[id]) {
        result[id] = state.workflow[id];
      }
    });
    
    return result;
  }, shallow);
  
  // Periksa apakah komponen yang direferensikan berubah
  const componentsChanged = useMemo(() => {
    if (Object.keys(referencedComponents).length !== Object.keys(lastComponentsRef.current).length) {
      lastComponentsRef.current = referencedComponents;
      return true;
    }
    
    for (const id in referencedComponents) {
      if (!lastComponentsRef.current[id] || 
          !shallow(referencedComponents[id].props, lastComponentsRef.current[id].props)) {
        lastComponentsRef.current = referencedComponents;
        return true;
      }
    }
    
    return false;
  }, [referencedComponents]);
  
  // Memoize the evaluation function to avoid recreating it on each render
  const evaluateBinding = useCallback((
    bindValue: string, 
    components: Record<string, any>, 
    workflows: Record<string, any> | null,
    componentIds: string[],
    appState: Record<string, any>,
    localStorage: Record<string, any>
  ) => {
    try {
      // Create a scope with components and helper functions
      const scope = {
        components,
        workflows,
        appState,
        localStorage,
        // Tambahkan akses langsung ke komponen untuk mendukung pola seperti input_1.props.value
        ...Object.fromEntries(
          componentIds.map(id => [id, components[id]])
        ),
        ...helperFuncs
      };
      
      // Interpolate the binding expression
      return interpolateCode(bindValue, scope);
    } catch (error) {
      logger.error('Error evaluating binding', error as Error, { bindValue });
      handleError(error);
      return null;
    }
  }, [logger, handleError]);
  
  // Evaluasi binding hanya jika:
  // 1. bindValue berubah
  // 2. komponen yang direferensikan berubah
  // 3. ini adalah fungsi acak dan ini adalah render pertama
  // 4. ini adalah template string (selalu evaluasi ulang)
  // 5. appState atau localStorage berubah
  const evaluatedValue = useMemo(() => {
    try {
      // Jika ini adalah template string, selalu evaluasi ulang
      if (hasTemplateString) {
        const result = evaluateBinding(
          bindValue, 
          referencedComponents, 
          relevantWorkflows, 
          componentIds,
          currentPageAppState,
          globalLocalStorage
        );
        lastEvaluatedValueRef.current = result;
        return result;
      }
      
      // Jika ini adalah fungsi acak, kita hanya mengevaluasi pada render pertama
      // atau jika bindValue berubah
      if (hasRandomFunction) {
        if (isFirstRenderRef.current || bindValueChanged) {
          const result = evaluateBinding(
            bindValue, 
            referencedComponents, 
            relevantWorkflows, 
            componentIds,
            currentPageAppState,
            globalLocalStorage
          );
          lastEvaluatedValueRef.current = result;
          isFirstRenderRef.current = false;
          return result;
        }
        
        // Jika bukan render pertama dan bindValue tidak berubah, gunakan nilai yang sudah dievaluasi
        return lastEvaluatedValueRef.current;
      }
      
      // Untuk binding non-acak, evaluasi ulang jika bindValue berubah atau komponen yang direferensikan berubah
      if (bindValueChanged || componentsChanged) {
        const result = evaluateBinding(
          bindValue, 
          referencedComponents, 
          relevantWorkflows, 
          componentIds,
          currentPageAppState,
          globalLocalStorage
        );
        lastEvaluatedValueRef.current = result;
        
        // Cache the result for non-random values
        if (!hasRandomFunction && !hasTemplateString) {
          cache.set(cacheKey, result, 5000); // Cache for 5 seconds
        }
        
        return result;
      }
      
      // Jika tidak ada perubahan, gunakan nilai yang sudah dievaluasi sebelumnya
      return lastEvaluatedValueRef.current;
    } catch (error) {
      logger.error('Error in useBoundValue', error as Error, { bindValue });
      return itemProps.value !== null ? itemProps.value : itemProps.defaultValue;
    }
  }, [
    bindValue, 
    bindValueChanged,
    referencedComponents, 
    componentsChanged,
    relevantWorkflows, 
    componentIds, 
    evaluateBinding, 
    logger, 
    itemProps.value, 
    itemProps.defaultValue,
    hasRandomFunction,
    hasTemplateString,
    cache,
    cacheKey,
    currentPageAppState,
    globalLocalStorage
  ]);
  
  // Pastikan isFirstRenderRef diatur ke false setelah render pertama
  useEffect(() => {
    isFirstRenderRef.current = false;
    
    // Log untuk debugging
    logger.debug('useBoundValue evaluation', { 
      bindValue: bindValue.substring(0, 50), 
      hasRandomFunction,
      hasTemplateString,
      componentsChanged,
      bindValueChanged,
      componentIds,
      result: typeof evaluatedValue === 'string' ? evaluatedValue.substring(0, 50) : typeof evaluatedValue
    });
  }, [bindValue, hasRandomFunction, hasTemplateString, componentsChanged, bindValueChanged, componentIds, logger, evaluatedValue]);
  
  // Jika evaluasi gagal, gunakan nilai default
  return evaluatedValue !== null ? evaluatedValue : (itemProps.value !== null ? itemProps.value : itemProps.defaultValue);
};