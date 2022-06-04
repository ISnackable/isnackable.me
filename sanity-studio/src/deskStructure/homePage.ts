/**
 * This file is part of the isnackable.me project.
 * Copyright © 2021-2022 isnackable.me. All rights reserved.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import S from "@sanity/desk-tool/structure-builder";
import { AiFillHome } from "react-icons/ai";

export default S.documentListItem()
  .title("Home page")
  .icon(AiFillHome)
  .schemaType("homePage")
  .child(
    S.editor()
      .title("Home page")
      .id("homePage")
      .schemaType("homePage")
      .documentId("homePage")
  );
