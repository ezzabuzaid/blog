import mdx from "@astrojs/mdx";
import prefetch from "@astrojs/prefetch";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";
import rehypeExternalLinks from "rehype-external-links";
import remarkCollapse from "remark-collapse";
import remarkToc from "remark-toc";
import remarkEmbed from "./remark-embed.mjs";
import { remarkReadingTime } from "./remark-reading-time.mjs";

import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";

// https://astro.build/config
export default defineConfig({
  site: "https://techtext.dev/",
  integrations: [
    prefetch(),
    mdx(),
    tailwind({
      applyBaseStyles: false,
    }),
    react(),
    sitemap(),
  ],
  markdown: {
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeExternalLinks,
        { rel: ["noopener", "noreferrer"], target: "_blank" },
      ],
      [rehypeAutolinkHeadings, { behavior: "prepend" }],
    ],
    remarkPlugins: [
      remarkReadingTime,
      remarkEmbed,
      remarkToc,
      [
        remarkCollapse,
        {
          test: "Table Of Content",
        },
      ],
    ],
    shikiConfig: {
      theme: "one-dark-pro",
      wrap: true,
    },
    extendDefaultPlugins: true,
  },
  vite: {
    optimizeDeps: {
      exclude: ["@resvg/resvg-js"],
    },
  },
});
