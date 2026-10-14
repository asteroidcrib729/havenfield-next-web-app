import {NextRequest,NextResponse} from "next/server";
export function proxy(request:NextRequest){
  const isDevelopment=process.env.NODE_ENV==="development";
  const requestId=crypto.randomUUID();const nonce=Buffer.from(crypto.randomUUID()).toString("base64");
  const incoming=new Headers(request.headers);incoming.set("x-request-id",requestId);
  const page=!request.nextUrl.pathname.startsWith("/api/");
  const csp=["default-src 'self'",`script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDevelopment?" 'unsafe-eval'":""}`,`style-src 'self' ${isDevelopment?"'unsafe-inline'":`'nonce-${nonce}'`}`,"style-src-attr 'unsafe-inline'","img-src 'self' data: blob: https:","font-src 'self'","media-src 'self'","connect-src 'self'"+(isDevelopment?" ws: wss:":""),"object-src 'none'","base-uri 'self'","form-action 'self'","frame-ancestors 'none'",...(process.env.VERCEL?["upgrade-insecure-requests"]:[])].join("; ");
  if(page){incoming.set("x-nonce",nonce);incoming.set("Content-Security-Policy",csp);}
  const response=NextResponse.next({request:{headers:incoming}});response.headers.set("X-Request-ID",requestId);
  if(page)response.headers.set("Content-Security-Policy",csp);
  if(request.nextUrl.pathname.startsWith("/admin")||process.env.VERCEL_ENV==="preview"||process.env.APP_ENV==="preview")response.headers.set("X-Robots-Tag","noindex, nofollow");
  if(process.env.VERCEL)response.headers.set("Strict-Transport-Security","max-age=31536000; includeSubDomains");
  return response;
}
export const config={matcher:["/((?!_next/static|_next/image|media/|fonts/|brand/|favicon.ico|icon.png|apple-icon.png).*)"]};
