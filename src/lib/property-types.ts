export type PropertyImage = { url: string; alt: string; focalX: number; focalY: number };
export type PropertyStory = { title: string; text: string };
export type Property = {
  id: string;
  slug: string;
  name: string;
  location: string;
  region: string;
  type: "Villa" | "Residence" | "Loft";
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  image: string;
  gallery: string[];
  description: string;
  features: string[];
  imageAlt?: string;
  focalX?: number;
  focalY?: number;
  galleryItems?: PropertyImage[];
  stories?: PropertyStory[];
  relatedStories?: string[];
};
export type PropertyInput = Omit<
  Property,
  | "id"
  | "image"
  | "gallery"
  | "imageAlt"
  | "focalX"
  | "focalY"
  | "galleryItems"
  | "stories"
  | "relatedStories"
> & {
  galleryItems: PropertyImage[];
  stories: PropertyStory[];
  relatedStories: string[];
  status: "draft" | "published";
};
export type ManagedProperty = PropertyInput & {
  id: string;
  version: number;
  createdAt: string;
  updatedAt: string;
};
export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}
export function propertySummary(property: Property): Property {
  const { stories, relatedStories, ...summary } = property;
  void stories;
  void relatedStories;
  return {
    ...summary,
    gallery: [property.image],
    galleryItems: property.galleryItems?.slice(0, 1),
  };
}
