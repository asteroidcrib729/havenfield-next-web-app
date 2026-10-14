import { AppError } from "./errors";
export type DeploymentEnvironment = "development" | "preview" | "production";
type Values = Record<string, string | undefined>;
function origin(value: string | undefined, required: boolean): string | undefined {
  if (!value) { if(required) throw new AppError(503,"configuration","The canonical site origin is not configured"); return; }
  try { const url=new URL(value); if(!["http:","https:"].includes(url.protocol)||url.username||url.password||url.pathname!=="/"||url.search||url.hash||required&&(url.protocol!=="https:"||["localhost","127.0.0.1","[::1]"].includes(url.hostname)))throw new Error();return url.origin; }
  catch {throw new AppError(503,"configuration","Configure a valid site origin without credentials, paths or query parameters");}
}
export function serverEnvironment(values: Values = process.env) {
  const mode=values.VERCEL_ENV||values.APP_ENV||"development";
  if(!["development","preview","production"].includes(mode))throw new AppError(503,"configuration","APP_ENV must be development, preview or production");
  const environment=mode as DeploymentEnvironment;const hosted=Boolean(values.VERCEL)||environment!=="development";
  const canonical=origin(values.NEXT_PUBLIC_SITE_URL,hosted);
  const mutationOrigin=origin(values.SITE_URL||(environment==="preview"&&values.VERCEL_URL?`https://${values.VERCEL_URL}`:environment==="production"?canonical:undefined),hosted);
  const secret=values.SESSION_SECRET;
  if(hosted&&(!secret||secret.length<32||secret==="local-development-rate-limit"))throw new AppError(503,"configuration","A private session secret of at least 32 characters is required for hosted operation");
  const email=values.ADMIN_EMAIL?.trim().toLowerCase();const passwordHash=values.ADMIN_PASSWORD_HASH;
  const authReady=Boolean(email&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)&&passwordHash&&/^scrypt:[a-f0-9]{64}:[a-f0-9]{128}$/.test(passwordHash)&&secret&&secret.length>=32);
  return {environment,hosted,canonical,mutationOrigin,secret,email,passwordHash,authReady,databaseUrl:values.DATABASE_URL,blobToken:values.BLOB_READ_WRITE_TOKEN,retentionDays:30,orphanGraceDays:7};
}
export function configurationSummary(){try{const env=serverEnvironment();return {environment:env.environment,canonical:!!env.canonical,database:!!env.databaseUrl||!env.hosted,publisher:env.authReady,media:!!env.blobToken||!env.hosted,retentionDays:env.retentionDays};}catch{return {environment:"invalid",canonical:false,database:false,publisher:false,media:false,retentionDays:30};}}
