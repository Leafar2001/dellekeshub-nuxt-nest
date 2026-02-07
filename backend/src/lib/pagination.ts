import * as z from 'zod/v4';

export const PaginationSchema = z.object({
  createdAt: z.date(),
  lastId: z.string(),
});

export type Pagination = z.infer<typeof PaginationSchema>;
