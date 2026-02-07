import { useEffect } from 'react';

interface ReviewLabWidgetProps {
  widgetId: string;
}

const ReviewLabWidget = ({ widgetId }: ReviewLabWidgetProps) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://app.reviewlab.ru/widget/index-es2015.js';
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      const existingScript = document.querySelector(`script[src="https://app.reviewlab.ru/widget/index-es2015.js"]`);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return (
    <div className="reviewlab-widget-container">
      <review-lab data-widgetid={widgetId}></review-lab>
    </div>
  );
};

export default ReviewLabWidget;