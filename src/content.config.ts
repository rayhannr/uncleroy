import { glob } from 'astro/loaders'
import { defineCollection, z } from 'astro:content'

const blogs = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/contents/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      image: image(),
      imageCaption: z.string(),
      imageCredit: z.string(),
      imageLink: z.string(),
      description: z.string(),
      publishedAt: z.date(),
      status: z.enum(['draft', 'published'])
    })
})

export const collections = { blogs }
