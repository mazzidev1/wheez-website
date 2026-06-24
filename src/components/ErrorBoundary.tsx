import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-brand-base p-4">
          <div className="bg-brand-surface border border-black/5 rounded-3xl p-8 max-w-lg w-full text-center shadow-lg">
            <h1 className="text-2xl font-display font-semibold mb-4 text-red-600">Something went wrong</h1>
            <p className="text-brand-text mb-6">
              The application encountered an unexpected error. Please try refreshing the page.
            </p>
            {this.state.error && (
              <div className="bg-red-50 text-red-900 p-4 rounded-xl text-sm text-left overflow-auto mb-6 max-h-48 border border-red-100">
                <pre className="whitespace-pre-wrap">{this.state.error.message}</pre>
                {this.state.error.message.toLowerCase().includes('firebase') || this.state.error.message.toLowerCase().includes('auth') || this.state.error.message.toLowerCase().includes('missing') ? (
                  <p className="mt-4 font-semibold">Hint: Ensure all Firebase environment variables are correctly set in your deployment platform (e.g. Vercel) and rebuild.</p>
                ) : null}
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="bg-brand-text text-white px-6 py-3 rounded-full font-medium hover:bg-black/80 transition-colors w-full"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
