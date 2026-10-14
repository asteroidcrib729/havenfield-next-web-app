import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";
export const dynamic="force-dynamic";
export default function robots(): MetadataRoute.Robots { return { rules: { userAgent: "*", ...(process.env.VERCEL_ENV==="preview"||process.env.APP_ENV==="preview"?{disallow:"/"}:{allow:"/",disallow:["/admin","/api/"]}) }, sitemap: absoluteUrl("/sitemap.xml") }; }
