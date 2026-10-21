import { z } from 'zod';

export const TokenResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  expires_in: z.number().int(),
});

export type TokenResponse = z.infer<typeof TokenResponseSchema>;
