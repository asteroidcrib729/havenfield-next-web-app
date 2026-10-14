import {requireAdminSession} from "@/server/auth";
import {getDatabase} from "@/server/database";
import {apiError,json} from "@/server/http";
export const runtime="nodejs";
export async function GET(){try{await requireAdminSession();const rows=await(await getDatabase()).query("SELECT DISTINCT category,tags FROM posts");return json({categories:[...new Set(rows.map(row=>String(row.category)))].sort(),tags:[...new Set(rows.flatMap(row=>JSON.parse(String(row.tags)) as string[]))].sort()});}catch(error){return apiError(error);}}
