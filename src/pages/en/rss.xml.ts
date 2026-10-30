import type { APIRoute } from "astro";
import { blogRss } from "../../lib/rss";

export const GET: APIRoute = ({ site }) => blogRss("en", site);
