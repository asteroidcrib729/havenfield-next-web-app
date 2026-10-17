export interface MediaItem {
  id: string;
  url: string;
  objectKey: string;
  storage: "local" | "blob" | "repository";
  width: number;
  height: number;
  bytes: number;
  alt: string;
  owner: string;
  createdAt: string;
  state: "uploading" | "active" | "deleting" | "deleted";
  references: number;
  collection: string;
  focalX: number;
  focalY: number;
  version: number;
  cleanupEligible: boolean;
}
export interface MediaList {
  items: MediaItem[];
  total: number;
  page: number;
  limit: number;
  collections: string[];
}
