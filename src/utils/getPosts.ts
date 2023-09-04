import { getCollection, type CollectionEntry } from "astro:content";

export async function getPosts(
  filter?: (entry: CollectionEntry<"blog">) => boolean
) {
  const posts = await getCollection("blog", filter);
  for (const post of posts) {
    const {
      remarkPluginFrontmatter: { minutesRead },
    } = await post.render();
    post.data.minutesRead = minutesRead;
  }
  return posts;
}

export function getPublishedPosts() {
  return getPosts(({ data }) => (import.meta.env.DEV ? true : !data.draft));
}
