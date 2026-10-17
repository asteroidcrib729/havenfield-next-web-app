import { inquiryFilters } from "@/lib/inquiry-workflow";
import { requireAdminSession, checkMutationOrigin } from "@/server/auth";
import { listInquiries, purgeExpiredInquiries } from "@/server/inquiries";
import { apiError, json } from "@/server/http";
export const runtime = "nodejs";
export async function GET(request: Request) {
  try {
    await requireAdminSession();
    const params = new URL(request.url).searchParams;
    const input = inquiryFilters.parse({
      query: params.get("query") || "",
      status: params.get("status") || undefined,
      stage: params.get("stage") || undefined,
      propertyId: params.get("propertyId") || undefined,
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
