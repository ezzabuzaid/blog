import generateOgImage from "@utils/generateOgImage";
import type { APIRoute } from "astro";
import { getPublishedPosts } from "../utils/getPosts";

export const get: APIRoute = async ({ params }) => ({
  body: await generateOgImage(params.ogTitle!, params.ogDescription!),
});

const postImportResult = await getPublishedPosts();
const posts = Object.values(postImportResult);

export function getStaticPaths() {
  return posts
    .filter(({ data }) => !data.ogImage)
    .map(({ data }) => ({
      params: {
        ogTitle: data.title,
        ogDescription: data.ogDescription,
      },
    }));
}
