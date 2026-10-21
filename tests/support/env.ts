export const UI_URL = 'https://practicesoftwaretesting.com';
export const API_URL = 'https://api.practicesoftwaretesting.com';
export const API_HEADERS: Record<string, string> = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing env var ${name}. Copy .env.example to .env.`);
  }
  return value;
}
