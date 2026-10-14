import "./database-env";
import {createDatabase,migrateDatabase} from "../src/server/database";
const environment=process.argv[2];
if(!["development","preview","production"].includes(environment))throw new Error("Specify development, preview or production; an existing different binding cannot be overwritten");
const db=await createDatabase({autoMigrate:false,verifyEnvironment:false});
try{if(db.dialect==="sqlite"&&environment!=="development")throw new Error("Hosted environments require an independent PostgreSQL database");await migrateDatabase(db);await db.transaction(async tx=>{await tx.execute("INSERT INTO app_settings(key,value) VALUES(?,?) ON CONFLICT(key) DO NOTHING",["deployment_environment",environment]);const [binding]=await tx.query("SELECT value FROM app_settings WHERE key=?",["deployment_environment"]);if(binding.value!==environment)throw new Error("This database belongs to a different deployment environment; create an independent database");});console.log(`Database binding verified for ${environment}.`);}finally{await db.close();}
