import { SanityImageObject } from "@sanity/image-url/lib/types/types";

export interface AllSanityPost {
  _id: string;
  categories: Category[] | null;
  description: string;
  mainImage: MainImage;
  publishedAt: string;
  slug: string;
  title: string;
}
export interface Category {
  title: string;
}

export interface MainImage extends SanityImageObject {
  alt: string;
  caption?: string;
  lqip?: string;
}
