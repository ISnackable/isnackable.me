import { defineQuery } from "next-sanity";
import {
  moduleAttributesProjection,
  visualModuleProjection,
} from "../modules/query";
import { imageFragment } from "./fragments";

export const PAGE_QUERY = defineQuery(`
  *[_type == "page" && route == $route && language == $locale] | order(_createdAt asc, _id asc)[0]{
    _id, _type, route, language, 
    "title": select(route != "home" => title),
    "description": select(route != "home" => description),
    "seo": {
      "title": coalesce(seo.title, select(route != "home" => title), ""),
      "description": coalesce(seo.description, select(route != "home" => description), ""),
      "image": seo.image { ${imageFragment} },
      "noIndex": seo.noIndex == true
    },
    sections[attributes.hidden != true]{
      _key, _type, ${moduleAttributesProjection},
      ${visualModuleProjection},
      _type == "heroSection" => {
        displayName, tagline,
        nameGraphic { viewBox, paths },
        terminalUser, terminalInterests,
        featureImage { ${imageFragment} },
        sticker { ${imageFragment} },
        badge {
          displayName,
          portrait { ${imageFragment}, crop, hotspot },
          status, pass, handle, summary, details, backTitle, backSubtitle, backDescription
        },
        gallery[]{ _key, ${imageFragment}, crop, hotspot, caption },
        galleryCaption,
        folderLabel,
        "folderItems": folderItems[]{
          "_key": coalesce(_key, _ref),
          "document": @->{
            _type, language, title, "slug": slug.current,
            "summary": select(_type == "project" => summary, description)
          }
        }[document._type in ["project", "post"] && document.language == $locale && defined(document.slug)][0...3]{
          _key, document{ _type, title, slug, summary }
        },
        tracks[]{ _key, title, artist, url, cover { ${imageFragment} } }
      },
      _type == "aboutSection" => {
        headline, biography,
        interests[]{ _key, area, title, description,
          image { ${imageFragment}, crop, hotspot, caption }
        }
      },
      _type == "projectsSection" => { title, description, limit },
      _type == "writingSection" => { title, description, limit }
    }
  }
`);
