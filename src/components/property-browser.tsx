"use client";

import { useMemo } from "react";
import { HomeChoiceLinks } from "./home-actions";
import { useSearchParams } from "next/navigation";
import { propertyFilters } from "@/lib/property-filters";
import { Search, SlidersHorizontal } from "lucide-react";
import type { Property } from "@/lib/property-types";
import { PropertyCard } from "@/components/property-card";

export function PropertyBrowser({ properties }: { properties: Property[] }) {
  const params = useSearchParams();
  const { query, region, type, price, bedrooms, sort } = propertyFilters(
    new URLSearchParams(params.toString()),
    properties.map((home) => home.region),
  );
  function change(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value && (key !== "sort" || value !== "featured")) next.set(key, value);
    else next.delete(key);
    window.history.replaceState(null, "", next.size ? `/properties?${next}` : "/properties");
  }
  const setQuery = (value: string) => change("query", value),
    setRegion = (value: string) => change("region", value),
    setType = (value: string) => change("type", value),
    setPrice = (value: string) => change("price", value),
    setBedrooms = (value: string) => change("bedrooms", value),
    setSort = (value: string) => change("sort", value);
  const results = useMemo(() => {
    const selected = properties.filter(
      (property) =>
        `${property.name} ${property.location} ${property.description}`
          .toLowerCase()
          .includes(query.toLowerCase()) &&
        (!region || property.region === region) &&
        (!type || property.type === type) &&
        (!price || property.price <= Number(price)) &&
        (!bedrooms || property.bedrooms >= Number(bedrooms)),
    );
    if (sort === "price-low") selected.sort((a, b) => a.price - b.price);
    if (sort === "price-high") selected.sort((a, b) => b.price - a.price);
    if (sort === "space") selected.sort((a, b) => b.area - a.area);
    return selected;
  }, [query, region, type, price, bedrooms, sort, properties]);
  function reset() {
    window.history.replaceState(null, "", "/properties");
  }
  const field =
    "mt-2 w-full rounded-lg border border-line bg-paper px-3 py-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand";
  return (
    <>
      <HomeChoiceLinks properties={properties} />
      <div className="rounded-2xl border border-line bg-white/50 p-5 sm:p-7">
        <div className="mb-5 flex items-center gap-2 text-sm font-medium">
          <SlidersHorizontal size={17} aria-hidden="true" />
          Find your kind of home
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-xs font-medium">
            Search homes
            <div className="relative">
              <Search className="absolute left-3 top-5 text-muted" size={16} aria-hidden="true" />
              <input
                className={`${field} pl-9`}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Name, location, or detail"
              />
            </div>
          </label>
          <label className="text-xs font-medium">
            Setting
            <select
              className={field}
              value={region}
              onChange={(event) => setRegion(event.target.value)}
            >
              <option value="">Every setting</option>
              {[...new Set(properties.map((property) => property.region))].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label className="text-xs font-medium">
            Home type
            <select
              className={field}
              value={type}
              onChange={(event) => setType(event.target.value)}
            >
              <option value="">Every home type</option>
              <option>Villa</option>
              <option>Residence</option>
              <option>Loft</option>
            </select>
          </label>
          <label className="text-xs font-medium">
            Maximum guide price
            <select
              className={field}
              value={price}
              onChange={(event) => setPrice(event.target.value)}
            >
              <option value="">Any price</option>
              <option value="750000">$750,000</option>
              <option value="1000000">$1,000,000</option>
              <option value="1500000">$1,500,000</option>
              <option value="2000000">$2,000,000</option>
            </select>
          </label>
          <label className="text-xs font-medium">
            Bedrooms
            <select
              className={field}
              value={bedrooms}
              onChange={(event) => setBedrooms(event.target.value)}
            >
              <option value="">Any size</option>
              <option value="2">2 or more</option>
              <option value="3">3 or more</option>
              <option value="4">4 or more</option>
            </select>
          </label>
          <label className="text-xs font-medium">
            Sort by
            <select
              className={field}
              value={sort}
              onChange={(event) => setSort(event.target.value)}
            >
              <option value="featured">Curated order</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
              <option value="space">Most space</option>
            </select>
          </label>
        </div>
      </div>
      <div role="group" aria-label="Active filters" className="mt-5 flex flex-wrap gap-2">
        {[
          ["query", query ? "Search: " + query : ""],
          ["region", region],
          ["type", type],
          ["price", price ? "Up to $" + Number(price).toLocaleString("en-US") : ""],
          ["bedrooms", bedrooms ? bedrooms + "+ bedrooms" : ""],
        ]
          .filter(([, value]) => value)
          .map(([key, label]) => (
            <button
              key={key}
              className="min-h-11 rounded-full border border-line bg-white/70 px-4 py-2 text-xs hover:border-brand"
              aria-label={"Remove filter: " + label}
              onClick={() => change(key, "")}
            >
              {label}
              <span aria-hidden="true" className="ml-3">
                ×
              </span>
            </button>
          ))}
      </div>
      <div className="my-7 flex items-center justify-between gap-4">
        <p className="text-sm text-muted" role="status">
          {results.length} {results.length === 1 ? "home" : "homes"} in this collection
        </p>
        <button onClick={reset} className="text-sm underline underline-offset-4 hover:text-brand">
          Reset filters
        </button>
      </div>
      {results.length ? (
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {results.map((property, index) => (
            <PropertyCard
              key={property.id}
              property={property}
              collectionQuery={params.toString()}
              priority={index === 0}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-line p-12 text-center">
          <h2 className="font-display text-3xl">A little more room to search.</h2>
          <p className="mt-3 text-muted">
            No homes match these filters. Try another setting or a wider price range.
          </p>
          <button className="mt-6 rounded-full bg-ink px-6 py-3 text-sm text-paper" onClick={reset}>
            Show all homes
          </button>
        </div>
      )}
    </>
  );
}
