import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const tech = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/tech' }),
  schema: z.object({
    title: z.string().min(1, 'Title is required'),
    author: z.string().min(1, 'Author GitHub handle is required'),
    publishDate: z.coerce.date(),
    tags: z.array(z.string()).min(1, 'At least one tag is required'),
    description: z.string().max(200, 'Description must be 200 characters or fewer'),
  }),
});

const wellness = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/wellness' }),
  schema: z.object({
    title: z.string().min(1, 'Title is required'),
    author: z.string().min(1, 'Author GitHub handle is required'),
    category: z.enum(['Mental', 'Physical', 'Burnout'], {
      errorMap: () => ({ message: 'category must be one of: Mental, Physical, Burnout' }),
    }),
    publishDate: z.coerce.date(),
    readingTime: z.number().positive('readingTime must be a positive number of minutes'),
    description: z.string().max(200, 'Description must be 200 characters or fewer'),
  }),
});

export const collections = { tech, wellness };
