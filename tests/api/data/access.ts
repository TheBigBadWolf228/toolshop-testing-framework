import type { ApiCaller } from '../support/fixtures.js';

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
