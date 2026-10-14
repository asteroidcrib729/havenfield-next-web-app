import { getPublishedPosts } from "../../../server/blog";
import { apiError, json } from "../../../server/http";
import { parsePostListQuery } from "../../../server/post-query";
export const runtime="nodejs";
export async function GET(request:Request){try{return json(await getPublishedPosts(parsePostListQuery(request)));}catch(error){return apiError(error);}}
