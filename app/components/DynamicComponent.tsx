import React, { Fragment, memo, useMemo, useCallback } from 'react';
import { Component } from '~/lib/types';
import { useStore, useComponentChildren, useComponentActions } from '~/store/zustand/store';
import { componentConfigs } from '~/components/widgets';
import { ErrorBoundary } from '~/lib/error-boundary';
import { useRenderTimer } from '~/lib/performance';
import { Logger } from '~/lib/logger';
import pkg from 'lodash';
const {isEqual} = pkg;


interface DynamicComponentProps {
  component: Component;
}

interface EditorProps {
  'data-component-id': string;
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

/**
 * Komponen untuk menampilkan error saat rendering komponen gagal
 */
const ComponentErrorFallback = ({ error, resetError, componentId, componentType }: { 
  error: Error; 
  resetError: () => void; 
  componentId: string;
  componentType: string;
}) => {
  return (
    <div className="p-3 border border-red-300 bg-red-50 rounded-md text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
      <div className="flex items-center gap-2 mb-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <span className="font-medium">Error rendering component: {componentType} (ID: {componentId})</span>
      </div>
      <pre className="text-xs bg-red-100 dark:bg-red-900/30 p-2 rounded overflow-auto max-h-32 mb-2">
        {error.message}
      </pre>
      <button 
        onClick={resetError}
        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded"
      >
        Coba Lagi
      </button>
    </div>
  );
};

export const DynamicComponent: React.FC<DynamicComponentProps> = memo(({ component }) => {
  // Gunakan custom hooks untuk mendapatkan data
  const children = useComponentChildren(component.id);
  const { setSelectedComponent, setHoveredComponent, deleteComponent } = useComponentActions();
  const logger = useMemo(() => Logger.getInstance(), []);
  
  // Measure render time
  useRenderTimer(`DynamicComponent(${component.type}:${component.id})`);
  
  // Get component config
  const config = componentConfigs[component.type as keyof typeof componentConfigs];
  const { builder } = config || {};
  
  // Memoize editor props untuk mencegah re-render
  const editorProps = useMemo<EditorProps>(() => ({
    'data-component-id': component.id,
    onClick: (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      setSelectedComponent(component.id);
    },
    onMouseEnter: () => setHoveredComponent(component.id),
    onMouseLeave: () => setHoveredComponent(null),
  }), [component.id, setSelectedComponent, setHoveredComponent]);

  // Handle component deletion
  const handleDelete = useCallback(() => {
    try {
      deleteComponent(component.id);
    } catch (error) {
      logger.error('Error deleting component', error as Error, { componentId: component.id });
    }
  }, [component.id, deleteComponent, logger]);

  // Log error jika builder tidak ditemukan
  if (!builder) {
    logger.warn(`Builder not found for component type: ${component.type}`, { componentId: component.id });
    return <Fragment />;
  }

  type ComponentRenderProps = { component: Component; children?: React.ReactNode; editorProps?: EditorProps };
  const ComponentRender = builder.render as React.ComponentType<ComponentRenderProps>;

  // Gunakan ErrorBoundary untuk menangkap error rendering
  return (
    <ErrorBoundary
      fallback={(error, resetError) => (
        <ComponentErrorFallback 
          error={error} 
          resetError={resetError} 
          componentId={component.id} 
          componentType={component.type} 
        />
      )}
      onError={(error) => {
        logger.error(`Error rendering component: ${component.type}`, error, { componentId: component.id });
      }}
    >
      <ComponentRender component={component} editorProps={editorProps}>
        {children.map((child: Component) => {
          if (!componentConfigs[child.type as keyof typeof componentConfigs]) {
            logger.warn(`Unknown component type: ${child.type}`, { componentId: child.id });
            return <Fragment key={child.id} />;
          }
          return <DynamicComponent key={child.id} component={child} />;
        })}
      </ComponentRender>
    </ErrorBoundary>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function untuk memo
  const prev = prevProps.component;
  const next = nextProps.component;

  // Check if component has bindings in its props
  const hasBindings = (component: Component) => {
    if (!component.props) return false;
    
    return Object.values(component.props).some(
      prop => typeof prop === 'object' && prop && 'bindable' in prop && prop.bindable
    );
  };

  // Jika komponen memiliki binding, kita perlu membandingkan lebih dalam
  if (hasBindings(prev) || hasBindings(next)) {
    // Bandingkan ID dan tipe
    if (prev.id !== next.id || prev.type !== next.type) {
      return false;
    }
    
    // Bandingkan props dengan deep comparison
    if (!isEqual(prev.props, next.props)) {
      return false;
    }
    
    // Bandingkan value
    if (prev.value !== next.value) {
      return false;
    }
    
    // Jika semua perbandingan lolos, komponen dianggap sama
    return true;
  }

  // Untuk komponen tanpa binding, gunakan perbandingan sederhana
  return (
    prev.id === next.id &&
    prev.type === next.type &&
    isEqual(prev.props, next.props) &&
    prev.value === next.value
  );
});

DynamicComponent.displayName = 'DynamicComponent';