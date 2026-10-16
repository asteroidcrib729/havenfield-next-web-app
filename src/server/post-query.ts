import { z } from "zod";
import type { ListOptions } from "./blog";
const listSchema = z.object({
  page: z.coerce.number().int().min(1).max(10000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
  query: z.string().max(200).optional(),
  category: z.string().max(80).optional(),
  tag: z.string().max(40).optional(),
  status: z.enum(["draft", "published", "scheduled"]).optional(),
});
export function parsePostListQuery(request: Request, admin = false): ListOptions {
  const values = Object.fromEntries(new URL(request.url).searchParams);
  for (const key of ["page", "limit", "query", "category", "tag", "status"])
    if (values[key] === "") delete values[key];
  const result = listSchema.parse(values);
  if (!admin) delete result.status;
  return result;
}
