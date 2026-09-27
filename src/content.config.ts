import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const entryBySlug = new Map<string, string>();

const blog = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/blog",
    generateId: ({ entry, base }) => {
      const filename = entry.split("/").at(-1) ?? entry;
      const slug = filename.replace(/\.md$/, "");

      if (!slugPattern.test(slug)) {
        throw new Error(
          `Invalid blog article filename "${entry}": the filename must match ${slugPattern}.`,
        );
      }

      const existingEntry = entryBySlug.get(slug);
      if (existingEntry && existingEntry !== entry) {
        const existingFile = fileURLToPath(new URL(`./${existingEntry}`, base));
        if (existsSync(existingFile)) {
          throw new Error(
            `Duplicate blog article slug "${slug}": "src/content/blog/${existingEntry}" and "src/content/blog/${entry}" both resolve to the same article ID.`,
          );
        }
      }

      entryBySlug.set(slug, entry);
      return slug;
    },
  }),
  schema: z.strictObject({
    title: z.string().refine((value) => value.trim().length > 0, {
      error: "title must not be empty.",
    }),
    description: z.string().refine((value) => value.trim().length > 0, {
      error: "description must not be empty.",
    }),
    publishedAt: z.iso.datetime({
      error: "publishedAt must be an ISO 8601 datetime with an explicit timezone.",
      offset: true,
    }),
  }),
});

export const collections = { blog };
