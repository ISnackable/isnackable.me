/**
 * This file is part of the isnackable.me project.
 * Copyright © 2021-2022 isnackable.me. All rights reserved.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import { SanityImageObject } from "@sanity/image-url/lib/types/types";

export interface AllSanityProject {
  _id: string;
  mainImage: MainImage;
  title: string;
  description: string;
  projectUrl: string;
}

export interface MainImage extends SanityImageObject {
  alt: string;
  caption?: string;
  lqip?: string;
}
