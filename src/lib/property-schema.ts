import { z } from "zod";
z.config({ jitless: true });
const slug = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const imageUrl = z
  .string()
  .max(2048)
  .refine(
    (value) =>
      /^\/(?:media|images)\/[a-zA-Z0-9/_-]+\.(?:webp|png|jpe?g|avif)$/.test(value) ||
      /^\/api\/media\/[a-f0-9-]{36}\.webp$/.test(value) ||
      (() => {
        try {
          const u = new URL(value);
          return u.protocol === "https:" && !u.username && !u.password && !u.hash && !u.search;
        } catch {
          return false;
        }
      })(),
    "Choose a repository image or an owned upload",
  );
export const propertyInputSchema = z
  .object({
    slug,
    name: z.string().trim().min(3).max(100),
    location: z.string().trim().min(2).max(100),
    region: z.string().trim().min(2).max(60),
    type: z.enum(["Villa", "Residence", "Loft"]),
    price: z.number().int().min(1).max(1000000000),
    bedrooms: z.number().int().min(0).max(30),
    bathrooms: z.number().int().min(1).max(30),
    area: z.number().int().min(10).max(10000),
    description: z.string().trim().min(30).max(1500),
    features: z.array(z.string().trim().min(2).max(160)).min(1).max(24),
    galleryItems: z
      .array(
        z
          .object({
            url: imageUrl,
            alt: z.string().trim().min(3).max(240),
            focalX: z.number().int().min(0).max(100),
            focalY: z.number().int().min(0).max(100),
          })
          .strict(),
      )
      .min(1)
      .max(12),
    stories: z
      .array(
        z
          .object({
            title: z.string().trim().min(2).max(80),
            text: z.string().trim().min(10).max(5000),
          })
          .strict(),
      )
      .max(8),
    relatedStories: z.array(slug).max(6),
    status: z.enum(["draft", "published"]),
  })
  .strict()
  .superRefine((input, ctx) => {
    if (new Set(input.galleryItems.map((image) => image.url)).size !== input.galleryItems.length)
      ctx.addIssue({
        code: "custom",
        path: ["galleryItems"],
        message: "Use each gallery image once",
      });
  });
export const propertyUpdateSchema = z
  .object({ version: z.number().int().positive(), property: propertyInputSchema })
  .strict();
export const propertyVersionSchema = z.object({ version: z.number().int().positive() }).strict();
export const mediaDetailsSchema = z
  .object({
    alt: z.string().trim().max(240),
    collection: z
      .string()
      .trim()
      .max(60)
      .refine((value) => value !== "__uncollected", "Choose another collection name")
      .optional(),
    focalX: z.number().int().min(0).max(100).optional(),
    focalY: z.number().int().min(0).max(100).optional(),
    version: z.number().int().positive().optional(),
  })
  .strict();
