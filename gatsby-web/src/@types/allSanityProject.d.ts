import { IGatsbyImageData } from "gatsby-plugin-image";

export interface AllSanityProject {
  edges: Edge[];
}

export interface Edge {
  node: Node;
}

export interface Node {
  id: string;
  mainImage: MainImage;
  title: string;
  description: string;
  projectUrl: string;
}

export interface MainImage {
  asset: Asset;
  alt?: string;
}

export interface Asset {
  gatsbyImageData: IGatsbyImageData;
}
