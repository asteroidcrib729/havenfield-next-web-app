import { checkMutationOrigin, clientAddress, rateLimit, requireAdminSession } from "../../../../server/auth";
import { apiError, json } from "../../../../server/http";
import { normalizeImage, readUpload, storeImage } from "../../../../server/media";
export const runtime="nodejs";
import {listMedia} from "@/server/media-registry";
import {z} from "zod";
export async function GET(request:Request){try{await requireAdminSession();const params=new URL(request.url).searchParams;const input=z.object({query:z.string().max(200),page:z.coerce.number().int().min(1).max(10_000),unused:z.boolean()}).parse({query:params.get("query")||"",page:params.get("page")||1,unused:params.get("unused")==="true"});return json(await listMedia(input));}catch(error){return apiError(error);}}
export async function POST(request:Request){try{const session=await requireAdminSession();checkMutationOrigin(request);await rateLimit(`media:${clientAddress(request)}`,20,60*60_000);const {bytes,alt}=await readUpload(request);return json({url:await storeImage(await normalizeImage(bytes),alt,session.email),alt},201);}catch(error){return apiError(error);}}
