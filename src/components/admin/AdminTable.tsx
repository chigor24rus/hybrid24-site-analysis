import { ReactNode } from 'react';

interface AdminTableColumn {
  key: string;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: any) => ReactNode;
}

interface AdminTableProps {
  columns: AdminTableColumn[];
  data: any[];
  keyField?: string;
  emptyMessage?: string;
  className?: string;
  onRowClick?: (row: any) => void;
}

export const AdminTable = ({
  columns,
  data,
  keyField = 'id',
  emptyMessage = 'Нет данных',
  className = '',
  onRowClick
}: AdminTableProps) => {
  const getAlignment = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      default:
        return 'text-left';
    }
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full">
        <thead className="border-b">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-4 py-3 text-sm font-semibold ${getAlignment(column.align)}`}
                style={{ width: column.width }}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {data.map((row) => (
            <tr
              key={row[keyField]}
              className={`${onRowClick ? 'cursor-pointer hover:bg-muted/50' : ''} transition-colors`}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`px-4 py-3 text-sm ${getAlignment(column.align)}`}
                >
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

interface AdminTableCellProps {
  children: ReactNode;
  className?: string;
}

export const AdminTableCell = ({ children, className = '' }: AdminTableCellProps) => {
  return <div className={className}>{children}</div>;
};
