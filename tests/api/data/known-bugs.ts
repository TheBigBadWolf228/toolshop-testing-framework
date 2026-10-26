const ISSUES =
  'https://github.com/TheBigBadWolf228/toolshop-testing-framework/issues';

export const PRODUCT_WRITE_WITHOUT_AUTH = {
  tag: '@known-bug',
  annotation: [
    { type: 'issue', description: `${ISSUES}/23` },
    {
      type: 'description',
      description: 'Any caller can POST/PUT/PATCH /products (expected 401/403)',
    },
  ],
};
export const PRODUCT_SERVER_ERROR_ON_INVALID_INPUT = {
  tag: '@known-bug',
  annotation: [
    { type: 'issue', description: `${ISSUES}/24` },
    {
      type: 'description',
      description:
        'Unknown relation id or too large price on /products gives 500 (expected 422)',
    },
  ],
};
export const PRODUCT_PUT_EMPTY_BODY = {
  tag: '@known-bug',
  annotation: [
    { type: 'issue', description: `${ISSUES}/25` },
    {
      type: 'description',
      description:
        'PUT /products/{id} with {} gives 200 and changes nothing (expected 422)',
    },
  ],
};
