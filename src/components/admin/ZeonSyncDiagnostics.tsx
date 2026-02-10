import Icon from '@/components/ui/icon';

interface ZeonSyncDiagnosticsProps {
  diagnostics: Record<string, { status: string; message: string }>;
}

export const ZeonSyncDiagnostics = ({ diagnostics }: ZeonSyncDiagnosticsProps) => {
  return (
    <div className="bg-card border rounded-lg p-6 mb-8">
      <h3 className="text-lg font-semibold mb-4">Результаты диагностики</h3>
      <div className="space-y-3">
        {Object.entries(diagnostics).map(([key, value]) => {
          if (key === 'secrets') return null;
          const statusIcon = value.status === 'ok' ? 'CheckCircle2' : value.status === 'warning' ? 'AlertCircle' : 'XCircle';
          const statusColor = value.status === 'ok' ? 'text-green-600' : value.status === 'warning' ? 'text-yellow-600' : 'text-red-600';
          
          return (
            <div key={key} className="flex items-start gap-3 p-3 bg-muted/50 rounded">
              <Icon name={statusIcon} className={`mt-0.5 ${statusColor}`} size={20} />
              <div className="flex-1">
                <div className="font-medium capitalize">{key.replace('_', ' ')}</div>
                <div className="text-sm text-muted-foreground">{value.message}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
