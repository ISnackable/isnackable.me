/**
 * This file is part of the isnackable.me project.
 * Copyright © 2021-2022 isnackable.me. All rights reserved.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import S from "@sanity/desk-tool/structure-builder";

import { RiMiniProgramFill } from "react-icons/ri";

export default S.listItem()
  .title("Project")
  .icon(RiMiniProgramFill)
  .schemaType("project")
  .child(S.documentTypeList("project").title("/projects"));
