import { getPublishedPosts } from "./getPosts";

export default async function getSortedPosts() {
  const posts = await getPublishedPosts();
  return posts.sort(
    (a, b) =>
      Math.floor(new Date(b.data.pubDatetime).getTime() / 1000) -
      Math.floor(new Date(a.data.pubDatetime).getTime() / 1000)
  );
}
