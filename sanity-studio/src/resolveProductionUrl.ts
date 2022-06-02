/**
 * This file is part of the isnackable.me project.
 * Copyright © 2021-2022 isnackable.me. All rights reserved.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import { env, rootURLs } from "./urlResolver";

const previewSecret = process.env.SANITY_STUDIO_PREVIEW_SECRET;

export default function resolveProductionUrl(document) {
  if (!["post"].includes(document._type)) {
    return null;
  }

  const previewUrl = new URL(rootURLs[env].web);
  previewUrl.pathname = `/api/preview`;
  previewUrl.searchParams.append(`secret`, previewSecret);

  switch (document._type) {
    case "post":
      previewUrl.searchParams.append(
        `slug`,
        `blog/${document?.slug?.current}` ?? `/`
      );
      break;

    default:
      previewUrl.searchParams.append(`slug`, document?.slug?.current ?? `/`);
      break;
  }

  return previewUrl.toString();
}
