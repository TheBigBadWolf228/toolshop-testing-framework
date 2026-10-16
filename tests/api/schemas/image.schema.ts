import { z } from 'zod';

export const ImageSchema = z.object({
  id: z.string(),
  by_name: z.string(),
  by_url: z.string(),
  source_name: z.string(),
  source_url: z.string(),
  file_name: z.string(),
  title: z.string(),
});

export const ImageListSchema = z.array(ImageSchema);

export type Image = z.infer<typeof ImageSchema>;
