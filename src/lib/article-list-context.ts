export interface ArticleListContext {
  listUrl: string;
  articleUrl: string;
  scrollY: number;
  searchOpen: boolean;
  query: string;
}

const CONTEXT_PREFIX = "notes-article-list-context:";
const CONTEXT_MAX_AGE = 30 * 60 * 1000;
const ORIGIN_PARAM = "list-origin";
const RETURN_PARAM = "list-return";

export function prepareArticleLink(link: HTMLAnchorElement, context: ArticleListContext) {
  prepareContextLink(link, context, ORIGIN_PARAM);
}

export function prepareListReturnLink(link: HTMLAnchorElement, context: ArticleListContext) {
  link.href = context.listUrl;
  prepareContextLink(link, context, RETURN_PARAM);
}

function prepareContextLink(link: HTMLAnchorElement, context: ArticleListContext, parameter: string) {
  const destination = new URL(link.href);
  destination.searchParams.delete(parameter);
  link.href = destination.href;
  try {
    // Each activation has its own snapshot, including simultaneous tabs for the same article.
    const token = crypto.randomUUID();
    destination.searchParams.set(parameter, token);
    const now = Date.now();
    for (const key of Object.keys(localStorage)) {
      if (!key.startsWith(CONTEXT_PREFIX)) continue;
      try {
        const saved = JSON.parse(localStorage.getItem(key) ?? "null");
        if (!saved || typeof saved.createdAt !== "number" || now - saved.createdAt > CONTEXT_MAX_AGE) {
          localStorage.removeItem(key);
        }
      } catch {
        localStorage.removeItem(key);
      }
    }
    localStorage.setItem(CONTEXT_PREFIX + token, JSON.stringify({
      ...context,
      articleUrl: parameter === ORIGIN_PARAM ? destination.href : context.articleUrl,
      destinationUrl: destination.href, createdAt: now,
    }));
    link.href = destination.href;
  } catch {
    // Keep the normal destination link if shared storage cannot be used.
  }
}

export function readArticleOrigin(): ArticleListContext | undefined {
  return readSharedContext(ORIGIN_PARAM);
}

function readSharedContext(parameter: string): ArticleListContext | undefined {
  try {
    const token = new URL(location.href).searchParams.get(parameter);
    if (!token || !/^[a-f0-9-]{36}$/.test(token)) return;
    const saved = JSON.parse(localStorage.getItem(CONTEXT_PREFIX + token) ?? "null");
    if (
      !saved || saved.destinationUrl !== location.href || typeof saved.createdAt !== "number" ||
      Date.now() - saved.createdAt > CONTEXT_MAX_AGE
    ) return;
    return validateListContext(saved);
  } catch {
    // A missing or expired snapshot cannot be restored.
  }
}

function validateListContext(context: unknown): ArticleListContext | undefined {
  try {
    if (typeof context !== "object" || context === null) return;
    const value = context as ArticleListContext;
    if (typeof value.listUrl !== "string" || typeof value.articleUrl !== "string") return;
    const list = new URL(value.listUrl);
    const article = new URL(value.articleUrl);
    if (
      list.origin === location.origin &&
      (list.pathname === "/" || /^\/articles\/page\/[1-9]\d*\/$/.test(list.pathname)) &&
      article.origin === location.origin &&
      /^\/articles\/[^/]+\/$/.test(article.pathname) &&
      typeof value.scrollY === "number" && Number.isFinite(value.scrollY) && value.scrollY >= 0 &&
      typeof value.searchOpen === "boolean" && typeof value.query === "string"
    ) return value;
  } catch {
    // Missing, invalid, or inaccessible state has the same normal-link fallback.
  }
}

export function takeListReturn(): ArticleListContext | undefined {
  const context = readSharedContext(RETURN_PARAM);
  if (!context) return;
  const source = new URL(context.articleUrl);
  source.hash = "";
  if (document.referrer !== source.href) return;
  // Remove only the transport URL, preserving this entry's position in browser history.
  history.replaceState(history.state, "", context.listUrl);
  return context;
}
