import React, { Component, ErrorInfo, ReactNode } from 'react';
import ErrorLogger from '@/utils/errorLogger';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    const errorMsg = error.message || '';
    const errorStack = error.stack || '';
    
    if (
      errorMsg.includes('styled-components') ||
      errorMsg.includes('errors.md#17') ||
      errorMsg.includes('reviewlab') ||
      errorStack.includes('styled-components') ||
      errorStack.includes('reviewlab') ||
      errorStack.includes('index-es2015.js')
    ) {
      return { hasError: false };
    }
    
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorMsg = error.message || '';
    const errorStack = error.stack || '';
    
    if (
      errorMsg.includes('styled-components') ||
      errorMsg.includes('errors.md#17') ||
      errorMsg.includes('reviewlab') ||
      errorStack.includes('styled-components') ||
      errorStack.includes('reviewlab')
    ) {
      return;
    }
    
    const logger = ErrorLogger.getInstance();
    logger.logError({
      type: 'error',
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      url: window.location.href,
      userAgent: navigator.userAgent,
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Что-то пошло не так</h1>
              <p className="text-gray-600 mb-6">Произошла ошибка при загрузке страницы</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Обновить страницу
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;