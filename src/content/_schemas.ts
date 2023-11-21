import { z } from "astro:content";

export const blogSchema = z
  .object({
    author: z.string(),
    pubDatetime: z.date(),
    pageTitle: z.string().optional(),
    title: z.string(),
    featured: z.boolean().optional(),
    draft: z.boolean().optional(),
    tags: z.array(z.string()).default(["others"]),
    ogImage: z.string().optional(),
    heroImage: z.string().optional(),
    description: z.string(),
    canonicalURL: z.string().optional(),
    minutesRead: z.string().optional(),
    howToReadThisArticle: z
      .string()
      .optional()
      .describe(
        "in the Compiler article, I added a section on how to read the article. we need to add this section to all articles in have custom design to show case this section"
      ),
  })
  .strict();

export type BlogFrontmatter = z.infer<typeof blogSchema>;
