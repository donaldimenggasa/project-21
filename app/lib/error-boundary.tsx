import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  fallback?: ReactNode | ((error: Error, resetError: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Komponen ErrorBoundary untuk menangkap error pada rendering komponen
 * dan menampilkan fallback UI yang lebih baik
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error ke layanan monitoring
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    // Panggil handler error kustom jika disediakan
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null
    });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // Render fallback UI
      if (this.props.fallback) {
        if (typeof this.props.fallback === 'function') {
          return this.props.fallback(this.state.error, this.resetError);
        }
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="p-4 border border-red-300 bg-red-50 rounded-lg text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
          <h2 className="text-lg font-semibold mb-2">Terjadi kesalahan</h2>
          <p className="mb-4">Komponen ini gagal di-render karena error.</p>
          <details className="mb-4">
            <summary className="cursor-pointer text-sm font-medium">Detail Error</summary>
            <pre className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 rounded text-xs overflow-auto">
              {this.state.error?.toString()}
            </pre>
          </details>
          <button
            onClick={this.resetError}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC untuk membungkus komponen dengan ErrorBoundary
 * @param Component - Komponen yang akan dibungkus
 * @param errorBoundaryProps - Props untuk ErrorBoundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
): React.FC<P> {
  const displayName = Component.displayName || Component.name || 'Component';
  
  const WrappedComponent: React.FC<P> = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${displayName})`;
  
  return WrappedComponent;
}

/**
 * Hook untuk membuat error boundary di dalam komponen fungsi
 * @param onError - Handler untuk error
 */
export function useErrorHandler(onError?: (error: Error) => void): (error: unknown) => void {
  return React.useCallback(
    (error: unknown) => {
      if (error instanceof Error) {
        if (onError) {
          onError(error);
        } else {
          throw error;
        }
      } else if (error) {
        const convertedError = new Error(String(error));
        if (onError) {
          onError(convertedError);
        } else {
          throw convertedError;
        }
      }
    },
    [onError]
  );
}