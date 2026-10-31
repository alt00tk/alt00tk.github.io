import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { sortArticlesByPublishedAt, articleLanguage, articleUrl } from "../lib/blog";

function markdownText(value: string): string {
  return value.replace(/\s+/g, " ").trim().replace(/[\\`*_[\]<>]/g, "\\$&");
}

export const GET: APIRoute = async ({ site }) => {
  const articles = sortArticlesByPublishedAt(await getCollection("blog"));
  const entries = (language: "ja" | "en") => articles
    .filter(article => articleLanguage(article) === language)
    .map((article) => {
      const sourceUrl = new URL(articleUrl(article).replace(/\/$/, ".md"), site);
      return `- [${markdownText(article.data.title)}](${sourceUrl}): ${markdownText(article.data.description)}`;
    });
  const contents = [
    "# notes",
    "",
    "> 技術・設計・AIについて考えたことと、判断の記録。",
    "",
    "## 日本語の記事 (Japanese, ja)",
    "",
    ...entries("ja"),
    "",
    "## English articles (en)",
    "",
    ...entries("en"),
    "",
  ].join("\n");

  return new Response(contents, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
