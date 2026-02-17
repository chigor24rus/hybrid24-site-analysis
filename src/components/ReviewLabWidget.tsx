import { useEffect, useState, useRef } from 'react';

interface ReviewLabWidgetProps {
  widgetId: string;
}

const ReviewLabWidget = ({ widgetId }: ReviewLabWidgetProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const errorHandlerRef = useRef<((event: ErrorEvent) => void) | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!shouldLoad) return;
    const globalErrorHandler = (event: ErrorEvent) => {
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
        event.stopImmediatePropagation();
        return false;
      }
    };

    const unhandledRejectionHandler = (event: PromiseRejectionEvent) => {
      const reason = event.reason?.toString() || '';
      const reasonStack = event.reason?.stack?.toString() || '';
      
      if (reason.includes('styled-components') || 
          reason.includes('reviewlab') ||
          reason.includes('See https://github.com/styled-components') ||
          reason.includes('errors.md#17') ||
          reasonStack.includes('styled-components') ||
          reasonStack.includes('reviewlab')) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return false;
      }
    };

    const consoleErrorBackup = console.error;
    console.error = function(...args: unknown[]) {
      const errorStr = args.join(' ');
      if (errorStr.includes('styled-components') || 
          errorStr.includes('errors.md#17') ||
          errorStr.includes('reviewlab')) {
        return;
      }
      consoleErrorBackup.apply(console, args);
    };

    errorHandlerRef.current = globalErrorHandler;
    window.addEventListener('error', globalErrorHandler, { capture: true, passive: false });
    window.addEventListener('unhandledrejection', unhandledRejectionHandler, { capture: true });

    const existingScript = document.querySelector('script[src="https://app.reviewlab.ru/widget/index-es2015.js"]');
    
    if (existingScript) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://app.reviewlab.ru/widget/index-es2015.js';
    script.async = true;
    script.onload = () => {
      setIsLoaded(true);
    };
    script.onerror = () => {
      console.error('[ReviewLab] Failed to load widget script');
      setHasError(true);
    };
    
    try {
      document.body.appendChild(script);
    } catch (err) {
      console.error('[ReviewLab] Failed to append script:', err);
      setHasError(true);
    }

    return () => {
      console.error = consoleErrorBackup;
      window.removeEventListener('error', globalErrorHandler, true);
      window.removeEventListener('unhandledrejection', unhandledRejectionHandler);
    };
  }, []);

  if (hasError) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Не удалось загрузить виджет отзывов</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="reviewlab-widget-container" style={{ minHeight: '400px' }}>
      {!shouldLoad && (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Загрузка отзывов...</p>
        </div>
      )}
      {shouldLoad && !isLoaded && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )}
      {shouldLoad && <review-lab data-widgetid={widgetId}></review-lab>}
    </div>
  );
};

export default ReviewLabWidget;