import { IGatsbyImageData } from "gatsby-plugin-image";

export interface AllSanityPost {
  edges: Edge[];
}

export interface Edge {
  node: Node;
}

export interface Node {
  id: string;
  publishedAt: string;
  mainImage: MainImage;
  title: string;
  slug: Slug;
  description: string;
  categories: Categories[];
}

export interface MainImage {
  asset: Asset;
  alt?: string;
}

export interface Asset {
  gatsbyImageData: IGatsbyImageData;
}

export interface Slug {
  current: string;
}

export interface Categories {
  title: string;
}
