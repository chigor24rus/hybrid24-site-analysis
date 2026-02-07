import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { AdminLayout, AdminPageHeader, EmptyState, AdminActionButton } from '@/components/admin';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { formatDateTimeLocale } from '@/utils/dateFormatters';

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



const AdminErrorsPage = () => {
  const navigate = useNavigate();
  const { logout } = useAdminAuth();
  const [errors, setErrors] = useState<CallbackError[]>([]);
  const [filterContext, setFilterContext] = useState<string>('all');
  const [expandedError, setExpandedError] = useState<number | null>(null);

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
    <AdminLayout>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <AdminPageHeader
            title="Ошибки виджета обратного звонка"
            description="Мониторинг и диагностика проблем"
            showBackButton
            actions={
              <>
                <AdminActionButton
                  icon="RefreshCw"
                  label="Обновить"
                  onClick={loadErrors}
                  variant="outline"
                />
                <AdminActionButton
                  icon="Download"
                  label="Экспорт"
                  onClick={exportErrors}
                  disabled={errors.length === 0}
                  variant="outline"
                />
                <AdminActionButton
                  icon="Trash2"
                  label="Очистить"
                  onClick={clearErrors}
                  disabled={errors.length === 0}
                  variant="outline"
                />
                <AdminActionButton
                  icon="LogOut"
                  label="Выйти"
                  onClick={logout}
                  variant="outline"
                />
              </>
            }
          />

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

        </div>

        {errors.length === 0 ? (
          <EmptyState
            icon="CheckCircle"
            title="Ошибок не обнаружено"
            description="Виджет обратного звонка работает стабильно"
          />
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
                        <span className="text-sm font-mono bg-muted px-2 py-1 rounded">{error.context}</span>
                        <span className="text-sm text-muted-foreground">
                          {formatDateTimeLocale(error.timestamp)}
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
    </AdminLayout>
  );
};

export default AdminErrorsPage;