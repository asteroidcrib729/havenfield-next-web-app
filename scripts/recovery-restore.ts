import "./database-env";
import {mkdir,readdir,writeFile,lstat} from "node:fs/promises";
import {resolve} from "node:path";
import {remapRecoveryMedia} from "../src/server/recovery-media";
import {createDatabase} from "../src/server/database";
import {restoreDatabase,checkRestoreTarget} from "../src/server/backup";
import {readRecoveryBundle} from "../src/server/recovery-bundle";
const input=process.argv[2];if(!input||Boolean(process.env.RESTORE_DATABASE_URL)===Boolean(process.env.RESTORE_SQLITE_PATH))throw new Error("Specify a recovery bundle and exactly one dedicated empty restore database");
if(!process.env.RESTORE_UPLOAD_DIR)throw new Error("Configure an explicit empty RESTORE_UPLOAD_DIR for staged recovery objects");
const directory=resolve(process.env.RESTORE_UPLOAD_DIR);await mkdir(directory,{recursive:true});if((await lstat(directory)).isSymbolicLink()||(await readdir(directory)).length)throw new Error("Recovery object staging directory must be empty and not a symbolic link");
const bundle=await readRecoveryBundle(input);let backup=bundle.backup;const objects=bundle.objects;
const db=await createDatabase({url:process.env.RESTORE_DATABASE_URL||"",sqlitePath:process.env.RESTORE_SQLITE_PATH,autoMigrate:false,verifyEnvironment:false});
try {
await checkRestoreTarget(db,backup);
const media=backup.payload.tables.media.filter(item=>item.state==="active");
const replacements=new Map<string,{url:string;objectKey:string}>();
if((media.some(item=>item.storage==="blob")||["preview","production"].includes(process.env.RESTORE_APP_ENV||""))&&!process.env.RESTORE_BLOB_READ_WRITE_TOKEN)throw new Error("Hosted media restoration requires an independent Blob store token");
for(const item of media){const file=`${item.id}.webp`;await writeFile(resolve(directory,file),objects.get(String(item.id))!,{flag:"wx",mode:0o600});if(process.env.RESTORE_BLOB_READ_WRITE_TOKEN){if(!process.env.RESTORE_BLOB_READ_WRITE_TOKEN||!process.env.RESTORE_APP_ENV||!["development","preview","production"].includes(process.env.RESTORE_APP_ENV))throw new Error("Blob recovery needs an independent restore store token and explicit environment");const {put}=await import("@vercel/blob");const key=`journal/${process.env.RESTORE_APP_ENV}/${file}`;const result=await put(key,objects.get(String(item.id))!,{token:process.env.RESTORE_BLOB_READ_WRITE_TOKEN,access:"public",addRandomSuffix:false,allowOverwrite:false,contentType:"image/webp"});replacements.set(String(item.id),{url:result.url,objectKey:key});}}
if(replacements.size)backup=remapRecoveryMedia(backup,replacements);
await restoreDatabase(db,backup);console.log("Restored database and verified media objects. Bind the target database, set LOCAL_UPLOAD_DIR for local recovery, and complete smoke checks before switching traffic.");}finally{await db.close();}
