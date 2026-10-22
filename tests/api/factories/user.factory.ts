import { faker } from '@faker-js/faker';
import type { NewUser } from '../schemas/user.schema.js';

const PASSWORD_SYMBOLS = '!#$%&*+-?@^_~'.split('');

function buildPassword(): string {
  return faker.helpers
    .shuffle([
      ...faker.string.alpha({ length: 4, casing: 'upper' }),
      ...faker.string.alpha({ length: 4, casing: 'lower' }),
      ...faker.string.numeric(3),
      faker.helpers.arrayElement(PASSWORD_SYMBOLS),
    ])
    .join('');
}

export function buildUser(overrides: Partial<NewUser> = {}): NewUser {
  return {
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName().slice(0, 20),
    dob: faker.date
      .birthdate({ mode: 'age', min: 20, max: 70 })
      .toISOString()
      .slice(0, 10),
    phone: faker.string.numeric(10),
    email: `autotest.${faker.string.alphanumeric({ length: 10, casing: 'lower' })}@example.com`,
    password: buildPassword(),
    ...overrides,
  };
}
