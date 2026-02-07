import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface Promotion {
  id: number;
  title: string;
  description: string;
  discount: string;
  old_price: string;
  new_price: string;
  valid_until: string;
  icon: string;
  details: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface PromotionCardProps {
  promotion: Promotion;
  onToggleActive: (promotion: Promotion) => void;
  onEdit: (promotion: Promotion) => void;
  onDelete: (id: number) => void;
}

const formatValidUntil = (dateString: string) => {
  if (dateString === 'Постоянно') return 'Постоянно';
  try {
    const date = new Date(dateString);
    return format(date, 'd MMMM yyyy, HH:mm', { locale: ru });
  } catch {
    return dateString;
  }
};

export const PromotionCard = ({ promotion, onToggleActive, onEdit, onDelete }: PromotionCardProps) => {
  return (
    <Card className={!promotion.is_active ? 'opacity-50' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Icon name={promotion.icon as any} size={24} className="text-primary" />
              <Badge variant={promotion.is_active ? 'default' : 'secondary'}>
                {promotion.is_active ? 'Активна' : 'Неактивна'}
              </Badge>
            </div>
            <CardTitle className="mb-2">{promotion.title}</CardTitle>
            <CardDescription>{promotion.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Скидка:</span>
            <Badge className="gradient-accent">{promotion.discount}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Цена:</span>
            <div className="text-right">
              {promotion.old_price && (
                <span className="text-sm line-through text-muted-foreground mr-2">
                  {promotion.old_price}
                </span>
              )}
              <span className="font-bold text-primary">{promotion.new_price}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">До:</span>
            <span className="text-sm">{formatValidUntil(promotion.valid_until)}</span>
          </div>
          <div className="pt-3 border-t flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => onToggleActive(promotion)}
            >
              <Icon name={promotion.is_active ? 'EyeOff' : 'Eye'} size={16} className="mr-1" />
              {promotion.is_active ? 'Скрыть' : 'Показать'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(promotion)}
            >
              <Icon name="Edit" size={16} />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDelete(promotion.id)}
            >
              <Icon name="Trash" size={16} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
