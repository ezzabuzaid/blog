import * as dts from "schema-dts";

interface ArticleSchemaOptions {
  articleType: "TechArticle" | "BlogPosting";
  url: string;
  title: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  author: {
    email?: string;
    name?: string;
    mainUrl?: string;
    jobTitle?: string;
    description?: string;
    additionalUrls?: string[];
  };
  audience: {
    type: string;
    description: string;
  };
}

export const articleSchema: (
  options: ArticleSchemaOptions
) => dts.TechArticle = options => ({
  "@type": "TechArticle",
  url: options.url,
  headline: options.title,
  description: options.description,
  datePublished: options.datePublished,
  dateModified: options.dateModified,
  audience: {
    "@type": "Audience",
    audienceType: options.audience.type,
    audienceDescription: options.audience.description,
  },
  isAccessibleForFree: true,
  author: {
    "@type": "Person",
    name: options.author.name,
    email: options.author.email,
    url: options.author.mainUrl,
    jobTitle: options.author.jobTitle,
    sameAs: options.author.additionalUrls,
    description: options.author.description,
  },
});
