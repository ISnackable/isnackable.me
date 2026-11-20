import { imageFragment } from "../queries/fragments";

export const moduleAttributesProjection = "attributes{ uid, hidden }";

export const visualModuleProjection = `
  _type == "calloutModule" => { title, tone, body[]{ _key, _type, style, listItem, level, children, markDefs }, ${moduleAttributesProjection} },
  _type == "galleryModule" => { title, columns, images[]{ _key, ${imageFragment}, crop, hotspot, caption }, ${moduleAttributesProjection} },
  _type == "quoteModule" => { quote, attribution, sourceLabel, sourceUrl, ${moduleAttributesProjection} },
  _type == "accordionModule" => { title, items[]{ _key, title, body[]{ _key, _type, style, listItem, level, children, markDefs }, open }, ${moduleAttributesProjection} }
`;

/** Text visible to readers, including module leaves, with hidden modules excluded. */
export const articleTextProjection = `array::join([
  coalesce(pt::text(content[attributes.hidden != true]), ""),
  coalesce(array::join(content[attributes.hidden != true && _type in ["calloutModule", "galleryModule", "accordionModule"] && defined(title)].title, " "), ""),
  coalesce(pt::text(content[attributes.hidden != true && _type == "calloutModule"].body[]), ""),
  coalesce(array::join(content[attributes.hidden != true && _type == "quoteModule" && defined(quote)].quote, " "), ""),
  coalesce(array::join(content[attributes.hidden != true && _type == "quoteModule" && defined(attribution)].attribution, " "), ""),
  coalesce(array::join(content[attributes.hidden != true && _type == "quoteModule" && defined(sourceLabel)].sourceLabel, " "), ""),
  coalesce(array::join(content[attributes.hidden != true && _type == "galleryModule"].images[defined(caption)].caption, " "), ""),
  coalesce(array::join(content[attributes.hidden != true && _type == "accordionModule"].items[defined(title)].title, " "), ""),
  coalesce(pt::text(content[attributes.hidden != true && _type == "accordionModule"].items[].body[]), "")
], " ")`;
