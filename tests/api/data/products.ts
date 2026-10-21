import type { Co2Rating } from '../schemas/product.schema.js';

export const ECO_FRIENDLY_RATINGS: readonly Co2Rating[] = ['A', 'B'];

export const PRODUCT_NAME_MAX_LENGTH = 120;
export const PRODUCT_PRICE_TOO_LARGE = 1e12;
export const SEEDED_PRODUCT_STOCK = 10;

export const PRODUCT_REQUIRED_FIELDS: readonly string[] = [
  'name',
  'price',
  'category_id',
  'brand_id',
  'is_location_offer',
  'is_rental',
  'product_image_id',
];

export const PRODUCT_RELATION_FIELDS = [
  'brand_id',
  'category_id',
  'product_image_id',
] as const;

export interface InvalidProductField {
  label: string;
  override: Record<string, unknown>;
  field: string;
  message: string;
}

export const INVALID_PRODUCT_FIELDS: readonly InvalidProductField[] = [
  {
    label: 'price is not a number',
    override: { price: 'abc' },
    field: 'price',
    message: 'The price field must be a number.',
  },
  {
    label: 'is_rental is not a boolean',
    override: { is_rental: 'abc' },
    field: 'is_rental',
    message: 'The is rental field must be true or false.',
  },
  {
    label: 'name is only whitespace',
    override: { name: '   ' },
    field: 'name',
    message: 'The name field is required.',
  },
  {
    label: 'name is longer than the limit',
    override: { name: 'n'.repeat(PRODUCT_NAME_MAX_LENGTH + 1) },
    field: 'name',
    message: `The name field must not be greater than ${PRODUCT_NAME_MAX_LENGTH} characters.`,
  },
];
