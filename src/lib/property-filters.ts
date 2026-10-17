export function propertyFilters(params: URLSearchParams, regions?: string[]) {
  const choice = (key: string, values: string[], fallback = "") =>
    values.includes(params.get(key) || "") ? params.get(key)! : fallback;
  return {
    query: (params.get("query") || "").slice(0, 200),
    region: regions ? choice("region", regions) : (params.get("region") || "").trim().slice(0, 60),
    type: choice("type", ["Villa", "Residence", "Loft"]),
    price: choice("price", ["750000", "1000000", "1500000", "2000000"]),
    bedrooms: choice("bedrooms", ["2", "3", "4"]),
    sort: choice("sort", ["featured", "price-low", "price-high", "space"], "featured"),
  };
}
export function collectionReturn(value: unknown) {
  if (typeof value !== "string" || value.length > 1500) return "/properties";
  const params = new URLSearchParams(value);
  const result = new URLSearchParams();
  for (const [key, value] of Object.entries(propertyFilters(params)))
    if (value && (key !== "sort" || value !== "featured")) result.set(key, value);
  return `/properties${result.size ? `?${result}` : ""}`;
}
