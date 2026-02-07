import { useEffect, useState, useRef } from 'react';

interface ReviewLabWidgetProps {
  widgetId: string;
}

const ReviewLabWidget = ({ widgetId }: ReviewLabWidgetProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const errorHandlerRef = useRef<((event: ErrorEvent) => void) | null>(null);

  useEffect(() => {
    errorHandlerRef.current = (event: ErrorEvent) => {
      if (event.message && event.message.includes('styled-components')) {
        event.preventDefault();
        event.stopPropagation();
        console.warn('ReviewLab styled-components error suppressed');
      }
    };

    window.addEventListener('error', errorHandlerRef.current, true);

    const existingScript = document.querySelector('script[src="https://app.reviewlab.ru/widget/index-es2015.js"]');
    
    if (existingScript) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://app.reviewlab.ru/widget/index-es2015.js';
    script.async = true;
    script.onload = () => {
      console.log('ReviewLab script loaded successfully');
      setIsLoaded(true);
    };
    script.onerror = () => {
      console.error('Failed to load ReviewLab script');
      setHasError(true);
    };
    
    document.body.appendChild(script);

    return () => {
      if (errorHandlerRef.current) {
        window.removeEventListener('error', errorHandlerRef.current, true);
      }
      const scriptToRemove = document.querySelector('script[src="https://app.reviewlab.ru/widget/index-es2015.js"]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
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
    <div className="reviewlab-widget-container" style={{ minHeight: '400px' }}>
      {!isLoaded && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )}
      <review-lab data-widgetid={widgetId}></review-lab>
    </div>
  );
};

export default ReviewLabWidget;