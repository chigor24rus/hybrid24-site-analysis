import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Review } from '@/components/sections/home/ReviewsSection';

interface ReviewCardProps {
  review: Review;
  onEdit: (review: Review) => void;
  onDelete: (reviewId: number) => void;
}

const renderStars = (rating: number) => {
  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, index) => (
        <Icon
          key={index}
          name="Star"
          size={16}
          className={`${
            index < rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'fill-gray-200 text-gray-200'
          }`}
        />
      ))}
    </div>
  );
};

export const ReviewCard = ({ review, onEdit, onDelete }: ReviewCardProps) => {
  return (
    <Card className={!review.is_visible ? 'opacity-60' : ''}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{review.customer_name}</CardTitle>
            <p className="text-sm text-muted-foreground">{review.review_date}</p>
          </div>
          {renderStars(review.rating)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-3">
          <Badge variant="secondary">{review.service_name}</Badge>
          <Badge variant="outline">{review.source}</Badge>
          {!review.is_visible && (
            <Badge variant="destructive">
              <Icon name="EyeOff" size={12} />
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-4 mb-4">
          {review.review_text}
        </p>
        <div className="flex gap-2">
          <Button
            onClick={() => onEdit(review)}
            size="sm"
            variant="outline"
            className="flex-1"
          >
            <Icon name="Edit" size={14} className="mr-1" />
            Редактировать
          </Button>
          <Button
            onClick={() => onDelete(review.id)}
            size="sm"
            variant="destructive"
            className="flex-1"
          >
            <Icon name="Trash2" size={14} className="mr-1" />
            Удалить
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
