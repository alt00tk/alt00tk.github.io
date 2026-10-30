import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";
import { articleLanguage, articleSlug } from "../../lib/blog";

export const getStaticPaths = (async () => {
  const articles = (await getCollection("blog")).filter(a => articleLanguage(a) === "ja");

  return articles.map((article) => ({
    params: { slug: articleSlug(article) },
    props: { article },
  }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) => {
  const { article } = props;
  if (article.body === undefined) {
    throw new Error(`Missing Markdown source for blog article "${article.id}".`);
  }

  return new Response(article.body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
