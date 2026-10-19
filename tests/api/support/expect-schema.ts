import { z } from 'zod';

export function expectSchema<T extends z.ZodType>(
  schema: T,
  data: unknown,
  action: string
): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(
      `${action} body does not match schema:\n${z.prettifyError(result.error)}`
    );
  }
  return result.data;
}
