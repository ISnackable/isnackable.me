import { defineQuery } from "next-sanity";
import { imageFragment } from "./fragments";

export const SETTINGS_QUERY = defineQuery(`
  *[_type == "settings" && _id == "settings"][0]{
    title, description, authorName, authorUrl, publisher, twitterHandle,
    githubUrl, linkedinUrl,
    ogImage { ${imageFragment} }
  }
`);
