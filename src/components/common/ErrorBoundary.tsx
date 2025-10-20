import { Component, type ReactNode } from 'react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import Button from '../ui/Button';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(_error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center">
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-6 animate-bounce">
                <AlertTriangle className="w-12 h-12 text-red-600" />
              </div>

              {/* Heading */}
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Oops! Something went wrong
              </h1>

              {/* Description */}
              <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                We're sorry for the inconvenience. An unexpected error occurred. 
                Please try refreshing the page or go back home.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Button
                  variant="primary"
                  size="lg"
                  icon={<Home className="w-5 h-5" />}
                  onClick={this.handleGoHome}
                >
                  Go Home
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  icon={<RefreshCw className="w-5 h-5" />}
                  onClick={this.handleReload}
                >
                  Reload Page
                </Button>
              </div>

              {/* Error Details (Dev Mode) */}
              {import.meta.env.DEV && this.state.error && (
                <details className="text-left bg-gray-50 rounded-lg p-4 mt-8">
                  <summary className="cursor-pointer font-semibold text-gray-700 mb-2">
                    Error Details (Development Only)
                  </summary>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium text-gray-700">Error:</span>
                      <pre className="mt-1 text-sm text-red-600 overflow-x-auto">
                        {this.state.error.toString()}
                      </pre>
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <span className="font-medium text-gray-700">Stack Trace:</span>
                        <pre className="mt-1 text-xs text-gray-600 overflow-x-auto max-h-40">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </div>

            {/* Support Message */}
            <p className="text-center text-gray-500 mt-6 text-sm">
              If this problem persists, please contact support at{' '}
              <a href="mailto:support@cfs.com.au" className="text-primary hover:underline">
                support@cfs.com.au
              </a>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
