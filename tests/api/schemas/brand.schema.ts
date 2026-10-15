import { z } from 'zod';

export const BrandRequestSchema = z.object({
  name: z.string(),
  slug: z.string(),
});

export const BrandSchema = BrandRequestSchema.extend({
  id: z.string(),
});

export const BrandListSchema = z.array(BrandSchema);

export const SuccessSchema = z.object({ success: z.boolean() });

export const ValidationErrorsSchema = z.record(z.string(), z.array(z.string()));

export type BrandRequest = z.infer<typeof BrandRequestSchema>;
export type Brand = z.infer<typeof BrandSchema>;
export type ValidationErrors = z.infer<typeof ValidationErrorsSchema>;
