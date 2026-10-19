export const PRODUCT_WRITE_WITHOUT_AUTH = {
  annotation: {
    type: 'issue',
    description: 'Any caller can POST/PUT/PATCH /products (expected 401/403)',
  },
};
