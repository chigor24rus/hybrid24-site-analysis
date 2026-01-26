import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import ErrorLogger, { ErrorLog } from '@/utils/errorLogger';

const typeColors: Record<string, string> = {
  error: 'bg-red-100 text-red-800 border-red-200',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  info: 'bg-blue-100 text-blue-800 border-blue-200',
};

const typeLabels: Record<string, string> = {
  error: 'Ошибка',
  warning: 'Предупреждение',
  info: 'Информация',
};

const AdminLogsPage = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<ErrorLog[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [expandedLog, setExpandedLog] = useState<number | null>(null);

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
    loadLogs();
  }, []);

  const loadLogs = () => {
    const logger = ErrorLogger.getInstance();
    setLogs(logger.getLogs());
  };

  const clearLogs = () => {
    if (confirm('Вы уверены, что хотите удалить все логи ошибок?')) {
      const logger = ErrorLogger.getInstance();
      logger.clearLogs();
      setLogs([]);
    }
  };

  const exportLogs = () => {
    const logger = ErrorLogger.getInstance();
    const dataStr = logger.exportLogs();
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `error-logs-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
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

  const filteredLogs = filterType === 'all'
    ? logs
    : logs.filter(log => log.type === filterType);

  const getTypeCount = (type: string) => {
    if (type === 'all') return logs.length;
    return logs.filter(log => log.type === type).length;
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
              <h1 className="text-4xl font-bold mb-2">Логи ошибок сайта</h1>
              <p className="text-muted-foreground">Мониторинг и диагностика проблем</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={loadLogs}>
                <Icon name="RefreshCw" className="mr-2" size={18} />
                Обновить
              </Button>
              <Button variant="outline" onClick={exportLogs} disabled={logs.length === 0}>
                <Icon name="Download" className="mr-2" size={18} />
                Экспорт
              </Button>
              <Button variant="destructive" onClick={clearLogs} disabled={logs.length === 0}>
                <Icon name="Trash2" className="mr-2" size={18} />
                Очистить
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card 
            className={`cursor-pointer hover:border-primary transition-colors ${filterType === 'all' ? 'border-primary' : ''}`}
            onClick={() => setFilterType('all')}
          >
            <CardHeader className="p-4">
              <CardDescription className="text-xs">Всего логов</CardDescription>
              <CardTitle className="text-2xl">{getTypeCount('all')}</CardTitle>
            </CardHeader>
          </Card>
          <Card
            className={`cursor-pointer hover:border-primary transition-colors ${filterType === 'error' ? 'border-primary' : ''}`}
            onClick={() => setFilterType('error')}
          >
            <CardHeader className="p-4">
              <CardDescription className="text-xs">Ошибки</CardDescription>
              <CardTitle className="text-2xl text-red-600">{getTypeCount('error')}</CardTitle>
            </CardHeader>
          </Card>
          <Card
            className={`cursor-pointer hover:border-primary transition-colors ${filterType === 'warning' ? 'border-primary' : ''}`}
            onClick={() => setFilterType('warning')}
          >
            <CardHeader className="p-4">
              <CardDescription className="text-xs">Предупреждения</CardDescription>
              <CardTitle className="text-2xl text-yellow-600">{getTypeCount('warning')}</CardTitle>
            </CardHeader>
          </Card>
          <Card
            className={`cursor-pointer hover:border-primary transition-colors ${filterType === 'info' ? 'border-primary' : ''}`}
            onClick={() => setFilterType('info')}
          >
            <CardHeader className="p-4">
              <CardDescription className="text-xs">Информация</CardDescription>
              <CardTitle className="text-2xl text-blue-600">{getTypeCount('info')}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {logs.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Icon name="CheckCircle" className="mx-auto mb-4 text-green-500" size={64} />
              <h3 className="text-xl font-semibold mb-2">Ошибок не обнаружено</h3>
              <p className="text-muted-foreground">Сайт работает стабильно</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredLogs.map((log, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setExpandedLog(expandedLog === index ? null : index)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={typeColors[log.type]}>
                          {typeLabels[log.type]}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(log.timestamp)}
                        </span>
                      </div>
                      <CardTitle className="text-lg mb-1 font-mono text-sm">
                        {log.message.length > 150 
                          ? log.message.substring(0, 150) + '...' 
                          : log.message}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {log.url}
                      </CardDescription>
                    </div>
                    <Icon 
                      name={expandedLog === index ? 'ChevronUp' : 'ChevronDown'} 
                      size={24}
                      className="text-muted-foreground"
                    />
                  </div>
                </CardHeader>
                
                {expandedLog === index && (
                  <CardContent className="border-t bg-muted/20">
                    <div className="space-y-4 py-4">
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Icon name="AlertCircle" size={16} />
                          Полное сообщение
                        </h4>
                        <pre className="bg-background p-3 rounded-lg text-xs overflow-x-auto border font-mono whitespace-pre-wrap">
                          {log.message}
                        </pre>
                      </div>

                      {log.stack && (
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Icon name="Code" size={16} />
                            Stack Trace
                          </h4>
                          <pre className="bg-background p-3 rounded-lg text-xs overflow-x-auto border font-mono">
                            {log.stack}
                          </pre>
                        </div>
                      )}

                      {log.componentStack && (
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Icon name="Component" size={16} />
                            Component Stack
                          </h4>
                          <pre className="bg-background p-3 rounded-lg text-xs overflow-x-auto border font-mono">
                            {log.componentStack}
                          </pre>
                        </div>
                      )}

                      {log.additionalData && (
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Icon name="Info" size={16} />
                            Дополнительные данные
                          </h4>
                          <pre className="bg-background p-3 rounded-lg text-xs overflow-x-auto border">
                            {JSON.stringify(log.additionalData, null, 2)}
                          </pre>
                        </div>
                      )}
                      
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Icon name="Monitor" size={16} />
                          User Agent
                        </h4>
                        <p className="text-xs bg-background p-3 rounded-lg border">
                          {log.userAgent}
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

export default AdminLogsPage;
