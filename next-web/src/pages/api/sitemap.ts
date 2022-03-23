/**
 * This file is part of the isnackable.me project.
 * Copyright © 2021-2022 isnackable.me. All rights reserved.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import type { NextApiRequest, NextApiResponse } from "next";
import groq from "groq";
import { sanityClient } from "@lib/sanity.server";
import { siteUrl } from "@lib/config";

interface SanityPostSlug {
  slug: { current: string };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const postsSlug: SanityPostSlug[] = await sanityClient.fetch(groq`
*[_type == "post" && !(_id in path('drafts.**'))]{
    slug
}|order(publishedAt desc)
  `);

  const localRoutes = [
    "/index",
    "/projects",
    "/files",
    "/blog" /*, "/privacy" */
  ];
  const blogRoutes = postsSlug
    .filter(({ slug = { current: "" } }) => slug.current)
    .map((post) => {
      return `/blog/${post.slug.current}`;
    });

  const pages = [...localRoutes, ...blogRoutes];

  const urlSet = pages
    .map((page) => {
      const route = page === "/index" ? "" : page;
      // Build url portion of sitemap.xml
      return `<url>
  <loc>${siteUrl}${route}</loc>
  <changefreq>daily</changefreq>
  <priority>0.7</priority>
</url>`;
    })
    .join("");

  // Add urlSet to entire sitemap string
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
  ${urlSet}
</urlset>`;

  // set response content header to xml
  res.setHeader("Content-Type", "text/xml");
  // write the sitemap
  res.write(sitemap);
  res.end();
}
