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

export interface MainImage {
  _type: string;
  alt: string;
  asset: Asset;
  caption?: string;
}

export interface Asset {
  _ref: string;
  _type: string;
}
