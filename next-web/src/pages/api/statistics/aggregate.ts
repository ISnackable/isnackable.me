/**
 * This file is part of the isnackable.me project.
 * Copyright © 2021-2022 isnackable.me. All rights reserved.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { siteUrl } from "@lib/config";
import { JSend } from "../../../@types/JSend";

const SITE_ID = siteUrl.replace("https://", "");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<JSend>
) {
  const result = await fetch(
    `https://plausible.io/api/v1/stats/aggregate?site_id=${SITE_ID}&period=30d&metrics=visitors,pageviews,bounce_rate,visit_duration&compare=previous_period`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.PLAUSIBLE_API_TOKEN}`
      }
    }
  );

  const data = await result.json();

  if (!result.ok) {
    return res.status(500).json({
      status: "error",
      message: "Error retrieving aggregates metrics"
    });
  }

  const bounceRate = data.results?.bounce_rate;
  const pageviews = data.results?.pageviews;
  const visitDuration = data.results?.visit_duration;
  const visitors = data.results?.visitors;

  res.setHeader(
    "Cache-Control",
    "public, s-maxage=60, stale-while-revalidate=60"
  );

  return res.status(200).json({
    status: "success",
    data: {
      bounce_rate: bounceRate,
      pageviews: pageviews,
      visit_duration: visitDuration,
      visitors: visitors
    },
    message: "Successfully retrieved aggregates metrics"
  });
}
