import generateOgImage from "@utils/generateOgImage";
import type { APIRoute } from "astro";
import { getPublishedPosts } from "../utils/getPosts";

export const get: APIRoute = async ({ params, props }) => ({
  body: await generateOgImage(params.ogTitle!, props.description!),
});

const postImportResult = await getPublishedPosts();
const posts = Object.values(postImportResult);

export function getStaticPaths() {
  return posts
    .filter(({ data }) => !data.ogImage)
    .map(({ data }) => ({
      params: {
        ogTitle: data.title,
      },
      props: {
        description: data.description,
      },
    }));
}
