import React, { Component, ErrorInfo } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Report error to analytics
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error);
      console.error('Component stack:', errorInfo.componentStack);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallback error={this.state.error} errorInfo={this.state.errorInfo} />;
    }

    return this.props.children;
  }
}

const ErrorFallback: React.FC<{ error: Error | null; errorInfo: ErrorInfo | null }> = ({
  error,
  errorInfo,
}) => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            {t('error_boundary.title')}
          </h2>
          <p className="text-gray-600 mb-4">
            {t('error_boundary.message')}
          </p>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg text-left">
              <p className="text-sm font-mono text-red-600 mb-2">
                {error?.toString()}
              </p>
              <p className="text-xs font-mono text-gray-600 whitespace-pre-wrap">
                {errorInfo?.componentStack}
              </p>
            </div>
          )}
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('error_boundary.reload')}
          </button>
        </div>
      </div>
    </div>
  );
};

export const withErrorBoundary = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: React.ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
) => {
  return (props: P) => (
    <ErrorBoundary fallback={fallback} onError={onError}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );
};

export const useErrorHandler = () => {
  const { t } = useTranslation();

  const handleError = (error: Error, context?: string) => {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`Error in ${context || 'unknown context'}:`, error);
    }

    // Report error to analytics
    // TODO: Implement error reporting service

    // Show user-friendly error message
    // TODO: Implement toast notification system
  };

  return { handleError };
};

export default ErrorBoundary; 