import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface CallbackError {
  timestamp: string;
  context: string;
  error: {
    message: string;
    name: string;
    stack?: string;
  } | string;
  details?: any;
  userAgent: string;
  url: string;
  host: string;
}

const contextLabels: Record<string, string> = {
  bot_detection: 'Обнаружен бот',
  rate_limit: 'Превышен лимит запросов',
  validation: 'Ошибка валидации',
  api_error: 'Ошибка API',
  network_error: 'Сетевая ошибка',
};

const contextColors: Record<string, string> = {
  bot_detection: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  rate_limit: 'bg-orange-100 text-orange-800 border-orange-200',
  validation: 'bg-blue-100 text-blue-800 border-blue-200',
  api_error: 'bg-red-100 text-red-800 border-red-200',
  network_error: 'bg-purple-100 text-purple-800 border-purple-200',
};

const AdminErrorsPage = () => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState<CallbackError[]>([]);
  const [filterContext, setFilterContext] = useState<string>('all');
  const [expandedError, setExpandedError] = useState<number | null>(null);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('adminAuth');
    const authTime = localStorage.getItem('adminAuthTime');
    
    if (!isAuthenticated || !authTime) {
      navigate('/admin/login');
      return;
    }
    
    const hoursSinceAuth = (Date.now() - parseInt(authTime)) / (1000 * 60 * 60);
    if (hoursSinceAuth > 24) {
      localStorage.removeItem('adminAuth');
      localStorage.removeItem('adminAuthTime');
      navigate('/admin/login');
    }
  }, [navigate]);

  useEffect(() => {
    loadErrors();
  }, []);

  const loadErrors = () => {
    try {
      const storedErrors = JSON.parse(localStorage.getItem('callback_errors') || '[]');
      setErrors(storedErrors.reverse());
    } catch (error) {
      console.error('Error loading errors:', error);
      setErrors([]);
    }
  };

  const clearErrors = () => {
    if (confirm('Вы уверены, что хотите удалить все логи ошибок?')) {
      localStorage.removeItem('callback_errors');
      setErrors([]);
    }
  };

  const formatDate = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return timestamp;
    }
  };

  const filteredErrors = filterContext === 'all'
    ? errors
    : errors.filter(e => e.context === filterContext);

  const getContextCount = (context: string) => {
    if (context === 'all') return errors.length;
    return errors.filter(e => e.context === context).length;
  };

  const exportErrors = () => {
    const dataStr = JSON.stringify(errors, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `callback-errors-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" onClick={() => navigate('/admin')}>
              <Icon name="ArrowLeft" className="mr-2" size={18} />
              Назад
            </Button>
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">Ошибки виджета обратного звонка</h1>
              <p className="text-muted-foreground">Мониторинг и диагностика проблем</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={loadErrors}>
                <Icon name="RefreshCw" className="mr-2" size={18} />
                Обновить
              </Button>
              <Button variant="outline" onClick={exportErrors} disabled={errors.length === 0}>
                <Icon name="Download" className="mr-2" size={18} />
                Экспорт
              </Button>
              <Button variant="destructive" onClick={clearErrors} disabled={errors.length === 0}>
                <Icon name="Trash2" className="mr-2" size={18} />
                Очистить
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <Card 
            className={`cursor-pointer hover:border-primary transition-colors ${filterContext === 'all' ? 'border-primary' : ''}`}
            onClick={() => setFilterContext('all')}
          >
            <CardHeader className="p-4">
              <CardDescription className="text-xs">Всего ошибок</CardDescription>
              <CardTitle className="text-2xl">{getContextCount('all')}</CardTitle>
            </CardHeader>
          </Card>
          {Object.keys(contextLabels).map(context => (
            <Card
              key={context}
              className={`cursor-pointer hover:border-primary transition-colors ${filterContext === context ? 'border-primary' : ''}`}
              onClick={() => setFilterContext(context)}
            >
              <CardHeader className="p-4">
                <CardDescription className="text-xs">{contextLabels[context]}</CardDescription>
                <CardTitle className="text-2xl">{getContextCount(context)}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>

        {errors.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Icon name="CheckCircle" className="mx-auto mb-4 text-green-500" size={64} />
              <h3 className="text-xl font-semibold mb-2">Ошибок не обнаружено</h3>
              <p className="text-muted-foreground">Виджет обратного звонка работает стабильно</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredErrors.map((error, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setExpandedError(expandedError === index ? null : index)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={contextColors[error.context] || 'bg-gray-100 text-gray-800'}>
                          {contextLabels[error.context] || error.context}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(error.timestamp)}
                        </span>
                      </div>
                      <CardTitle className="text-lg mb-1">
                        {typeof error.error === 'string' 
                          ? error.error 
                          : error.error.message || error.error.name || 'Неизвестная ошибка'}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {error.host} • {error.url}
                      </CardDescription>
                    </div>
                    <Icon 
                      name={expandedError === index ? 'ChevronUp' : 'ChevronDown'} 
                      size={24}
                      className="text-muted-foreground"
                    />
                  </div>
                </CardHeader>
                
                {expandedError === index && (
                  <CardContent className="border-t bg-muted/20">
                    <div className="space-y-4 py-4">
                      {error.details && (
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Icon name="Info" size={16} />
                            Детали
                          </h4>
                          <pre className="bg-background p-3 rounded-lg text-xs overflow-x-auto border">
                            {JSON.stringify(error.details, null, 2)}
                          </pre>
                        </div>
                      )}
                      
                      {typeof error.error === 'object' && error.error.stack && (
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Icon name="Code" size={16} />
                            Stack Trace
                          </h4>
                          <pre className="bg-background p-3 rounded-lg text-xs overflow-x-auto border font-mono">
                            {error.error.stack}
                          </pre>
                        </div>
                      )}
                      
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Icon name="Monitor" size={16} />
                          User Agent
                        </h4>
                        <p className="text-xs bg-background p-3 rounded-lg border">
                          {error.userAgent}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminErrorsPage;
