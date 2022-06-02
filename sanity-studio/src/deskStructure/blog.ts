/**
 * This file is part of the isnackable.me project.
 * Copyright © 2021-2022 isnackable.me. All rights reserved.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import S from "@sanity/desk-tool/structure-builder";

import { EyeOpenIcon, EditIcon } from "@sanity/icons";

// Web preview
import Iframe from "sanity-plugin-iframe-pane";
import resolveProductionUrl from "../resolveProductionUrl";

// Seo preview
import SocialPreview from "part:social-preview/component";

// Web preview configuration
const remoteURL = "https://isnackable.me";
const localURL = "http://localhost:3000";
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
              .component(Iframe)
              .options({
                url: (doc) => resolveProductionUrl(doc),
              })
              .title("Web Preview")
              .icon(EyeOpenIcon),
            S.view
              .component(
                SocialPreview({
                  // Overwrite prepareFunction to pick the right fields
                  prepareFunction: (
                    {
                      title,
                      description,
                      mainImage,
                      slug,
                    } /* this object is the currently active document */
                  ) => ({
                    title,
                    description: description,
                    siteUrl: previewURL,
                    ogImage: mainImage,
                    slug: `/${slug?.current}`,
                  }),
                })
              )
              .title("SEO Preview"),
          ])
      )
  );
