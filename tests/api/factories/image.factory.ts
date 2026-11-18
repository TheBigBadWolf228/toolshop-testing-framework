import { faker } from '@faker-js/faker';
import type { Image } from '../schemas/image.schema.js';

export function pickImage(images: Image[]): Image {
  return faker.helpers.arrayElement(images);
}
