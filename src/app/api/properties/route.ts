import { getPublicProperties } from "@/server/properties";
import { apiError } from "@/server/http";
import { json } from "../../../server/http";
export const runtime = "nodejs";
export async function GET(request: Request) {
  try {
    const properties = await getPublicProperties();
    const params = new URL(request.url).searchParams;
    const query = (params.get("query") || "").trim().toLowerCase().slice(0, 200);
    const type = params.get("type");
    const region = params.get("region");
    const results = properties
      .map((home) => {
        const { relatedStories, ...publicHome } = home;
        void relatedStories;
        return publicHome;
      })
      .filter(
        (property) =>
          (!query || JSON.stringify(property).toLowerCase().includes(query)) &&
          (!type || property.type === type) &&
          (!region || property.region === region),
      );
    return json({
      properties: results,
      total: results.length,
    });
  } catch (error) {
    return apiError(error);
  }
}
