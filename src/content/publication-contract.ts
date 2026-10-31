import { parse, walkSync, ELEMENT_NODE } from "ultrahtml";
import { unescape } from "html-escaper";

type Article = {
  id: string;
  filePath: string;
  data: { publishedAt: string };
  rendered: { html: string };
};

// Validate the rendered body, before templates add intentional cross-language links.
// Markdown parsing resolves reference links and escapes code examples in this HTML.
export function validatePublication(articles: Article[], site: URL): void {
  const byId = new Map(articles.map((article) => [article.id, article]));
  const errors: string[] = [];
  for (const article of articles) {
    const [language, slug] = article.id.split("/");
    const other = byId.get(`${language === "ja" ? "en" : "ja"}/${slug}`);
    const fail = (target: string, reason: string) => errors.push(`${article.filePath}: ${target}: ${reason}`);
    if (!other) fail(slug, "missing language counterpart");
    else if (article.data.publishedAt !== other.data.publishedAt) {
      fail(slug, `publishedAt mismatch (${article.data.publishedAt} / ${other.data.publishedAt})`);
    }
    const base = new URL(`${language === "en" ? "/en" : ""}/articles/${slug}/`, site);
    walkSync(parse(article.rendered.html), (node) => {
      if (node.type !== ELEMENT_NODE || node.name !== "a" || !("href" in node.attributes)) return;
      const href = unescape(node.attributes.href);
      if (!href || href.startsWith("#") || href.startsWith("?")) return;
      let target: URL;
      try { target = new URL(href, base); } catch { return; }
      if (target.origin !== site.origin) return;
      let pathname: string;
      try { pathname = decodeURIComponent(target.pathname); } catch { return; }
      // Authors may link sibling source files rather than published routes.
      const sourcePath = href.split(/[?#]/, 1)[0];
      const relativeSource = !sourcePath.startsWith("/") && !/^[a-z][a-z0-9+.-]*:/i.test(sourcePath)
        ? sourcePath.match(/^(?:\.\/)?([a-z0-9]+(?:-[a-z0-9]+)*)(\.md|\/)?$/) : null;
      if (relativeSource && (relativeSource[2] === ".md" || byId.has(`${language}/${relativeSource[1]}`))) {
        const siblingSlug = relativeSource[1];
        if (!byId.has(`${language}/${siblingSlug}`)) fail(href, "article target does not exist");
        fail(href, `invalid article link format; use ${language === "en" ? "/en" : ""}/articles/${siblingSlug}/`);
        return;
      }
      const match = pathname.match(/^\/(en\/)?articles\/([^/]+?)(?:\/|\.md)?$/);
      if (!match) return;
      const targetLanguage = match[1] ? "en" : "ja";
      const targetSlug = match[2];
      const canonical = `${targetLanguage === "en" ? "/en" : ""}/articles/${targetSlug}/`;
      if (!byId.has(`${targetLanguage}/${targetSlug}`)) fail(href, "article target does not exist");
      if (targetLanguage !== language) fail(href, "article language mismatch");
      if (href.split(/[?#]/, 1)[0] !== canonical) fail(href, `invalid article link format; use ${canonical}`);
    });
  }
  if (errors.length) throw new Error(`Bilingual publication contract violated:\n${errors.join("\n")}`);
}
