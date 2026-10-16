import { z } from 'zod';
import { BrandSchema } from './brand.schema.js';
import { CategorySchema } from './category.schema.js';
import { ImageSchema } from './image.schema.js';
import { paginated } from './responses.schema.js';

export const Co2RatingSchema = z.enum(['A', 'B', 'C', 'D', 'E']);

export const ProductRequestSchema = z.object({
  name: z.string(),
  description: z.string(),
  price: z.number(),
  category_id: z.string(),
  brand_id: z.string(),
  product_image_id: z.string(),
  is_location_offer: z.boolean(),
  is_rental: z.boolean(),
  co2_rating: Co2RatingSchema,
});

export const ProductSpecSchema = z.object({
  id: z.string(),
  product_id: z.string(),
  spec_name: z.string(),
  spec_value: z.string(),
  spec_unit: z.string().nullable(),
});

const ProductBaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  is_location_offer: z.boolean(),
  is_rental: z.boolean(),
  co2_rating: Co2RatingSchema,
  // Role-dependent: admin gets a stock count, others a boolean; null right after create.
  in_stock: z.union([z.number().int(), z.boolean()]).nullable(),
  is_eco_friendly: z.boolean(),
  product_image: ImageSchema,
});

const BrandRefSchema = BrandSchema.pick({ id: true, name: true });
const CategoryRefSchema = CategorySchema.pick({
  id: true,
  name: true,
  slug: true,
  parent_id: true,
});

// GET /products/{id}
export const ProductSchema = ProductBaseSchema.extend({
  brand: BrandRefSchema,
  category: CategoryRefSchema,
  specs: z.array(ProductSpecSchema),
});

// POST /products echo: brand includes slug, no specs
export const CreatedProductSchema = ProductBaseSchema.extend({
  brand: BrandSchema,
  category: CategoryRefSchema,
});

// GET /products item: category without parent_id, no specs
export const ProductListItemSchema = ProductBaseSchema.extend({
  brand: BrandRefSchema,
  category: CategoryRefSchema.omit({ parent_id: true }),
});

export const ProductPageSchema = paginated(ProductListItemSchema);

export type ProductRequest = z.infer<typeof ProductRequestSchema>;
export type Product = z.infer<typeof ProductSchema>;
export type CreatedProduct = z.infer<typeof CreatedProductSchema>;
export type ProductListItem = z.infer<typeof ProductListItemSchema>;
export type ProductPage = z.infer<typeof ProductPageSchema>;
