import { z } from "zod";
import { requireAdminSession, checkMutationOrigin } from "@/server/auth";
import { listInquiries, purgeExpiredInquiries } from "@/server/inquiries";
import { apiError, json } from "@/server/http";
export const runtime = "nodejs";
export async function GET(request: Request) {
  try {
    await requireAdminSession();
    const params = new URL(request.url).searchParams;
    const input = z
      .object({
        query: z.string().max(200),
        status: z.enum(["new", "reviewed", "archived"]).optional(),
        page: z.coerce.number().int().min(1).max(10_000),
      })
      .parse({
        query: params.get("query") || "",
        status: params.get("status") || undefined,
        page: params.get("page") || 1,
      });
    return json(await listInquiries(input));
  } catch (error) {
    return apiError(error);
  }
}
export async function DELETE(request: Request) {
  try {
    const session = await requireAdminSession();
    checkMutationOrigin(request);
    return json({ deleted: await purgeExpiredInquiries(session.email) });
  } catch (error) {
    return apiError(error);
  }
}
