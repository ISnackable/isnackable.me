/**
 * This file is part of the isnackable.me project.
 * Copyright © 2021-2022 isnackable.me. All rights reserved.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { JSend } from "../../@types/JSend";

const SANITY_PREVIEW_SECRET = process.env.SANITY_PREVIEW_SECRET;

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<JSend>
) {
  if (!req?.query?.secret) {
    return res.status(401).json({ status: "fail", message: "No secret token" });
  }

  // Check the secret and next parameters
  // This secret should only be known to this API route and the CMS
  if (req.query.secret !== SANITY_PREVIEW_SECRET) {
    return res
      .status(401)
      .json({ status: "fail", message: "Invalid secret token" });
  }

  if (!req.query.slug) {
    return res.status(401).json({ status: "fail", message: "No slug" });
  }

  // Enable Preview Mode by setting the cookies
  res.setPreviewData({});

  // Redirect to the path from the fetched post
  // We don't redirect to req.query.slug as that might lead to open redirect vulnerabilities
  res.writeHead(307, { Location: `/${req?.query?.slug}` ?? `/` });

  return res.end();
}
