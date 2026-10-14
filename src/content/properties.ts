export type Property = {
  id: string; slug: string; name: string; location: string; region: string;
  type: "Villa" | "Residence" | "Loft"; price: number; bedrooms: number; bathrooms: number;
  area: number; image: string; gallery: string[]; description: string; features: string[];
};
export const properties: Property[] = [
  { id: "hf-01", slug: "the-courtyard-house", name: "The Courtyard House", location: "Cedar Cove", region: "Coast", type: "Villa", price: 1240000, bedrooms: 4, bathrooms: 3, area: 286,
    image: "/media/courtyard.jpg", gallery: ["/media/courtyard.jpg", "/media/interior.jpg", "/media/coastal.jpg"],
    description: "An imagined limestone home arranged around a quiet, planted courtyard. Deep window reveals hold the afternoon shade; long views connect the living room to a reflecting pool. The plan offers space to gather without giving up places to retreat.",
    features: ["Planted interior courtyard", "Covered outdoor dining", "Dedicated study", "Generous natural light", "Reflecting pool", "Low-water landscape"] },
  { id: "hf-02", slug: "saltwater-residence", name: "Saltwater Residence", location: "Northstrand", region: "Coast", type: "Residence", price: 890000, bedrooms: 3, bathrooms: 2, area: 194,
    image: "/media/coastal.jpg", gallery: ["/media/coastal.jpg", "/media/interior.jpg", "/media/courtyard.jpg"],
    description: "A fictional coastal residence shaped by open horizons. A sheltered terrace extends the living space while textured stone and timber lend warmth to a simple interior. Every room has a useful purpose; the view gets the attention.",
    features: ["Sheltered view terrace", "Open living and dining", "Secure bicycle storage", "Flexible guest room", "Timber finishes", "Walkable coastal setting"] },
  { id: "hf-03", slug: "woodland-pavilion", name: "Woodland Pavilion", location: "Mossmere", region: "Woodland", type: "Villa", price: 1080000, bedrooms: 3, bathrooms: 3, area: 238,
    image: "/media/woodland.jpg", gallery: ["/media/woodland.jpg", "/media/interior.jpg", "/media/courtyard.jpg"],
    description: "An imagined pavilion at the edge of a woodland. A low roof and quiet material palette make room for the landscape, with a reading nook, a generous kitchen and an outdoor room for long evenings. It is a study in keeping the essentials close.",
    features: ["Woodland-facing deck", "Reading nook", "Separate utility room", "Accessible ground-floor plan", "Natural material palette", "Private garden"] },
  { id: "hf-04", slug: "atelier-loft", name: "Atelier Loft", location: "Old Quarter", region: "City", type: "Loft", price: 625000, bedrooms: 2, bathrooms: 2, area: 142,
    image: "/media/interior.jpg", gallery: ["/media/interior.jpg", "/media/coastal.jpg", "/media/woodland.jpg"],
    description: "A fictional city loft for creative everyday life. Tall windows, warm timber and a flexible work area support both focused mornings and relaxed evenings. Carefully placed storage keeps the open plan calm and practical.",
    features: ["Flexible studio workspace", "Tall windows", "Built-in storage", "Shared roof garden", "Bicycle parking", "Walkable neighborhood"] }
];
export function formatPrice(price: number) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(price); }
