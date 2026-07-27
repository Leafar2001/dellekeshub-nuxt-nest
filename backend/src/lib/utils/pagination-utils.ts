import { Pagination, PaginationSchema } from '../validation/pagination';
import * as z from 'zod/v4';

const cursorSchema = z.object({
  id: z.string(),
  createdAt: z.instanceof(Date),
});

export function paginationToKey(pagination: Pagination): string {
  return btoa(JSON.stringify(pagination));
}

export function keyToPagination(pagination: string): Pagination {
  const parseResult = PaginationSchema.safeParse(JSON.parse(atob(pagination)));

  if (!parseResult.success) {
    throw new Error('Invalid pagination');
  }

  return parseResult.data;
}

export function queryResultToPagination(
  queryResult: { id: string; createdAt: Date }[] | undefined,
): Pagination | undefined {
  if (!queryResult || queryResult.length === 0) {
    return undefined;
  }

  const parseResult = cursorSchema.safeParse(
    queryResult[queryResult.length - 1],
  );

  if (!parseResult.success) {
    return undefined;
  }

  const { id, createdAt } = parseResult.data;

  return {
    createdAt,
    lastId: id,
  };
}
