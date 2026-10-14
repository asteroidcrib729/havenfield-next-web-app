import {describe,it,expect} from "vitest";
import {serverEnvironment} from "../src/server/environment";
import {collectionReturn,propertyFilters} from "../src/lib/property-filters";
import {articleHeadings} from "../src/lib/article-headings";
describe("environment capability boundaries",()=>{
  const hosted={APP_ENV:"production",NEXT_PUBLIC_SITE_URL:"https://havenfield.vercel.app",SESSION_SECRET:"x".repeat(48)};
  it("requires a real hosted origin and private secret",()=>{expect(()=>serverEnvironment({APP_ENV:"production"})).toThrow();expect(()=>serverEnvironment({...hosted,SESSION_SECRET:"local-development-rate-limit"})).toThrow();expect(()=>serverEnvironment({...hosted,NEXT_PUBLIC_SITE_URL:"http://localhost:3000"})).toThrow();expect(()=>serverEnvironment({...hosted,NEXT_PUBLIC_SITE_URL:"https://user:password@example.test"})).toThrow();expect(serverEnvironment(hosted).mutationOrigin).toBe("https://havenfield.vercel.app");});
  it("keeps the preview mutation origin separate from production canonicals",()=>{const preview=serverEnvironment({...hosted,APP_ENV:"preview",VERCEL_URL:"havenfield-preview.vercel.app"});expect(preview.canonical).toBe("https://havenfield.vercel.app");expect(preview.mutationOrigin).toBe("https://havenfield-preview.vercel.app");expect(()=>serverEnvironment({...hosted,APP_ENV:"other"})).toThrow();});
  it("bounds and validates collection URLs including hostile return targets",()=>{expect(collectionReturn("https://attacker.test")).toBe("/properties");expect(propertyFilters(new URLSearchParams("region=Woodland&sort=broken&price=-5"))).toMatchObject({region:"Woodland",sort:"featured",price:""});expect(collectionReturn("region=Woodland&sort=space&unexpected=secret")).toBe("/properties?region=Woodland&sort=space");});
  it("deduplicates article anchors and ignores fenced code",()=>{expect(articleHeadings("## Daylight\n\n```md\n## Hidden\n```\n## Daylight\n### A quiet room").map(h=>h.id)).toEqual(["story-daylight","story-daylight-2","story-a-quiet-room"]);});
});
