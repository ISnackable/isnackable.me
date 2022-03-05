import S from "@sanity/desk-tool/structure-builder";

import EyeIcon from "part:@sanity/base/eye-icon";
import EditIcon from "part:@sanity/base/edit-icon";

// Web preview
import IframePreview from "../components/previews/iframe/IframePreview";
import SeoPreview from "../components/previews/seo/SeoPreviews";

// a11y preview
import ColorblindPreview from "../components/previews/a11y/colorblind-filter/ColorblindPreview";

// Web preview configuration
const remoteURL = "https://isnackable.me";
const localURL = "http://localhost:8000";
const previewURL =
  window.location.hostname === "localhost" ? localURL : remoteURL;

export default S.listItem()
  .title("Blog")
  .schemaType("post")
  .child(
    S.documentTypeList("post")
      .title("Blog Post")
      .child((documentId) =>
        S.document()
          .documentId(documentId)
          .schemaType("post")
          .views([
            S.view.form().icon(EditIcon),
            S.view
              .component(IframePreview)
              .options({ previewURL })
              .title("Web Preview")
              .icon(EyeIcon),
            S.view
              .component(SeoPreview)
              .options({ previewURL })
              .icon(EyeIcon)
              .title("SEO Preview"),
            S.view
              .component(ColorblindPreview)
              .options({ previewURL })
              .icon(EyeIcon)
              .title("Colorblind"),
          ])
      )
  );
