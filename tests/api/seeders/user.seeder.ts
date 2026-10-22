import type { Api } from '../clients/api.js';
import { USER_ADDRESS } from '../data/users.js';
import { buildUser } from '../factories/user.factory.js';
import type { RegisteredUser } from '../schemas/user.schema.js';

export interface SeededUser extends RegisteredUser {
  password: string;
}

export async function seedUser(api: Api): Promise<SeededUser> {
  const user = buildUser();
  const registered = await api.users.register({
    ...user,
    address: USER_ADDRESS,
  });
  return { ...registered, password: user.password };
}
