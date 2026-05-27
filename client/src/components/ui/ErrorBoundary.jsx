import { Component } from 'react';
import { FaBus } from 'react-icons/fa';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-dark-50 dark:bg-dark-800 px-4">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-danger-50 dark:bg-danger-950/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaBus className="text-3xl text-danger-500" />
            </div>
            <h1 className="text-2xl font-extrabold text-dark-900 dark:text-white mb-2">
              Something went wrong
            </h1>
            <p className="text-dark-500 dark:text-dark-400 text-sm mb-6">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-primary-700 transition-colors shadow-sm"
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

export default ErrorBoundary;
