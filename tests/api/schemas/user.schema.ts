import { z } from 'zod';
import { paginated } from './responses.schema.js';

export const UserSchema = z.object({
  id: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  dob: z.string().nullable(),
  address: z.object({
    street: z.string().nullable(),
    house_number: z.string().nullable(),
    city: z.string().nullable(),
    state: z.string().nullable(),
    country: z.string().nullable(),
    postal_code: z.string().nullable(),
  }),
  enabled: z.boolean(),
  role: z.string(),
});

export const UserSearchPageSchema = paginated(UserSchema);

export interface NewUser {
  first_name: string;
  last_name: string;
  dob: string;
  phone: string;
  email: string;
  password: string;
}

export type User = z.infer<typeof UserSchema>;
export type UserSearchPage = z.infer<typeof UserSearchPageSchema>;
