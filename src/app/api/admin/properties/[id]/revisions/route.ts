import { requireAdminSession } from "@/server/auth";
import { propertyRevisions } from "@/server/properties";
import { json, apiError } from "@/server/http";
export const runtime = "nodejs";
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminSession();
    return json({ revisions: await propertyRevisions((await context.params).id) });
  } catch (error) {
    return apiError(error);
  }
}
