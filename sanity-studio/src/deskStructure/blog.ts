/**
 * This file is part of the isnackable.me project.
 * Copyright © 2021-2022 isnackable.me. All rights reserved.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import S from "@sanity/desk-tool/structure-builder";
import { env, rootURLs } from "../urlResolver";

import { EyeOpenIcon, EditIcon } from "@sanity/icons";
import {
  GoMegaphone as BlogIcon,
  // GoChecklist as ApprovedIcon,
  // GoEye as ReviewIcon,
  // GoCircleSlash as RejectedIcon,
  GoArchive as AllIcon,
  GoPerson as AuthorIcon,
} from "react-icons/go";
import { FaBloggerB } from "react-icons/fa";
import { BsFilterSquare } from "react-icons/bs";

// Web preview
import Iframe from "sanity-plugin-iframe-pane";
import resolveProductionUrl from "../resolveProductionUrl";

// Seo preview
import SocialPreview from "part:social-preview/component";

// Web preview configuration
const previewURL = rootURLs[env].web;

const childDocument = (documentId) =>
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
    ]);

export default S.listItem()
  .title("Blog")
  .icon(FaBloggerB)
  .child(
    S.list()
      .title("/blog")
      .items([
        S.documentTypeListItem("post")
          .title("All posts")
          .icon(AllIcon)
          .child(
            S.documentTypeList("post")
              .title("All posts")
              .menuItems(S.documentTypeList("post").getMenuItems())
              .child((documentId) => childDocument(documentId))
          ),
        S.listItem()
          .title("Published posts")
          .schemaType("post")
          .icon(BlogIcon)
          .child(
            S.documentList()
              .title("Published posts")
              .menuItems(S.documentTypeList("post").getMenuItems())
              // Only show posts with publish date earlier than now and that is not drafts
              .filter(
                '_type == "post" && publishedAt < now() && !(_id in path("drafts.**"))'
              )
              .child((documentId) => childDocument(documentId))
          ),
        S.listItem()
          .title("Posts by category")
          .icon(BsFilterSquare)
          .child(
            // List out all categories
            S.documentTypeList("category")
              .title("Posts by category")
              .child((catId) =>
                // List out project documents where the _id for the selected
                // category appear as a _ref in the project’s categories array
                S.documentList()
                  .schemaType("post")
                  .title("Posts")
                  .menuItems(S.documentTypeList("post").getMenuItems())
                  .filter('_type == "post" && $catId in categories[]._ref')
                  .params({ catId })
                  .child((documentId) => childDocument(documentId))
              )
          ),
        S.divider(),
        S.documentTypeListItem("author").title("Authors").icon(AuthorIcon),
        S.documentTypeListItem("category").title("Categories"),
      ])
  );
