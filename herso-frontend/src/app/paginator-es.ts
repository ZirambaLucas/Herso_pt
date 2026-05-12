import { MatPaginatorIntl } from '@angular/material/paginator';

export function paginatorEsIntl(): MatPaginatorIntl {
  const intl = new MatPaginatorIntl();
  intl.itemsPerPageLabel = 'Registros por página:';
  intl.nextPageLabel     = 'Página siguiente';
  intl.previousPageLabel = 'Página anterior';
  intl.firstPageLabel    = 'Primera página';
  intl.lastPageLabel     = 'Última página';
  intl.getRangeLabel = (page: number, pageSize: number, length: number): string => {
    if (length === 0) return '0 de 0';
    const total = Math.ceil(length / pageSize);
    return `${page + 1} de ${total}`;
  };
  return intl;
}