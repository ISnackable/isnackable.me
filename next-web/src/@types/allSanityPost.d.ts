export interface AllSanityPost {
  _id: string;
  description: string;
  mainImage: MainImage;
  publishedAt: string;
  slug: string;
  title: string;
  categories: Categories[];
}

export interface MainImage {
  _type: string;
  alt: string;
  asset: Asset;
  crop?: Crop;
  hotspot?: Hotspot;
  caption?: string;
}

export interface Asset {
  _ref: string;
  _type: string;
}

export interface Crop {
  _type: string;
  bottom: number;
  left: number;
  right: number;
  top: number;
}

export interface Hotspot {
  _type: string;
  height: number;
  width: number;
  x: number;
  y: number;
}
export interface Categories {
  title: string;
}
