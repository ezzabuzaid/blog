import rss from "@astrojs/rss";
import { SITE } from "@config";
import getSortedPosts from "@utils/getSortedPosts";
import slugify from "@utils/slugify";

export async function get() {
  const sortedPosts = await getSortedPosts();
  return rss({
    title: SITE.title,
    description: SITE.desc,
    site: SITE.website,
    items: sortedPosts.map(({ data }) => ({
      link: `posts/${slugify(data)}`,
      title: data.title,
      description: data.description,
      pubDate: new Date(data.pubDatetime),
    })),
  });
}
