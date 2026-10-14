import { z } from "zod";
import { updatePostSchema } from "../../../../../lib/blog-schema";
import { checkMutationOrigin, requireAdminSession } from "../../../../../server/auth";
import { deletePost, getAdminPost, updatePost } from "../../../../../server/blog";
import { AppError } from "../../../../../server/errors";
import { apiError, json, readJson } from "../../../../../server/http";
export const runtime="nodejs";
type Context={params:Promise<{id:string}>};
export async function GET(_request:Request,context:Context){try{await requireAdminSession();const post=await getAdminPost((await context.params).id);if(!post)throw new AppError(404,"not_found","Article not found");return json({post});}catch(error){return apiError(error);}}
export async function PATCH(request:Request,context:Context){try{const session=await requireAdminSession();checkMutationOrigin(request);const input=updatePostSchema.parse(await readJson(request));return json({post:await updatePost((await context.params).id,input.post,input.version,session.email)});}catch(error){return apiError(error);}}
export async function DELETE(request:Request,context:Context){try{const session=await requireAdminSession();checkMutationOrigin(request);const {version}=z.object({version:z.number().int().positive()}).strict().parse(await readJson(request,4096));await deletePost((await context.params).id,version,session.email);return json({deleted:true});}catch(error){return apiError(error);}}
