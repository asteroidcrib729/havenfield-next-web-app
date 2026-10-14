import { NextResponse } from "next/server";
import { getPublishedPostBySlug, getSlugRedirect } from "../../../../server/blog";
import { AppError } from "../../../../server/errors";
import { apiError, json } from "../../../../server/http";
export const runtime="nodejs";
export async function GET(request:Request,context:{params:Promise<{slug:string}>}){try{const {slug}=await context.params;const post=await getPublishedPostBySlug(slug);if(post)return json({post});const target=await getSlugRedirect(slug);if(target)return NextResponse.redirect(new URL(`/api/posts/${encodeURIComponent(target)}`,request.url),308);throw new AppError(404,"not_found","Article not found");}catch(error){return apiError(error);}}
