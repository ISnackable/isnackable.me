/**
 * This file is part of the isnackable.me project.
 * Copyright © 2021-2022 isnackable.me. All rights reserved.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
export * from "./allSanityPost";
export * from "./allSanityCategory";
export * from "./allSanityProject";

export interface GenericSanityDocument {
  _id: string;
  type?: string;
  _createdAt?: string;
  _updatedAt?: string;
}
