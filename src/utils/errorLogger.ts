interface ErrorLog {
  timestamp: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  componentStack?: string;
  additionalData?: any;
}

class ErrorLogger {
  private static instance: ErrorLogger;
  private readonly maxLogs = 100;
  private readonly storageKey = 'app_error_logs';

  private constructor() {
    this.initGlobalErrorHandlers();
  }

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  private initGlobalErrorHandlers() {
    window.addEventListener('error', (event) => {
      const errorMsg = event.message?.toString() || '';
      const errorStack = event.error?.stack?.toString() || '';
      const errorFilename = event.filename?.toString() || '';
      
      if (errorMsg.includes('styled-components') || 
          errorMsg.includes('reviewlab') ||
          errorMsg.includes('See https://github.com/styled-components') ||
          errorMsg.includes('errors.md#17') ||
          errorStack.includes('styled-components') ||
          errorStack.includes('reviewlab') ||
          errorFilename.includes('reviewlab') ||
          errorFilename.includes('styled-components') ||
          errorFilename.includes('index-es2015.js')) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      
      this.logError({
        type: 'error',
        message: event.message,
        stack: event.error?.stack,
        url: event.filename || window.location.href,
        userAgent: navigator.userAgent,
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      const reason = event.reason?.toString() || '';
      const reasonStack = event.reason?.stack?.toString() || '';
      
      if (reason.includes('styled-components') || 
          reason.includes('reviewlab') ||
          reason.includes('See https://github.com/styled-components') ||
          reason.includes('errors.md#17') ||
          reasonStack.includes('styled-components') ||
          reasonStack.includes('reviewlab')) {
        event.preventDefault();
        return;
      }
      
      this.logError({
        type: 'error',
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
      });
    });

    const originalConsoleError = console.error;
    console.error = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');
      
      this.logError({
        type: 'error',
        message,
        url: window.location.href,
        userAgent: navigator.userAgent,
      });
      
      originalConsoleError.apply(console, args);
    };

    const originalConsoleWarn = console.warn;
    console.warn = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');
      
      this.logError({
        type: 'warning',
        message,
        url: window.location.href,
        userAgent: navigator.userAgent,
      });
      
      originalConsoleWarn.apply(console, args);
    };
  }

  logError(error: Partial<ErrorLog>) {
    try {
      const logs = this.getLogs();
      
      const newLog: ErrorLog = {
        timestamp: new Date().toISOString(),
        type: error.type || 'error',
        message: error.message || 'Unknown error',
        stack: error.stack,
        url: error.url || window.location.href,
        userAgent: error.userAgent || navigator.userAgent,
        componentStack: error.componentStack,
        additionalData: error.additionalData,
      };

      logs.unshift(newLog);

      if (logs.length > this.maxLogs) {
        logs.splice(this.maxLogs);
      }

      localStorage.setItem(this.storageKey, JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to log error:', e);
    }
  }

  getLogs(): ErrorLog[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  clearLogs() {
    localStorage.removeItem(this.storageKey);
  }

  exportLogs(): string {
    return JSON.stringify(this.getLogs(), null, 2);
  }
}

export default ErrorLogger;
export type { ErrorLog };