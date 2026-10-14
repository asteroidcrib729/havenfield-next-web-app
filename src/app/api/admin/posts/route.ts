import { blogPostSchema } from "../../../../lib/blog-schema";
import { checkMutationOrigin, requireAdminSession } from "../../../../server/auth";
import { createPost, getAdminPosts } from "../../../../server/blog";
import { apiError, json, readJson } from "../../../../server/http";
import { parsePostListQuery } from "../../../../server/post-query";
export const runtime="nodejs";
export async function GET(request:Request){try{await requireAdminSession();return json(await getAdminPosts(parsePostListQuery(request,true)));}catch(error){return apiError(error);}}
export async function POST(request:Request){try{const session=await requireAdminSession();checkMutationOrigin(request);return json({post:await createPost(blogPostSchema.parse(await readJson(request)),session.email)},201);}catch(error){return apiError(error);}}
