import { faker } from '@faker-js/faker';
import {
  Co2RatingSchema,
  type ProductRequest,
} from '../schemas/product.schema.js';

export type ProductRefs = Pick<
  ProductRequest,
  'brand_id' | 'category_id' | 'product_image_id'
>;

export function buildProduct(
  refs: ProductRefs,
  overrides: Partial<ProductRequest> = {}
): ProductRequest {
  return {
    name: `autotest ${faker.commerce.productName()} ${faker.string.alphanumeric(6)}`,
    description: faker.commerce.productDescription(),
    price: faker.number.float({ min: 1, max: 500, fractionDigits: 2 }),
    is_location_offer: faker.datatype.boolean(),
    is_rental: false,
    co2_rating: faker.helpers.arrayElement(Co2RatingSchema.options),
    ...refs,
    ...overrides,
  };
}
