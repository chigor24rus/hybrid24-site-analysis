import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface DeleteBookingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  onExport?: (startDate: string, endDate: string) => void;
}

const DeleteBookingsDialog = ({ open, onOpenChange, onSuccess, onExport }: DeleteBookingsDialogProps) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!startDate || !endDate) {
      alert('Пожалуйста, укажите обе даты');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      alert('Начальная дата не может быть больше конечной');
      return;
    }

    const confirmMessage = `Вы уверены, что хотите удалить все заявки с ${new Date(startDate).toLocaleDateString('ru-RU')} по ${new Date(endDate).toLocaleDateString('ru-RU')}?`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch('https://functions.poehali.dev/6441c23c-e63f-4a3e-8cd7-aabdb983ca45', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          start_date: startDate,
          end_date: endDate,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert(`Успешно удалено заявок: ${data.deleted_count}`);
        setStartDate('');
        setEndDate('');
        onOpenChange(false);
        onSuccess();
      } else {
        alert(data.error || 'Ошибка при удалении заявок');
      }
    } catch (error) {
      console.error('Error deleting bookings:', error);
      alert('Ошибка при удалении заявок');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Trash2" size={20} className="text-red-500" />
            Удаление заявок
          </DialogTitle>
          <DialogDescription>
            Выберите период для удаления заявок. Рекомендуется сначала экспортировать заявки для архива.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="start-date">Начальная дата</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={deleting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="end-date">Конечная дата</Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={deleting}
            />
          </div>

          {startDate && endDate && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
              <div className="flex items-start gap-2">
                <Icon name="AlertTriangle" size={16} className="mt-0.5 flex-shrink-0" />
                <div>
                  Будут удалены все заявки, созданные в период с{' '}
                  <strong>{new Date(startDate).toLocaleDateString('ru-RU')}</strong> по{' '}
                  <strong>{new Date(endDate).toLocaleDateString('ru-RU')}</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleting}
            className="w-full sm:w-auto"
          >
            Отмена
          </Button>
          {onExport && (
            <Button
              variant="secondary"
              onClick={() => {
                if (startDate && endDate) {
                  onExport(startDate, endDate);
                }
              }}
              disabled={deleting || !startDate || !endDate}
              className="w-full sm:w-auto"
            >
              <Icon name="Download" className="mr-2" size={16} />
              Сначала экспортировать
            </Button>
          )}
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting || !startDate || !endDate}
            className="w-full sm:w-auto"
          >
            {deleting ? (
              <>
                <Icon name="Loader" className="mr-2 animate-spin" size={16} />
                Удаление...
              </>
            ) : (
              <>
                <Icon name="Trash2" className="mr-2" size={16} />
                Удалить заявки
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteBookingsDialog;