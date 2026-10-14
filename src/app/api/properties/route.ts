import { properties } from "../../../content/properties";
import { json } from "../../../server/http";
export const runtime="nodejs";
export async function GET(request:Request){
  const params=new URL(request.url).searchParams;
  const query=(params.get("query")||"").trim().toLowerCase().slice(0,200);
  const type=params.get("type");
  const region=params.get("region");
  const results=properties.filter((property)=>(!query || JSON.stringify(property).toLowerCase().includes(query))&&(!type||property.type===type)&&(!region||property.region===region));
  return json({properties:results,total:results.length});
}
