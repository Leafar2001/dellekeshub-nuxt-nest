import { Pagination, PaginationSchema } from '../pagination';
import * as z from 'zod/v4';

const cursorSchema = z.object({
  _id: z.string(),
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
  queryResult: any[],
): Pagination | undefined {
  if (!queryResult) {
    return undefined;
  }

  const parseResult = cursorSchema.safeParse(
    queryResult[queryResult.length - 1],
  );

  if (!parseResult.success) {
    return undefined;
  }

  const { _id, createdAt } = parseResult.data;

  return {
    createdAt,
    lastId: _id,
  };
}
