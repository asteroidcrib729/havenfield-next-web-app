import { requireAdminSession } from "../../../../../../server/auth";
import { getPostRevisions } from "../../../../../../server/blog";
import { apiError, json } from "../../../../../../server/http";
export const runtime = "nodejs";
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminSession();
    return json({ revisions: await getPostRevisions((await context.params).id) });
  } catch (error) {
    return apiError(error);
  }
}
