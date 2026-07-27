import * as z from 'zod/v4';

export const PaginationSchema = z.object({
  createdAt: z.coerce.date(),
  lastId: z.string(),
});

export type Pagination = z.infer<typeof PaginationSchema>;
