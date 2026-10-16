import { z } from 'zod';

export const CategoryRequestSchema = z.object({
  name: z.string(),
  slug: z.string(),
  parent_id: z.string().nullable().optional(),
});

export const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  parent_id: z.string().nullable(),
  get sub_categories() {
    return z.array(CategorySchema).optional();
  },
});

export const CreatedCategorySchema = CategorySchema.extend({
  parent_id: z.string().nullable().optional(),
});

export const CategoryListSchema = z.array(CategorySchema);

export type CategoryRequest = z.infer<typeof CategoryRequestSchema>;
export type Category = z.infer<typeof CategorySchema>;
export type CreatedCategory = z.infer<typeof CreatedCategorySchema>;
