/**
 * This file is part of the isnackable.me project.
 * Copyright © 2021-2022 isnackable.me. All rights reserved.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
// First, we must import the schema creator
import createSchema from "part:@sanity/base/schema-creator";

// Then import schema types from any plugins that might expose them
import schemaTypes from "all:part:@sanity/base/schema-type";

// We import object and document schemas
import blockContent from "./arrays/blockContent";
import {
  author,
  post,
  category,
  homePage,
  project,
  siteSettings,
} from "./documents";
import {
  externalImage,
  figure,
  mainImage,
  openGraph,
  pageBreak,
} from "./objects";

import * as plugs from "./plugs";
import plugDefaultFields from "./plugs/_plugDefaultFields";

const allPlugs = Object.values(plugs).map((plug) => {
  return { ...plug, fields: plugDefaultFields.concat(plug.fields) };
});

// Then we give our schema to the builder and provide the result to Sanity
export default createSchema({
  // We name our schema
  name: "default",
  // Then proceed to concatenate our document type
  // to the ones provided by any plugins that are installed
  types: schemaTypes
    .concat([
      // The following are document types which will appear
      // in the studio.
      author,
      post,
      category,
      homePage,
      project,
      siteSettings,
      // When added to this list, object types can be used as
      // { type: 'typename' } in other document schemas
      blockContent,
      externalImage,
      figure,
      mainImage,
      openGraph,
      pageBreak,
    ])
    .concat(allPlugs),
});
