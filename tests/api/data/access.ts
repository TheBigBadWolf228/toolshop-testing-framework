import type { ApiCaller } from '../../support/users.js';

export interface Denial {
  status: number;
  message: string;
}

export interface DeniedCaller extends Denial {
  caller: ApiCaller;
}

export const INVALID_TOKEN = 'not.a.jwt';

export const UNAUTHORIZED: Denial = { status: 401, message: 'Unauthorized' };
export const FORBIDDEN: Denial = { status: 403, message: 'Forbidden' };

export const NON_ADMIN_CALLERS: readonly DeniedCaller[] = [
  { caller: 'anon', ...UNAUTHORIZED },
  { caller: 'invalidToken', ...UNAUTHORIZED },
  { caller: 'customer', ...FORBIDDEN },
];

export const UNKNOWN_ID = '01ZZZZZZZZZZZZZZZZZZZZZZZZ';

export const NOT_FOUND: Denial = {
  status: 404,
  message: 'Requested item not found',
};
export const METHOD_NOT_ALLOWED: Denial = {
  status: 405,
  message: 'Method is not allowed for the requested route',
};

export const WRONG_METHODS = {
  collection: ['PUT', 'PATCH', 'DELETE'],
  item: ['POST'],
} as const;
