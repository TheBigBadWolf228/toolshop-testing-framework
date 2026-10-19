import { z } from 'zod';

export const SuccessSchema = z.object({ success: z.boolean() });

export const IdSchema = z.object({ id: z.string() });

export const MessageSchema = z.object({ message: z.string() });

export const ValidationErrorsSchema = z.record(z.string(), z.array(z.string()));

export const paginated = <T extends z.ZodType>(item: T) =>
  z.object({
    current_page: z.number().int(),
    data: z.array(item),
    from: z.number().int().nullable(),
    last_page: z.number().int(),
    per_page: z.number().int(),
    to: z.number().int().nullable(),
    total: z.number().int(),
  });

export type ValidationErrors = z.infer<typeof ValidationErrorsSchema>;
