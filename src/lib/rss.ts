import { getCollection } from "astro:content";
import rss from "@astrojs/rss";
import { sortArticlesByPublishedAt, articleLanguage, articleUrl, type Language } from "./blog";

export async function blogRss(language: Language, site: URL | undefined) {
  if (!site) {
    throw new Error("RSS generation requires the site URL in astro.config.mjs.");
  }
  const articles = sortArticlesByPublishedAt((await getCollection("blog")).filter(a => articleLanguage(a) === language));
  return rss({
    title: "notes",
    description: language === "en"
      ? "Thoughts on technology, design, and AI, and records of decisions."
      : "技術・設計・AIについて考えたことと、判断の記録。",
    site,
    items: articles.map((article) => ({
      title: article.data.title,
      link: new URL(articleUrl(article), site).href,
      description: article.data.description,
      pubDate: new Date(article.data.publishedAt),
    })),
    customData: `<language>${language}</language>`,
  });
}
