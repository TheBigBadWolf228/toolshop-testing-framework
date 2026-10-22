import { z } from 'zod';

export const FavoriteSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  product_id: z.string(),
});

export const FavoriteListSchema = z.array(
  FavoriteSchema.extend({
    product: z.object({ id: z.string(), name: z.string() }),
  })
);

export type Favorite = z.infer<typeof FavoriteSchema>;
export type FavoriteListItem = z.infer<typeof FavoriteListSchema>[number];
