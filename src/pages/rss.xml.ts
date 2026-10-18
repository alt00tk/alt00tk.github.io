import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import rss from "@astrojs/rss";
import { sortArticlesByPublishedAt } from "../lib/blog";

export const GET: APIRoute = async ({ site }) => {
  if (!site) {
    throw new Error("RSS generation requires the site URL in astro.config.mjs.");
  }

  const articles = sortArticlesByPublishedAt(await getCollection("blog"));

  return rss({
    title: "notes",
    description: "技術・設計・AIについて考えたことと、判断の記録。",
    site,
    items: articles.map((article) => ({
      title: article.data.title,
      link: new URL(`/articles/${article.id}/`, site).href,
      description: article.data.description,
      pubDate: new Date(article.data.publishedAt),
    })),
    customData: "<language>ja</language>",
  });
};
