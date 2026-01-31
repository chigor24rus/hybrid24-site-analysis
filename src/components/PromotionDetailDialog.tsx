import { Button } from '@/components/ui/button';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface Promotion {
  id: number;
  title: string;
  description: string;
  discount: string;
  oldPrice: string;
  newPrice: string;
  validUntil: string;
  icon: string;
  details?: string;
}

interface PromotionDetailDialogProps {
  promotion: Promotion | null;
  onBookingClick: () => void;
}

const PromotionDetailDialog = ({ promotion, onBookingClick }: PromotionDetailDialogProps) => {
  if (!promotion) return null;

  const formatValidUntil = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'd MMMM yyyy', { locale: ru });
    } catch {
      return dateString;
    }
  };

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <div className="flex items-start justify-between mb-4">
          <div className="w-16 h-16 rounded-lg gradient-primary flex items-center justify-center">
            <Icon name={promotion.icon as any} size={32} className="text-white" />
          </div>
          <Badge className="gradient-accent text-lg px-4 py-2">{promotion.discount}</Badge>
        </div>
        <DialogTitle className="text-3xl">{promotion.title}</DialogTitle>
        <DialogDescription className="text-base mt-2">{promotion.description}</DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        {promotion.details && (
          <div className="bg-card/50 p-4 rounded-lg border border-border">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Icon name="Info" size={18} className="text-primary" />
              Подробности
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{promotion.details}</p>
          </div>
        )}

        <div className="bg-primary/10 p-6 rounded-lg">
          <div className="flex items-baseline justify-center gap-4 mb-4">
            {promotion.oldPrice && (
              <span className="text-muted-foreground line-through text-2xl">{promotion.oldPrice}</span>
            )}
            <span className="text-4xl font-bold text-primary">{promotion.newPrice}</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Icon name="Clock" size={16} />
            <span>Действует до: {formatValidUntil(promotion.validUntil)}</span>
          </div>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg border border-primary/20">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Icon name="CheckCircle" size={18} className="text-primary" />
            Условия акции
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <Icon name="Check" size={16} className="text-primary flex-shrink-0 mt-0.5" />
              <span>Акции не суммируются с другими скидками и спецпредложениями</span>
            </li>
            <li className="flex gap-2">
              <Icon name="Check" size={16} className="text-primary flex-shrink-0 mt-0.5" />
              <span>Для получения скидки необходимо записаться заранее</span>
            </li>
            <li className="flex gap-2">
              <Icon name="Check" size={16} className="text-primary flex-shrink-0 mt-0.5" />
              <span>Подробности акций уточняйте у администратора</span>
            </li>
          </ul>
        </div>

        <Button 
          className="w-full gradient-primary btn-glow" 
          size="lg"
          onClick={onBookingClick}
        >
          Воспользоваться акцией
          <Icon name="ArrowRight" className="ml-2" size={20} />
        </Button>
      </div>
    </DialogContent>
  );
};

export default PromotionDetailDialog;