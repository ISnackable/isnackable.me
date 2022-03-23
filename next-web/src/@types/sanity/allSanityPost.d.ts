/**
 * This file is part of the isnackable.me project.
 * Copyright © 2021-2022 isnackable.me. All rights reserved.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import { SanityImageObject } from "@sanity/image-url/lib/types/types";

export interface AllSanityPost {
  _id: string;
  author: Author;
  body: Body[];
  categories: Category[] | null;
  description: string;
  mainImage: MainImage;
  publishedAt: string;
  slug: string;
  title: string;
}

export interface Author {
  _id: string;
  mainImage: MainImage;
  name: string;
}
export interface Category {
  title: string;
}

export interface MainImage extends SanityImageObject {
  alt: string;
  caption?: string;
  lqip?: string;
}

export interface Body {
  _key: string;
  _type: string;
  children?: Child[];
  markDefs?: MarkDef[];
  style?: string;
  alt?: string;
  asset?: Asset;
  caption?: string;
  code?: string;
  filename?: string;
  language?: string;
  url?: string;
  highlightedLines?: any[];
}

export interface Child {
  _key: string;
  _type: string;
  marks: string[];
  text: string;
}

export interface MarkDef {
  _key: string;
  _type: string;
  blank?: boolean;
  href?: string;
  reference?: Asset;
}
