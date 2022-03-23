/**
 * This file is part of the isnackable.me project.
 * Copyright © 2021-2022 isnackable.me. All rights reserved.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
/* eslint-disable */
import format from "date-fns/format";
import isFuture from "date-fns/isFuture";
import parseISO from "date-fns/parseISO";

export const filterOutDocsWithoutSlugs = ({ slug }: { slug: string }) => {
  return slug;
};

export const filterOutDocsPublishedInTheFuture = ({
  publishedAt
}: {
  publishedAt: string;
}) => {
  try {
    return !isFuture(parseISO(publishedAt));
  } catch (error) {
    return;
  }
};

export const toPlainText = (blocks: any[]) => {
  if (!blocks) {
    return "";
  }
  return blocks
    .map((block) => {
      if (block?._type !== "block" || !block?.children) {
        return "";
      }
      return block?.children.map((child: any) => child?.text).join("");
    })
    .join("\n\n");
};

export const toDateString = (iso: string) => {
  if (!iso) {
    return "";
  }
  return format(parseISO(iso), "EEEE, dd MMMM yyyy");
};
