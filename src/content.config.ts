import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { blogLoader } from "./content/blog-loader";

const blog = defineCollection({
  loader: blogLoader,
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
