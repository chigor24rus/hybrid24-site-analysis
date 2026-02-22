import Icon from '@/components/ui/icon';

export interface TestResult {
  success: boolean;
  data?: unknown;
  error?: string;
  timestamp: string;
}

interface TestResultBlockProps {
  result: TestResult | null;
}

const TestResultBlock = ({ result }: TestResultBlockProps) => {
  if (!result) return null;

  return (
    <div className={`mt-4 p-4 rounded-lg border ${
      result.success
        ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
        : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800'
    }`}>
      <div className="flex items-start gap-2 mb-2">
        <Icon
          name={result.success ? 'CheckCircle2' : 'XCircle'}
          size={20}
          className={result.success ? 'text-green-600' : 'text-red-600'}
        />
        <div className="flex-1">
          <p className="font-semibold">
            {result.success ? 'Успешно' : 'Ошибка'}
          </p>
          <p className="text-xs text-muted-foreground">
            {new Date(result.timestamp).toLocaleString('ru-RU')}
          </p>
        </div>
      </div>

      {result.error && (
        <div className="mt-2 p-2 bg-background rounded text-sm">
          <p className="text-red-600 font-mono">{result.error}</p>
        </div>
      )}

      {result.data && (
        <details className="mt-2">
          <summary className="cursor-pointer text-sm font-medium mb-2">
            Показать данные
          </summary>
          <pre className="p-3 bg-background rounded text-xs overflow-auto max-h-96">
            {JSON.stringify(result.data, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
};

export default TestResultBlock;
