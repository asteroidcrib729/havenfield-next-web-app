import { getAdminSession } from "../../../../server/auth";
import { apiError, json } from "../../../../server/http";
export const runtime="nodejs";
export async function GET(){try{const session=await getAdminSession();return json(session?{authenticated:true,email:session.email}:{authenticated:false});}catch(error){return apiError(error);}}
