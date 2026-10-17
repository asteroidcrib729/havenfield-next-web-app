import { requireAdminSession } from "@/server/auth";
import { exportInquiries } from "@/server/inquiries";
import { inquiryFilters } from "@/lib/inquiry-workflow";
import { apiError } from "@/server/http";
export const runtime = "nodejs";
export async function GET(request: Request) {
  try {
    await requireAdminSession();
    const p = new URL(request.url).searchParams;
    const input = inquiryFilters.parse({
      query: p.get("query") || "",
      status: p.get("status") || undefined,
      stage: p.get("stage") || undefined,
      propertyId: p.get("propertyId") || undefined,
    });
    return new Response(await exportInquiries(input), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="havenfield-inquiries.csv"',
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return apiError(error);
  }
}
