import { slug as slugger } from "github-slugger";
import type { BlogContentType } from "./getPosts";

export const slugifyStr = (str: string) => slugger(str);

const slugify = (post: BlogContentType) => post.id.replace(".md", "");

export const slugifyAll = (arr: string[]) => arr.map(str => slugifyStr(str));

export default slugify;
