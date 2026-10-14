import {readiness} from "@/server/system";
import {json} from "@/server/http";
export const runtime="nodejs";
export async function GET(){let timeout:ReturnType<typeof setTimeout>|undefined;try{await Promise.race([readiness(),new Promise((_,reject)=>{timeout=setTimeout(()=>reject(new Error("timeout")),2000);})]);return json({status:"ok"});}catch{return json({status:"unavailable"},503);}finally{clearTimeout(timeout);}}
