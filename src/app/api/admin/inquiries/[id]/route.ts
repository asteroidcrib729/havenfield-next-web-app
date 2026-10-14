import {z} from "zod";
import {requireAdminSession,checkMutationOrigin} from "@/server/auth";
import {changeInquiry,deleteInquiry} from "@/server/inquiries";
import {apiError,json,readJson} from "@/server/http";
export const runtime="nodejs";
type Context={params:Promise<{id:string}>};
export async function PATCH(request:Request,context:Context){try{const session=await requireAdminSession();checkMutationOrigin(request);const {status}=z.object({status:z.enum(["new","reviewed","archived"])}).strict().parse(await readJson(request,4096));await changeInquiry((await context.params).id,status,session.email);return json({updated:true});}catch(error){return apiError(error);}}
export async function DELETE(request:Request,context:Context){try{const session=await requireAdminSession();checkMutationOrigin(request);await deleteInquiry((await context.params).id,session.email);return json({deleted:true});}catch(error){return apiError(error);}}
