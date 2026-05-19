import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * Error Boundary Component
 * Catches rendering errors and displays a fallback UI
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error Boundary caught:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-surface-50 p-4">
          <div className="rounded-2xl border border-error-200 bg-error-50 p-8 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-6 w-6 text-error-600" />
              <h1 className="text-lg font-bold text-error-900">Oops! Something went wrong</h1>
            </div>
            <p className="text-surface-700 mb-4">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-4">
                <summary className="cursor-pointer text-sm text-error-600 font-medium mb-2">
                  Error Details
                </summary>
                <pre className="bg-white p-2 rounded text-xs overflow-auto text-error-700">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
            <div className="flex gap-2">
              <button
                onClick={this.resetError}
                className="flex-1 rounded-lg bg-error-600 px-4 py-2 text-sm font-medium text-white hover:bg-error-700 transition"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="flex-1 rounded-lg bg-surface-200 px-4 py-2 text-sm font-medium text-surface-900 hover:bg-surface-300 transition"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
