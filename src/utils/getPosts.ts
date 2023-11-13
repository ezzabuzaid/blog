import { getCollection, type CollectionEntry } from "astro:content";

export type BlogContentType = CollectionEntry<"blog">;

export async function getPosts(
  filter?: (entry: BlogContentType) => boolean
): Promise<BlogContentType[]> {
  const posts = await getCollection("blog", filter);
  for (const post of posts) {
    const {
      remarkPluginFrontmatter: { minutesRead },
    } = await post.render();
    post.data.minutesRead = minutesRead;
  }
  return posts;
}

export function getPublishedPosts(): Promise<BlogContentType[]> {
  return getPosts(({ data }) => (import.meta.env.DEV ? true : !data.draft));
}
