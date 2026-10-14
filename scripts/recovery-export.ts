import "./database-env";
import {mkdir} from "node:fs/promises";
import {resolve} from "node:path";
import {randomUUID} from "node:crypto";
import {getDatabase,closeDatabase} from "../src/server/database";
import {exportDatabase} from "../src/server/backup";
import {createRecoveryBundle,readOwnedObject} from "../src/server/recovery-bundle";
try{const parent=resolve(process.env.BACKUP_DESTINATION||".data/backups");await mkdir(parent,{recursive:true});const directory=resolve(parent,`havenfield-backup-${new Date().toISOString().replace(/[:.]/g,"-")}-${randomUUID()}`);await createRecoveryBundle(await exportDatabase(await getDatabase()),directory,readOwnedObject);console.log(`Private database and media recovery bundle written to ${directory}. Verify an independent copy and schedule daily exports before release.`);}finally{await closeDatabase();}
