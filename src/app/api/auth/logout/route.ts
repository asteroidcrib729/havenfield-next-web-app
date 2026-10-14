import { checkMutationOrigin, clearSessionCookie, requireAdminSession } from "../../../../server/auth";
import { apiError, json } from "../../../../server/http";
export const runtime="nodejs";
export async function POST(request: Request) {try{checkMutationOrigin(request);await requireAdminSession();await clearSessionCookie();return json({authenticated:false});}catch(error){return apiError(error);}}
