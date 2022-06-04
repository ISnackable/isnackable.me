/**
 * This file is part of the isnackable.me project.
 * Copyright © 2021-2022 isnackable.me. All rights reserved.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import S from "@sanity/desk-tool/structure-builder";

// import author from "./authors";
import blog from "./blog";
// import categories from "./categories";
import projects from "./projects";

// Hide document types that we already have a structure definition for
const hiddenDocTypes = (listItem) =>
  !["author", "post", "category", "project"].includes(listItem.getId());

export default () =>
  S.list()
    .title("Content")
    .items([
      // author,
      blog,
      // categories,
      projects,
      S.divider(),
      ...S.documentTypeListItems().filter(hiddenDocTypes),
    ]);
