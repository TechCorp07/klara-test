// src/components/dashboard/DashboardErrorBoundary.tsx
import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class DashboardErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error to monitoring service
    console.error('Dashboard Error Boundary caught an error:', error, errorInfo);
    
    // You can also log the error to an error reporting service here
    // errorReportingService.captureException(error, { extra: errorInfo });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              
              <h1 className="text-lg font-semibold text-gray-900 mb-2">
                Something went wrong
              </h1>
              
              <p className="text-sm text-gray-600 mb-6">
                We&apos;re sorry, but something unexpected happened. Please try refreshing the page or contact support if the problem persists.
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded text-left">
                  <details className="text-xs text-red-800">
                    <summary className="cursor-pointer font-medium mb-2">Error Details</summary>
                    <pre className="whitespace-pre-wrap overflow-auto max-h-32">
                      {this.state.error.toString()}
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </details>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={this.handleRetry}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </button>
                
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-4">
                Error ID: {Date.now().toString(36).toUpperCase()}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading spinner component for widgets
export function WidgetLoader({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <div className="animate-pulse">
        <div className="flex items-center mb-4">
          <div className="h-5 w-5 bg-gray-300 rounded mr-2"></div>
          <div className="h-5 w-32 bg-gray-300 rounded"></div>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          <div className="h-4 bg-gray-300 rounded w-5/6"></div>
        </div>
      </div>
    </div>
  );
}

// Loading state for entire dashboard
export function DashboardLoader() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-64 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-96"></div>
          </div>
        </div>

        {/* Widgets grid skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <WidgetLoader key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Error state for individual widgets
export function WidgetError({ 
  title = "Widget Error", 
  message = "Failed to load data",
  onRetry,
  className = ""
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-10 w-10 rounded-full bg-red-100 mb-3">
          <AlertTriangle className="h-5 w-5 text-red-600" />
        </div>
        
        <h3 className="text-sm font-medium text-gray-900 mb-1">{title}</h3>
        <p className="text-xs text-gray-600 mb-3">{message}</p>
        
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-xs bg-red-50 text-red-700 px-3 py-1 rounded hover:bg-red-100 transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}

// Network status indicator
export function NetworkStatus() {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  const [showOffline, setShowOffline] = React.useState(false);

  React.useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOffline(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showOffline) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <div className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center justify-between max-w-sm mx-auto">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-red-300 rounded-full mr-2 animate-pulse"></div>
          <span className="text-sm font-medium">No internet connection</span>
        </div>
        <button
          onClick={() => setShowOffline(false)}
          className="text-red-200 hover:text-white ml-2"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Progress indicator for long-running operations
export function ProgressIndicator({ 
  progress, 
  message, 
  className = "" 
}: { 
  progress: number; 
  message?: string; 
  className?: string; 
}) {
  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <div className="text-center">
        <div className="mb-4">
          <div className="text-lg font-semibold text-gray-900 mb-2">
            {Math.round(progress)}%
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        
        {message && (
          <p className="text-sm text-gray-600">{message}</p>
        )}
      </div>
    </div>
  );
}