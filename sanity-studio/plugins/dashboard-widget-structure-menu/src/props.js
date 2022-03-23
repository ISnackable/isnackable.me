/**
 * This file is part of the isnackable.me project.
 * Copyright © 2021-2022 isnackable.me. All rights reserved.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import { combineLatest } from "rxjs";
import { map } from "rxjs/operators";
import { loadStructure } from "./lib/structure";

export function toPropsStream(props$) {
  const structure$ = loadStructure();

  return combineLatest([props$, structure$]).pipe(
    map(([props, structure]) => ({ ...props, structure }))
  );
}
