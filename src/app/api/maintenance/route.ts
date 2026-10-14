import {timingSafeEqual} from "node:crypto";
import {purgeExpiredInquiries} from "@/server/inquiries";
import {json,apiError} from "@/server/http";
export const runtime="nodejs";
export async function GET(request:Request){const secret=process.env.CRON_SECRET;if(!secret||secret.length<32)return json({error:"Maintenance is not configured"},503);const actual=Buffer.from(request.headers.get("authorization")||"");const expected=Buffer.from(`Bearer ${secret}`);if(actual.length!==expected.length||!timingSafeEqual(actual,expected))return json({error:"Unauthorized"},401);try{return json({deleted:await purgeExpiredInquiries("maintenance")});}catch(error){return apiError(error);}}
