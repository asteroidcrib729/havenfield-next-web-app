const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const parsedUrl = new URL(configuredUrl);
if (!['http:', 'https:'].includes(parsedUrl.protocol)) throw new Error('NEXT_PUBLIC_SITE_URL must use HTTP or HTTPS.');
export const site = { name: "Havenfield", url: parsedUrl.origin, description: "Thoughtfully imagined homes. A fictional property collection and journal about architecture, place, and a slower way of living.", tagline: "Room for a different rhythm." };
export function absoluteUrl(path = "/") { return new URL(path, site.url).toString(); }
