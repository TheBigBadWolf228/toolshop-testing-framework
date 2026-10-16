import { z } from 'zod';

export const BrandRequestSchema = z.object({
  name: z.string(),
  slug: z.string(),
});

export const BrandSchema = BrandRequestSchema.extend({
  id: z.string(),
});

export const BrandListSchema = z.array(BrandSchema);

export type BrandRequest = z.infer<typeof BrandRequestSchema>;
export type Brand = z.infer<typeof BrandSchema>;
