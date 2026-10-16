import { checkMutationOrigin } from "../../../server/auth";
import { apiError, json, readJson } from "../../../server/http";
import { createInquiry } from "../../../server/inquiries";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    checkMutationOrigin(request);
    return json(await createInquiry(request, await readJson(request, 8192)), 201);
  } catch (error) {
    return apiError(error);
  }
}
