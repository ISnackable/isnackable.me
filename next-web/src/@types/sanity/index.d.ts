export * from "./allSanityPost";
export * from "./allSanityCategory";
export * from "./allSanityProject";

export interface GenericSanityDocument {
  _id: string;
  type?: string;
  _createdAt?: string;
  _updatedAt?: string;
}
