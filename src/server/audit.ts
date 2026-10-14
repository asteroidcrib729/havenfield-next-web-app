import { randomUUID } from "node:crypto";
import type { Database } from "./database";
export async function recordAction(db:Database,action:string,target:string,actor="system"){
  await db.execute("INSERT INTO publisher_actions(id,actor,action,target,created_at) VALUES(?,?,?,?,?)",[randomUUID(),actor,action,target,new Date().toISOString()]);
}
