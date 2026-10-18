import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";

export const getStaticPaths = (async () => {
  const articles = await getCollection("blog");

  return articles.map((article) => ({
    params: { slug: article.id },
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
