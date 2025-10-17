'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Here you could also log the error to an error reporting service
    // Example: Sentry, LogRocket, etc.
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleTryAgain = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-8 text-center bg-white border border-gray-200 shadow-xl">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Oops! Something went wrong
            </h1>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              We encountered an unexpected error. Don't worry, our team has been notified and is working on a fix.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                  Error Details (Development)
                </summary>
                <div className="mt-3 p-3 bg-gray-100 rounded-lg text-xs font-mono text-gray-800 overflow-auto max-h-32">
                  <div className="font-semibold text-red-600 mb-2">
                    {this.state.error.name}: {this.state.error.message}
                  </div>
                  <pre className="whitespace-pre-wrap">
                    {this.state.error.stack}
                  </pre>
                </div>
              </details>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={this.handleTryAgain}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              
              <Button
                variant="outline"
                onClick={this.handleGoHome}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
              
              <Button
                variant="ghost"
                onClick={this.handleReload}
                className="text-gray-600 hover:text-gray-800"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reload Page
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

// Higher-order component for easier usage
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Hook for manual error throwing (useful for async errors)
export function useErrorHandler() {
  return (error: Error) => {
    throw error;
  };
}
