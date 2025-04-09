import { useCallback, memo, Suspense, lazy, useState, useEffect, useRef } from 'react';
import { shallow } from 'zustand/shallow';
import { useStore } from '~/store/zustand/store';
import { ErrorBoundary } from '~/lib/error-boundary';
import { Logger } from '~/lib/logger';
import { useRenderTimer } from '~/lib/performance';
import { Cache } from '~/lib/cache';
import { DynamicComponent } from '~/components/DynamicComponent';
import { ComponentOverlay } from './ComponentOverlay';

// Fallback loading component
const LoadingFallback = () => (
  <div className="h-full w-full flex items-center justify-center bg-gray-100 dark:bg-gray-900">
    <div className="animate-pulse text-gray-500 dark:text-gray-400">
      Loading...
    </div>
  </div>
);

// Error fallback component
const ErrorFallback = ({ error, resetError }: { error: Error, resetError: () => void }) => {
  const logger = Logger.getInstance();
  
  // Log error
  logger.error('Error in MainContent', error);
  
  return (
    <div className="h-full w-full flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">
          Terjadi kesalahan saat merender konten
        </h2>
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
          <pre className="text-sm text-red-800 dark:text-red-300 whitespace-pre-wrap">
            {error.message}
          </pre>
        </div>
        <button
          onClick={resetError}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );
};

// Empty state component
const EmptyState = () => (
  <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="text-center">
      <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No Content</h2>
      <p className="text-gray-500 dark:text-gray-400">
        This page has no content. Add components to get started.
      </p>
    </div>
  </div>
);

// Komponen yang terisolasi untuk root component
const RootComponentRenderer = memo(({ rootComponent }) => {
  // Measure render time
  useRenderTimer('RootComponentRenderer');
  
  if (!rootComponent) {
    return <EmptyState />;
  }

  return (
    <div id="main-content-container" className="w-full h-full overflow-y-auto overflow-x-hidden relative custom-scrollbar">
      <DynamicComponent component={rootComponent} />
      <ComponentOverlay />
    </div>
  );
});

RootComponentRenderer.displayName = 'RootComponentRenderer';

// Komponen utama yang hanya mengambil data yang dibutuhkan
const MainContent = () => {
  // Measure render time
  useRenderTimer('MainContent');
  const logger = Logger.getInstance();
  const cache = Cache.getInstance();
  
  // Use a ref to track if this is the first render
  const isFirstRender = useRef(true);
  
  // State for tracking render count (for debugging)
  const [renderCount, setRenderCount] = useState(0);
  
  // Gunakan selector yang sangat spesifik dengan shallow comparison
  const { selectedPage, rootComponent } = useStore(
    state => {
      // Try to get from cache first
      const cacheKey = `main-content-root-${state.selectedPage}`;
      const cachedData = cache.get(cacheKey);
      
      if (cachedData) {
        return cachedData;
      }
      
      // If not in cache, find root component
      const rootComp = Object.values(state.component).find(
        c => c.parentId === null && c.pageId === state.selectedPage
      );
      
      const result = {
        selectedPage: state.selectedPage,
        rootComponent: rootComp
      };
      
      // Cache the result
      cache.set(cacheKey, result, 5000); // Cache for 5 seconds
      
      return result;
    },
    // Gunakan shallow comparison untuk mencegah re-render yang tidak perlu
    shallow
  );

  // Only increment render count on first render or when dependencies change
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
    } else {
      // This will only run when dependencies actually change
      setRenderCount(prev => prev + 1);
      logger.debug('MainContent re-rendered', { 
        renderCount: renderCount + 1,
        selectedPage,
        rootComponentId: rootComponent?.id
      });
    }
  }, [selectedPage, rootComponent, logger]);

  

  const handleError = useCallback((error: Error) => {
    logger.error('Error in MainContent', error);
  }, [logger]);

  return (
    <ErrorBoundary 
      fallback={ErrorFallback}
      onError={handleError}
    >
      <Suspense fallback={<LoadingFallback />}>
        <RootComponentRenderer rootComponent={rootComponent} />
      </Suspense>
    </ErrorBoundary>
  );
};

export default memo(MainContent);