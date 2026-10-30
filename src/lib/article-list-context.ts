export interface ArticleListContext {
  listUrl: string;
  articleUrl: string;
  scrollY: number;
  searchOpen: boolean;
  query: string;
}

const language = typeof document !== "undefined" && document.documentElement.lang === "en" ? "en" : "ja";
export const LIST_ORIGIN = `notes-list-origin-${language}`;
export const LIST_RETURN = `notes-list-return-${language}`;

export function saveListContext(key: string, context: ArticleListContext) {
  try {
    sessionStorage.setItem(key, JSON.stringify(context));
  } catch {
    try {
      sessionStorage.removeItem(key);
    } catch {
      // Normal links remain usable when storage is unavailable.
    }
  }
}

export function readListContext(key: string): ArticleListContext | undefined {
  try {
    const context = JSON.parse(sessionStorage.getItem(key) ?? "null");
    if (!context || typeof context.listUrl !== "string" || typeof context.articleUrl !== "string") return;
    const list = new URL(context.listUrl);
    const article = new URL(context.articleUrl);
    if (
      list.origin === location.origin &&
      (list.pathname === (language === "en" ? "/en/" : "/") || new RegExp(`^${language === "en" ? "/en" : ""}/articles/page/[1-9]\\d*/$`).test(list.pathname)) &&
      article.origin === location.origin &&
      new RegExp(`^${language === "en" ? "/en" : ""}/articles/[^/]+/$`).test(article.pathname) &&
      typeof context.scrollY === "number" && Number.isFinite(context.scrollY) && context.scrollY >= 0 &&
      typeof context.searchOpen === "boolean" && typeof context.query === "string"
    ) return context;
  } catch {
    // Missing, invalid, or inaccessible state has the same normal-link fallback.
  }
}

export function takeListReturn(): ArticleListContext | undefined {
  const context = readListContext(LIST_RETURN);
  try {
    sessionStorage.removeItem(LIST_RETURN);
  } catch {
    return;
  }
  if (!context || context.listUrl !== location.href) return;
  const source = new URL(context.articleUrl);
  source.hash = "";
  if (document.referrer === source.href) return context;
}
