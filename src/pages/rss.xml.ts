import rss from "@astrojs/rss";
import { SITE } from "@config";
import getSortedPosts from "@utils/getSortedPosts";

export async function get() {
  const sortedPosts = await getSortedPosts();
  return rss({
    title: SITE.title,
    description: SITE.desc,
    site: SITE.website,
    items: sortedPosts.map(post => ({
      link: `posts/${post.id}`,
      title: post.data.title,
      description: post.data.description,
      pubDate: new Date(post.data.pubDatetime),
    })),
  });
}
