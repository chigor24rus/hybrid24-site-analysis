import { useEffect } from 'react';

interface ReviewLabWidgetProps {
  widgetId?: string;
}

const ReviewLabWidget = ({ widgetId = 'YOUR_WIDGET_ID' }: ReviewLabWidgetProps) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://reviewlab.ru/static/widget.js';
    script.async = true;
    script.setAttribute('data-reviewlab-widget-id', widgetId);
    document.body.appendChild(script);

    return () => {
      const existingScript = document.querySelector(`script[src="https://reviewlab.ru/static/widget.js"]`);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [widgetId]);

  return (
    <div className="reviewlab-widget-container">
      <div id={`reviewlab-widget-${widgetId}`} />
    </div>
  );
};

export default ReviewLabWidget;
