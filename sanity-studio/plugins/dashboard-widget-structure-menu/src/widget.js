/**
 * This file is part of the isnackable.me project.
 * Copyright © 2021-2022 isnackable.me. All rights reserved.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import { withPropsStream } from "react-props-stream";
import { withRouterHOC } from "part:@sanity/base/router";
import { StructureMenuWidget } from "./components";
import { toPropsStream } from "./props";

export default {
  name: "structure-menu",
  component: withRouterHOC(withPropsStream(toPropsStream, StructureMenuWidget)),
  layout: { width: "full" },
};
