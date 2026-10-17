import type { Property } from "@/lib/property-types";
type Room = { label: string; x: number; y: number; w: number; h: number; outdoor?: boolean };
type Plan = { name: string; bedrooms: number; bathrooms: number; area: number; rooms: Room[] };
export const floorPlans: Record<string, Plan> = {
  "hf-01": {
    name: "The Courtyard House",
    bedrooms: 4,
    bathrooms: 3,
    area: 286,
    rooms: [
      { label: "Bedroom 1", x: 0, y: 0, w: 150, h: 110 },
      { label: "Bedroom 2", x: 150, y: 0, w: 150, h: 110 },
      { label: "Bedroom 3", x: 300, y: 0, w: 150, h: 110 },
      { label: "Bedroom 4", x: 450, y: 0, w: 150, h: 110 },
      { label: "Living", x: 0, y: 110, w: 180, h: 180 },
      { label: "Courtyard", x: 180, y: 110, w: 240, h: 180, outdoor: true },
      { label: "Kitchen", x: 420, y: 110, w: 180, h: 180 },
      { label: "Study", x: 0, y: 290, w: 180, h: 110 },
      { label: "Entry / dining", x: 180, y: 290, w: 240, h: 110 },
      { label: "Bathrooms (3)", x: 420, y: 290, w: 180, h: 110 },
    ],
  },
  "hf-02": {
    name: "Saltwater Residence",
    bedrooms: 3,
    bathrooms: 2,
    area: 194,
    rooms: [
      { label: "View terrace", x: 0, y: 0, w: 600, h: 90, outdoor: true },
      { label: "Living / dining", x: 0, y: 90, w: 360, h: 170 },
      { label: "Kitchen", x: 360, y: 90, w: 240, h: 170 },
      { label: "Bedroom 1", x: 0, y: 260, w: 150, h: 140 },
      { label: "Bedroom 2", x: 150, y: 260, w: 150, h: 140 },
      { label: "Bedroom 3", x: 300, y: 260, w: 150, h: 140 },
      { label: "Baths (2) / entry", x: 450, y: 260, w: 150, h: 140 },
    ],
  },
  "hf-03": {
    name: "Woodland Pavilion",
    bedrooms: 3,
    bathrooms: 3,
    area: 238,
    rooms: [
      { label: "Woodland deck", x: 0, y: 0, w: 600, h: 90, outdoor: true },
      { label: "Living / reading", x: 0, y: 90, w: 300, h: 160 },
      { label: "Kitchen / dining", x: 300, y: 90, w: 300, h: 160 },
      { label: "Bedroom 1", x: 0, y: 250, w: 150, h: 150 },
      { label: "Bedroom 2", x: 150, y: 250, w: 150, h: 150 },
      { label: "Bedroom 3", x: 300, y: 250, w: 150, h: 150 },
      { label: "Baths (3) / utility", x: 450, y: 250, w: 150, h: 150 },
    ],
  },
  "hf-04": {
    name: "Atelier Loft",
    bedrooms: 2,
    bathrooms: 2,
    area: 142,
    rooms: [
      { label: "Living / studio", x: 0, y: 0, w: 360, h: 230 },
      { label: "Kitchen / dining", x: 360, y: 0, w: 240, h: 230 },
      { label: "Bedroom 1", x: 0, y: 230, w: 200, h: 170 },
      { label: "Bedroom 2", x: 200, y: 230, w: 200, h: 170 },
      { label: "Baths (2) / entry", x: 400, y: 230, w: 200, h: 170 },
    ],
  },
};
export function matchingFloorPlan(property: Property) {
  const plan = floorPlans[property.id];
  return plan &&
    plan.name === property.name &&
    plan.bedrooms === property.bedrooms &&
    plan.bathrooms === property.bathrooms &&
    plan.area === property.area
    ? plan
    : null;
}
