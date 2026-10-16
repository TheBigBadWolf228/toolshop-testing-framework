import { z } from 'zod';

export const SuccessSchema = z.object({ success: z.boolean() });

export const ValidationErrorsSchema = z.record(z.string(), z.array(z.string()));

export type ValidationErrors = z.infer<typeof ValidationErrorsSchema>;
