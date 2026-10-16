export type PostStatus = "draft" | "published" | "scheduled";

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  author: string;
  category: string;
  tags: string[];
  coverImage: string;
  coverAlt: string;
  status: PostStatus;
  publishedAt: string | null;
  seoTitle: string;
  seoDescription: string;
  canonicalUrl: string;
  noindex: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export type BlogPostInput = Omit<BlogPost, "id" | "version" | "createdAt" | "updatedAt">;
export interface BlogRevision {
  id: string;
  postId: string;
  version: number;
  createdAt: string;
  snapshot: BlogPost;
}
export interface PostList {
  posts: BlogPost[];
  total: number;
  page: number;
  limit: number;
}
