import { z } from "zod";
import { checkMutationOrigin, login, setSessionCookie } from "../../../../server/auth";
import { apiError, json, readJson } from "../../../../server/http";
export const runtime="nodejs";
const schema=z.object({email:z.string().trim().email().max(254),password:z.string().min(1).max(256)}).strict();
export async function POST(request: Request) {try {checkMutationOrigin(request);const input=schema.parse(await readJson(request,4096));await setSessionCookie(await login(request,input.email,input.password));return json({authenticated:true,email:input.email.toLowerCase()});}catch(error){return apiError(error);}}
