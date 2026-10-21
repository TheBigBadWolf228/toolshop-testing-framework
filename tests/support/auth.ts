import { UI_URL } from './env.js';

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
