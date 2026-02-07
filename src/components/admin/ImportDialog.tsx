import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  importUrl: string;
  onImportUrlChange: (url: string) => void;
  onImport: () => void;
  importing: boolean;
}

export const ImportDialog = ({
  open,
  onOpenChange,
  importUrl,
  onImportUrlChange,
  onImport,
  importing
}: ImportDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Импорт отзывов из Яндекс.Карт</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="import_url">URL организации на Яндекс.Картах</Label>
            <Input
              id="import_url"
              value={importUrl}
              onChange={(e) => onImportUrlChange(e.target.value)}
              placeholder="https://yandex.ru/maps/org/..."
              className="mt-2"
            />
            <p className="text-sm text-muted-foreground mt-2">
              Откройте вашу организацию на Яндекс.Картах и скопируйте URL из адресной строки
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <strong>Обратите внимание:</strong> Автоматический импорт может работать не всегда из-за ограничений API Яндекс.Карт. 
              Если импорт не удался, используйте ручное добавление отзывов через форму.
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              onClick={onImport} 
              className="gradient-primary flex-1"
              disabled={importing}
            >
              {importing ? (
                <>
                  <Icon name="Download" className="mr-2 animate-pulse" size={16} />
                  Импортируем...
                </>
              ) : (
                <>
                  <Icon name="Download" className="mr-2" size={16} />
                  Импортировать
                </>
              )}
            </Button>
            <Button 
              onClick={() => onOpenChange(false)} 
              variant="outline"
              className="flex-1"
              disabled={importing}
            >
              Отмена
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
