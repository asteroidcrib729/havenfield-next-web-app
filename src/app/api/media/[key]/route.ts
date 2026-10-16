import { getLocalImage } from "../../../../server/media";
export const runtime = "nodejs";
export async function GET(_request: Request, context: { params: Promise<{ key: string }> }) {
  const bytes = await getLocalImage((await context.params).key);
  if (!bytes) return new Response(null, { status: 404 });
  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": "image/webp",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "public,max-age=31536000,immutable",
    },
  });
}
