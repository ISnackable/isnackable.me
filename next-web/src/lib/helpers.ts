/**
 * This file is part of the isnackable.me project.
 * Copyright © 2021-2022 isnackable.me. All rights reserved.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import { formatInTimeZone, toDate } from "date-fns-tz";
import isFuture from "date-fns/isFuture";

export const filterOutDocsWithoutSlugs = ({ slug }: { slug: string }) => {
  return slug;
};

export const filterOutDocsPublishedInTheFuture = ({
  publishedAt
}: {
  publishedAt: string;
}) => {
  try {
    return !isFuture(toDate(publishedAt, { timeZone: "Asia/Singapore" }));
  } catch (error) {
    return;
  }
};

export const toDateString = (iso: string) => {
  if (!iso) {
    return "";
  }
  return formatInTimeZone(iso, "Asia/Singapore", "EEEE, dd MMMM yyyy");
};
