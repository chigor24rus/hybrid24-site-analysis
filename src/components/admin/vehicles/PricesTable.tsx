import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Icon from '@/components/ui/icon';

interface Price {
  id: number | string;
  brand_id: number;
  model_id: number | null;
  service_id: number;
  price: string;
  brand_name?: string;
  model_name?: string;
  service_title?: string;
}

interface PricesTableProps {
  prices: Price[];
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onEdit: (price: Price) => void;
  onDelete: (id: number | string) => void;
}

const PricesTable = ({ 
  prices, 
  currentPage, 
  totalPages, 
  itemsPerPage,
  onPageChange, 
  onEdit, 
  onDelete 
}: PricesTableProps) => {
  const paginatedPrices = prices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Бренд</TableHead>
            <TableHead>Модель</TableHead>
            <TableHead>Услуга</TableHead>
            <TableHead>Цена</TableHead>
            <TableHead className="text-right">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedPrices.map((price) => (
            <TableRow key={price.id}>
              <TableCell className="font-medium">{price.brand_name}</TableCell>
              <TableCell>{price.model_name || 'Все модели'}</TableCell>
              <TableCell>{price.service_title}</TableCell>
              <TableCell className="font-bold text-primary">{price.price}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button variant="ghost" size="sm" onClick={() => onEdit(price)}>
                  <Icon name="Edit" size={16} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(price.id)}>
                  <Icon name="Trash2" size={16} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Показано {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, prices.length)} из {prices.length}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
            >
              <Icon name="ChevronsLeft" size={16} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <Icon name="ChevronLeft" size={16} />
            </Button>
            <div className="flex items-center gap-2 px-4">
              <span className="text-sm font-medium">{currentPage}</span>
              <span className="text-sm text-muted-foreground">из {totalPages}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              <Icon name="ChevronRight" size={16} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
            >
              <Icon name="ChevronsRight" size={16} />
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default PricesTable;