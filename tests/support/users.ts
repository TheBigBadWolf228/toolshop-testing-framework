import { requireEnv } from './env.js';

export type Role = 'customer' | 'admin';

export type ApiRole = Role | 'invalidToken';

export type ApiCaller = ApiRole | 'anon';

export interface Credentials {
  email: string;
  password: string;
}

export const ROLES: readonly Role[] = ['customer', 'admin'];

export function getCredentials(role: Role): Credentials {
  const prefix = role.toUpperCase();
  return {
    email: requireEnv(`${prefix}_EMAIL`),
    password: requireEnv(`${prefix}_PASSWORD`),
  };
}
