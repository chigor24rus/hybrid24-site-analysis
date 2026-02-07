import { useEffect, useState } from 'react';

interface ReviewLabWidgetProps {
  widgetId: string;
}

const ReviewLabWidget = ({ widgetId }: ReviewLabWidgetProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
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
    };
    
    document.body.appendChild(script);

    return () => {
      const scriptToRemove = document.querySelector('script[src="https://app.reviewlab.ru/widget/index-es2015.js"]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, []);

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