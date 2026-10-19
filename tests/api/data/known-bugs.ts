export const PRODUCT_WRITE_WITHOUT_AUTH = {
  annotation: {
    type: 'issue',
    description: 'Any caller can POST/PUT/PATCH /products (expected 401/403)',
  },
};
export const PRODUCT_SERVER_ERROR_ON_INVALID_INPUT = {
  annotation: {
    type: 'issue',
    description:
      'Unknown relation id or too large price on /products gives 500 (expected 422)',
  },
};
export const PRODUCT_PUT_EMPTY_BODY = {
  annotation: {
    type: 'issue',
    description:
      'PUT /products/{id} with {} gives 200 and changes nothing (expected 422)',
  },
};
