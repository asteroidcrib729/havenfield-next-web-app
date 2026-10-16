import { requireAdminSession } from "@/server/auth";
import { systemSummary } from "@/server/system";
import { apiError, json } from "@/server/http";
export const runtime = "nodejs";
export async function GET() {
  try {
    await requireAdminSession();
    return json(await systemSummary());
  } catch (error) {
    return apiError(error);
  }
}
