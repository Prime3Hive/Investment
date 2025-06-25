import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, RotateCcw, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  onError?: (error: Error, errorInfo: any) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

class ErrorBoundary extends Component<Props, State> {
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

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Call onError prop if provided
    if (this.props.onError) {
      try {
        this.props.onError(error, errorInfo);
      } catch (callbackError) {
        console.error('Error in onError callback:', callbackError);
      }
    }

    // Log to external service (when properly configured)
    // Sentry.captureException(error, { extra: errorInfo });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    
    // Call onReset prop if provided
    if (this.props.onReset) {
      try {
        this.props.onReset();
      } catch (callbackError) {
        console.error('Error in onReset callback:', callbackError);
      }
    }
  };
  
  handleReload = () => {
    // Force a hard reload of the page
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-800 rounded-lg p-8 border border-slate-700 text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-4">Something went wrong</h2>
            
            <p className="text-slate-400 mb-6">
              We're sorry, but something unexpected happened. Please try one of the recovery options below.
            </p>

            {/* Always show a simplified error message for users */}
            <div className="bg-slate-900/50 rounded-lg p-3 mb-6 text-left">
              <p className="text-sm text-slate-300">
                Error: {this.state.error?.message || 'Unknown error'}
              </p>
            </div>

            {/* Detailed error info for developers */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-slate-900 rounded-lg p-4 mb-6 text-left">
                <div className="flex items-center mb-2">
                  <Bug className="w-4 h-4 text-red-400 mr-2" />
                  <h3 className="text-red-400 font-semibold">Developer Error Details:</h3>
                </div>
                <pre className="text-xs text-slate-300 overflow-auto max-h-60 p-2 bg-slate-950 rounded">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mb-3">
              <button
                onClick={this.handleReset}
                className="py-3 px-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-slate-900 font-semibold rounded-lg hover:from-yellow-500 hover:to-yellow-700 transition-all duration-300 flex items-center justify-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </button>
              
              <button
                onClick={this.handleReload}
                className="py-3 px-4 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-600 transition-colors flex items-center justify-center"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reload Page
              </button>
            </div>
            
            <button
              onClick={() => window.location.href = '/'}
              className="w-full py-3 px-4 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-600 transition-colors flex items-center justify-center"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;