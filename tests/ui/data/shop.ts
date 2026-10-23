export const PRICE_RANGE = { min: 100, max: 200 } as const;

export const SEARCH_TERM = 'Protective Gloves';

export const PAGINATION_TARGET_PAGE = 5;

export const CO2_SORT = {
  category: 'Hand Tools',
  option: 'CO₂ Rating (A - E)',
} as const;

export const DRILL_FILTER = {
  category: 'Power Tools',
  type: 'Drill',
  brand: 'MightyCraft Hardware',
  drills: [
    'Cordless Drill 12V',
    'Cordless Drill 18V',
    'Cordless Drill 20V',
    'Cordless Drill 24V',
  ],
  brandDrills: ['Cordless Drill 12V'],
} as const;

export const PRODUCT_DETAILS = {
  name: 'Combination Pliers',
  price: '14.15',
  descriptionStart: 'Versatile combination pliers designed for gripping',
} as const;

export const NON_ECO_CO2_RATING = 'C';

export const CART = {
  product: { price: 14.15, priceText: '$14.15' },
  secondProduct: { price: 9.17, priceText: '$9.17' },
  quantity: 3,
  quantityTotal: '$42.45',
  bothProductsTotal: '$23.32',
} as const;

export const LOOKUP_ADDRESS = {
  country: 'Netherlands (the)',
  postalCode: '1122AB',
  houseNumber: '37',
} as const;

export const LOOKUP_ADDRESS_RESULT = {
  street: 'Kanhaistraat',
  city: 'Scherpenzeel',
  state: 'Groningen',
} as const;

export const CHECKOUT = {
  product: { name: 'Combination Pliers', totalText: '$14.15' },
  stock: 1_000_000,
  paymentMethod: 'Cash on Delivery',
  paymentSuccess: 'Payment was successful',
  confirmation: 'Thanks for your order!',
  invoiceNumberPattern: /INV-\d+/,
} as const;

export const FAVORITE_PRODUCT = 'Combination Pliers';

export const INVOICE_COLUMNS = [
  'Invoice Number',
  'Billing Address',
  'Invoice Date',
  'Total',
  '',
] as const;

export const INVALID_CREDENTIALS = {
  email: 'invalid@example.com',
  password: 'qwerty123',
} as const;

export const CONTACT = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  subject: { label: 'Warranty', value: 'warranty' },
  message:
    'My drill stopped working after two weeks. Is this covered by the warranty?',
  invalidEmail: 'not-an-email',
  tooShortMessage: 'x'.repeat(49),
  status: 'NEW',
} as const;

export const CONTACT_ERRORS = {
  required: [
    'First name is required',
    'Last name is required',
    'Email is required',
    'Subject is required',
    'Message is required',
  ],
  invalidEmail: 'Email format is invalid',
  messageTooShort: 'Message must be minimal 50 characters',
} as const;
