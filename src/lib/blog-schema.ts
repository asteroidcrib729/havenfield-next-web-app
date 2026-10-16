import { z } from "zod";

// Browser validation must work with the production CSP's prohibition on eval.
z.config({ jitless: true });

const safeUrl = z
  .string()
  .max(2048)
  .refine((value) => {
    if (!value) return true;
    if (/^\/(?:images|media)\/[a-zA-Z0-9/_-]+\.(?:avif|webp|png|jpe?g|svg)$/.test(value))
      return true;
    if (/^\/api\/media\/[a-f0-9-]{36}\.webp$/.test(value)) return true;
    try {
      const url = new URL(value);
      return url.protocol === "https:" && !url.username && !url.password;
    } catch {
      return false;
    }
  }, "Use a local /images/ or /media/ asset, or an HTTPS URL");
const canonical = z
  .string()
  .max(2048)
  .refine((value) => {
    if (!value) return true;
    try {
      const url = new URL(value);
      return url.protocol === "https:" && !url.username && !url.password;
    } catch {
      return false;
    }
  }, "Canonical URL must use HTTPS");
export const blogPostSchema = z
  .object({
    slug: z
      .string()
      .trim()
      .min(1)
      .max(120)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    title: z.string().trim().min(3).max(180),
    excerpt: z.string().trim().min(10).max(400),
    body: z.string().trim().min(30).max(100_000),
    author: z.string().trim().min(2).max(100),
    category: z.string().trim().min(2).max(80),
    tags: z
      .array(z.string().trim().min(1).max(40))
      .max(12)
      .transform((tags) => [...new Map(tags.map((tag) => [tag.toLowerCase(), tag])).values()]),
    coverImage: safeUrl,
    coverAlt: z.string().trim().max(240),
    status: z.enum(["draft", "published", "scheduled"]),
    publishedAt: z.string().datetime({ offset: true }).nullable(),
    seoTitle: z.string().trim().max(70),
    seoDescription: z.string().trim().max(180),
    canonicalUrl: canonical,
    noindex: z.boolean(),
  })
  .strict()
  .superRefine((post, ctx) => {
    if (post.coverImage && !post.coverAlt)
      ctx.addIssue({ code: "custom", path: ["coverAlt"], message: "Describe the cover image" });
    if (
      post.status === "scheduled" &&
      (!post.publishedAt || Date.parse(post.publishedAt) <= Date.now())
    )
      ctx.addIssue({
        code: "custom",
        path: ["publishedAt"],
        message: "Scheduled posts need a future publication date",
      });
    if (/<\/?(?:script|iframe|style|object|embed)\b/i.test(post.body))
      ctx.addIssue({
        code: "custom",
        path: ["body"],
        message: "Use Markdown without executable HTML",
      });
  });
export const updatePostSchema = z
  .object({ version: z.number().int().positive(), post: blogPostSchema })
  .strict();
export const inquirySchema = z
  .object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().email().max(254),
    phone: z.string().trim().max(40).optional().default(""),
    message: z.string().trim().min(10).max(4000),
    propertyId: z.string().max(100).optional().default(""),
    consent: z.literal(true),
    website: z.string().max(200).optional().default(""),
    idempotencyKey: z.string().uuid().optional(),
  })
  .strict();
