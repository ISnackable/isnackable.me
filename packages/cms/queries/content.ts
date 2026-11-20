import { visualModuleProjection } from "../modules/query";
import { imageFragment } from "./fragments";

export const contentFragment = `
  content[attributes.hidden != true]{
    _key, _type,
    _type == "block" => { style, listItem, level, children, markDefs },
    _type == "code" => { code, language, filename },
    _type == "image" => {
      ${imageFragment}, crop, hotspot, caption
    },
    ${visualModuleProjection}
  }
`;
