import { SanityImageObject } from "@sanity/image-url/lib/types/types";

export interface AllSanityProject {
  _id: string;
  mainImage: MainImage;
  title: string;
  description: string;
  projectUrl: string;
}

export interface MainImage extends SanityImageObject {
  alt: string;
  caption?: string;
  lqip?: string;
}
