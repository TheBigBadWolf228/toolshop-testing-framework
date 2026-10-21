import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { UI_URL } from './env.js';
import type { Role } from './users.js';

export function authFile(role: Role): string {
  return path.resolve(
    import.meta.dirname,
    `../../playwright/.auth/${role}.json`
  );
}

export const TOKEN_KEY = 'auth-token';

export interface StorageState {
  cookies: [];
  origins: {
    origin: string;
    localStorage: { name: string; value: string }[];
  }[];
}

export function toStorageState(token: string): StorageState {
  return {
    cookies: [],
    origins: [
      { origin: UI_URL, localStorage: [{ name: TOKEN_KEY, value: token }] },
    ],
  };
}

export async function readToken(role: Role): Promise<string> {
  const file = authFile(role);
  const state = JSON.parse(await readFile(file, 'utf-8')) as StorageState;
  const token = state.origins
    .find((o) => o.origin === UI_URL)
    ?.localStorage.find((item) => item.name === TOKEN_KEY)?.value;

  if (!token) {
    throw new Error(`No "${TOKEN_KEY}" in ${file}. Did the setup project run?`);
  }
  return token;
}
