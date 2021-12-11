import { IGatsbyImageData } from "gatsby-plugin-image";

export interface AllSanityNote {
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
