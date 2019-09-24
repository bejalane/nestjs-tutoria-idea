export class PaginationClass {
    items: any[];
    itemCount: number;
    totalItems: number;
    pageCount: number;
    next?: string;
    previous?: string;
}

export const paginationSettings = {
    limit: 10,
    order: 'DESC'
}